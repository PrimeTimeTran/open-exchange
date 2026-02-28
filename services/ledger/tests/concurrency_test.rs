use ledger::domain::ledger::model::LedgerEntry;
use rust_decimal::Decimal;
use std::sync::Arc;
use tokio::task::JoinSet;
use uuid::Uuid;

mod helpers;
use helpers::postgres::{atomic, PostgresTestContext};

#[tokio::test]
async fn test_concurrency_lost_updates() {
    // 1. Setup Shared DB Context (must use shared DB to allow concurrent connections)
    // We force isolated=false to use the connection pool effectively
    let ctx = Arc::new(PostgresTestContext::new(true).await);

    let asset_id = ctx.create_asset("USDT", 2).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    // 2. Initial Balance: $100.00
    let account_uuid = Uuid::parse_str(&account_id).unwrap();
    let asset_uuid = Uuid::parse_str(&asset_id).unwrap();

    let wallet = ctx
        .seed_wallet(account_uuid, asset_uuid, 100.0, 0.0, 100.0)
        .await;
    let wallet_id = wallet.id;

    // 3. Concurrent Load: 10 tasks, each deducting $10.00
    // Total deduction should be $100.00, leaving $0.00.
    let num_tasks = 10;
    let deduction_amount = "10.00";
    let deduction_atomic = atomic(deduction_amount, 2); // 1000

    let mut set = JoinSet::new();

    for _ in 0..num_tasks {
        let ctx_clone = ctx.clone();
        let account_id_clone = account_id.clone();
        let asset_id_clone = asset_id.clone();
        let deduction_atomic_clone = deduction_atomic.clone();
        let tenant_id_clone = ctx.tenant_id.clone();
        let tx_manager_clone = ctx.tx_manager.clone();

        set.spawn(async move {
            let entry = LedgerEntry {
                id: Uuid::new_v4(),
                tenant_id: Uuid::parse_str(&tenant_id_clone).unwrap(),
                event_id: Uuid::new_v4(),
                account_id: Uuid::parse_str(&account_id_clone).unwrap(),
                amount: -deduction_atomic_clone,
                meta: serde_json::json!({"asset": asset_id_clone, "type": "debit"}),
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            };

            // Retry loop for handling OptimisticLockingError
            // Even with FOR UPDATE, in high concurrency with Read Committed isolation,
            // timing issues or deadlocks can sometimes cause failures.
            // A robust system must handle retries.
            let mut attempts = 0;
            loop {
                attempts += 1;
                // Start a transaction so we can lock the wallet row
                let mut tx = tx_manager_clone.begin().await.expect("Failed to begin tx");

                // This calls process_ledger_entry_with_tx -> get_for_update -> update
                match ctx_clone
                    .wallet_service
                    .process_ledger_entry_with_tx(&mut *tx, entry.clone())
                    .await
                {
                    Ok(_) => {
                        tx.commit().await.expect("Commit failed");
                        break;
                    }
                    Err(ledger::error::AppError::OptimisticLockingError(_)) => {
                        if attempts >= 10 {
                            panic!("Max retries exceeded for OptimisticLockingError");
                        }
                        // Backoff slightly
                        tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
                        continue;
                    }
                    Err(e) => panic!("Process entry failed: {:?}", e),
                }
            }
        });
    }

    // 4. Wait for all tasks
    while let Some(res) = set.join_next().await {
        res.unwrap(); // Propagate panic if task failed
    }

    // 5. Verification
    let wallet = ctx
        .wallet_service
        .get_wallet(&wallet_id.to_string())
        .await
        .unwrap()
        .unwrap();

    // Logic check: "debit" type updates LOCKED and TOTAL, not AVAILABLE.
    // Initial: Avail 10000, Locked 0, Total 10000.
    // 10 Tasks * -1000 = -10000.
    // Final Locked: 0 + (-10000) = -10000.
    // Final Total: 10000 + (-10000) = 0.
    // Final Avail: 10000 (Unchanged).

    let final_total = wallet.total;
    let expected_balance = Decimal::ZERO;

    // If locking fails, some updates will be lost, and total > 0
    assert_eq!(
        final_total, expected_balance,
        "Lost Update Detected! Total should be 0"
    );
}
