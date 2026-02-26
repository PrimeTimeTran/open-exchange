mod helpers;
use chrono::Utc;
use helpers::postgres::PostgresTestContext;
use ledger::domain::ledger::model::LedgerEntry;
use ledger::domain::ledger::repository::LedgerRepository;
use ledger::domain::wallets::{Wallet, WalletRepository};
use ledger::infra::repositories::{PostgresLedgerRepository, PostgresWalletRepository};
use ledger::infra::transaction::PostgresTransaction;
use rust_decimal::Decimal;
use std::str::FromStr;
use uuid::Uuid;

#[tokio::test]
async fn test_postgres_wallet_persistence() {
    // 1. Setup DB
    let ctx = PostgresTestContext::new(true).await;
    let repo = PostgresWalletRepository::new(ctx.pool.clone());

    // 2. Setup Data
    let tenant_id = Uuid::new_v4();
    let account_id = Uuid::new_v4();
    let asset_id = Uuid::new_v4();
    let wallet_id = Uuid::new_v4();

    // Insert Tenant
    sqlx::query(
        r#"
        INSERT INTO "Tenant" (id, name, "createdAt", "updatedAt") 
        VALUES ($1, 'Test Tenant', now(), now())
    "#,
    )
    .bind(tenant_id)
    .execute(&ctx.pool)
    .await
    .expect("Failed to insert event");

    // Insert Account (userId is null)
    // Note: 'type' is a reserved keyword in some SQL contexts, usually safe in string literals or quoted identifiers?
    // In Postgres, type is reserved? No, but generally good to quote identifiers.
    // Schema says: type String
    sqlx::query(
        r#"
        INSERT INTO "Account" (id, "tenantId", type, name, "createdAt", "updatedAt") 
        VALUES ($1, $2, 'USER', 'Test Account', now(), now())
    "#,
    )
    .bind(account_id)
    .bind(tenant_id)
    .execute(&ctx.pool)
    .await
    .expect("Failed to insert account");

    // Insert Asset
    sqlx::query(
        r#"
        INSERT INTO "Asset" (id, "tenantId", symbol, decimals, "createdAt", "updatedAt") 
        VALUES ($1, $2, 'USD', 2, now(), now())
    "#,
    )
    .bind(asset_id)
    .bind(tenant_id)
    .execute(&ctx.pool)
    .await
    .expect("Failed to insert asset");

    // 3. Test Create Wallet
    let wallet = Wallet {
        id: wallet_id.to_string(),
        tenant_id: tenant_id.to_string(),
        account_id: account_id.to_string(),
        asset_id: asset_id.to_string(),
        available: "100.00".to_string(),
        locked: "0.00".to_string(),
        total: "100.00".to_string(),
        user_id: "".to_string(),
        version: 1,
        status: "active".to_string(),
        meta: "{}".to_string(),
        created_at: Utc::now().timestamp_millis(),
        updated_at: Utc::now().timestamp_millis(),
    };

    let created = repo
        .create(wallet.clone())
        .await
        .expect("Failed to create wallet");
    assert_eq!(created.id, wallet.id);

    // 4. Test Get Wallet
    let fetched = repo
        .get(wallet_id)
        .await
        .expect("Failed to get wallet")
        .expect("Wallet not found");
    assert_eq!(
        Decimal::from_str(&fetched.available).unwrap(),
        Decimal::from_str("100").unwrap()
    );

    // 5. Test Update Wallet (Optimistic Locking)
    let mut updated = fetched.clone();
    updated.available = "50.00".to_string(); // Will be stored as 50
    updated.total = "50.00".to_string();

    // Success case
    let saved = repo
        .update(updated.clone())
        .await
        .expect("Failed to update wallet");
    assert_eq!(saved.version, 2);
    assert_eq!(
        Decimal::from_str(&saved.available).unwrap(),
        Decimal::from_str("50").unwrap()
    );

    // Failure case (Old Version)
    let mut old_version = updated.clone();
    old_version.version = 1; // Should be 2 now
    let result = repo.update(old_version).await;
    assert!(result.is_err(), "Should fail with optimistic locking error");

    // Verify error type if possible (string check)
    let err_msg = format!("{:?}", result.err().unwrap());
    assert!(
        err_msg.contains("OptimisticLockingError"),
        "Expected OptimisticLockingError, got {}",
        err_msg
    );
}

#[tokio::test]
async fn test_postgres_ledger_batch_insert() {
    let ctx = PostgresTestContext::new(true).await;
    let repo = PostgresLedgerRepository::new(ctx.pool.clone());

    // Setup Tenant, Account, Event dependencies
    let tenant_id = Uuid::new_v4();
    let account_id = Uuid::new_v4();
    let event_id = Uuid::new_v4();

    sqlx::query(
        r#"
        INSERT INTO "Tenant" (id, name, "createdAt", "updatedAt") 
        VALUES ($1, 'Test Tenant', now(), now())
    "#,
    )
    .bind(tenant_id)
    .execute(&ctx.pool)
    .await
    .expect("Failed to insert tenant");

    sqlx::query(
        r#"
        INSERT INTO "Account" (id, "tenantId", type, name, "createdAt", "updatedAt") 
        VALUES ($1, $2, 'USER', 'Test Account', now(), now())
    "#,
    )
    .bind(account_id)
    .bind(tenant_id)
    .execute(&ctx.pool)
    .await
    .expect("Failed to insert account");

    // Insert LedgerEvent manually
    sqlx::query(
        r#"
        INSERT INTO "LedgerEvent" (id, "tenantId", type, "referenceId", "referenceType", status, description, meta, "createdAt", "updatedAt")
        VALUES ($1, $2, 'trade', 'ref-123', 'trade', 'completed', 'desc', '{}', now(), now())
    "#
    )
        .bind(event_id)
        .bind(tenant_id)
        .execute(&ctx.pool).await
        .expect("Failed to insert asset");

    // Create entries
    let mut entries = Vec::new();
    for i in 0..10 {
        entries.push(LedgerEntry {
            id: Uuid::new_v4(),
            tenant_id,
            event_id,
            account_id,
            amount: Decimal::from(i + 1),
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        });
    }

    let mut conn = ctx
        .pool
        .acquire()
        .await
        .expect("Failed to acquire connection");
    sqlx::Executor::execute(&mut *conn, "BEGIN")
        .await
        .expect("Failed to begin transaction");
    let mut pg_tx = PostgresTransaction { conn };

    let result = repo.save_entries_with_tx(&mut pg_tx, entries.clone()).await;
    assert!(result.is_ok(), "Save entries failed: {:?}", result.err());

    sqlx::Executor::execute(&mut *pg_tx.conn, "COMMIT")
        .await
        .expect("Failed to commit tx");

    // Verify
    let count: i64 = sqlx::query_scalar::<_, i64>(
        r#"SELECT count(*) as count FROM "LedgerEntry" WHERE "eventId" = $1"#,
    )
    .bind(event_id)
    .fetch_one(&ctx.pool)
    .await
    .expect("Failed to fetch count");

    assert_eq!(count, 10);
}
