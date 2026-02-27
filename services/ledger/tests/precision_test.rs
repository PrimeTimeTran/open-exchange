mod helpers;
use helpers::postgres::{atomic, PostgresTestContext};
use ledger::domain::ledger::model::LedgerEntry;
use ledger::domain::wallets::Wallet;
use rust_decimal::Decimal;
use uuid::Uuid;

#[tokio::test]
async fn test_precision_overflow_limits() {
    let ctx = PostgresTestContext::new(true).await;

    // 1. High Precision Asset (18 decimals - e.g., ETH/Wei)
    let eth_id = ctx.create_asset("ETH", 18).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    // Smallest possible unit: 1 Wei (0.000000000000000001 ETH)
    let tiny_amount = "0.000000000000000001";
    let tiny_atomic = atomic(tiny_amount, 18); // Should be "1"

    let wallet_id = ctx
        .wallet_service
        .create_wallet(Wallet {
            id: Uuid::new_v4(),
            tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
            account_id: Uuid::parse_str(&account_id).unwrap(),
            asset_id: Uuid::parse_str(&eth_id).unwrap(),
            available: Decimal::ZERO,
            ..Default::default()
        })
        .await
        .expect("Create Wallet")
        .id;

    // Credit tiny amount
    let entry = LedgerEntry {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        event_id: Uuid::new_v4(),
        account_id: Uuid::parse_str(&account_id).unwrap(),
        amount: tiny_atomic,
        meta: serde_json::json!({"asset": eth_id, "type": "credit"}),
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };
    ctx.wallet_service
        .process_ledger_entry(entry)
        .await
        .unwrap();

    let w = ctx
        .wallet_service
        .get_wallet(&wallet_id.to_string())
        .await
        .unwrap()
        .unwrap();
    assert_eq!(w.available, Decimal::from(1));

    // 2. Large Amount (Trillions) to test overflow safety
    // 1 Trillion ETH = 1,000,000,000,000 * 10^18 atomic units = 10^30
    // rust_decimal (and Postgres NUMERIC) supports up to 96-bit integer significant (approx 7.9e28)
    // Wait, rust_decimal is 96-bit int co-efficient * 10^-scale.
    // Max value is (2^96 - 1) / 10^scale.
    // 2^96 is approx 7.9 x 10^28.

    // If we have 18 decimals, max value is 7.9 x 10^10 (79 Billion ETH).
    // Let's test a safe large value: 1 Billion ETH.
    let large_amount = "1000000000.0";
    let large_atomic = atomic(large_amount, 18);

    let entry_large = LedgerEntry {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        event_id: Uuid::new_v4(),
        account_id: Uuid::parse_str(&account_id).unwrap(),
        amount: large_atomic,
        meta: serde_json::json!({"asset": eth_id, "type": "credit"}),
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };
    ctx.wallet_service
        .process_ledger_entry(entry_large)
        .await
        .unwrap();

    let w2 = ctx
        .wallet_service
        .get_wallet(&wallet_id.to_string())
        .await
        .unwrap()
        .unwrap();
    let total = w2.available;

    let expected = tiny_atomic + large_atomic;
    assert_eq!(total, expected);
}
