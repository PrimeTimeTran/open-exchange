mod helpers;
use ledger::domain::wallets::Wallet;
use ledger::proto::common::LedgerEntry;
use helpers::postgres::{PostgresTestContext, atomic};
use uuid::Uuid;
use std::str::FromStr;
use rust_decimal::Decimal;

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

    let wallet_id = ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: account_id.clone(),
        asset_id: eth_id.clone(),
        available: "0".to_string(),
        ..Default::default()
    }).await.expect("Create Wallet").id;

    // Credit tiny amount
    let entry = LedgerEntry {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        event_id: Uuid::new_v4().to_string(),
        account_id: account_id.clone(),
        amount: tiny_atomic.clone(),
        meta: serde_json::json!({"asset": eth_id, "type": "credit"}).to_string(),
        created_at: 0,
        updated_at: 0,
    };
    ctx.wallet_service.process_ledger_entry(entry).await.unwrap();

    let w = ctx.wallet_service.get_wallet(&wallet_id).await.unwrap().unwrap();
    assert_eq!(w.available, "1");

    // 2. Large Amount (Trillions) to test overflow safety
    // 1 Trillion ETH = 1,000,000,000,000 * 10^18 atomic units = 10^30
    // rust_decimal (and Postgres NUMERIC) supports up to 96-bit integer significand (approx 7.9e28)
    // Wait, rust_decimal is 96-bit int coeff * 10^-scale.
    // Max value is (2^96 - 1) / 10^scale.
    // 2^96 is approx 7.9 x 10^28.
    
    // If we have 18 decimals, max value is 7.9 x 10^10 (79 Billion ETH).
    // Let's test a safe large value: 1 Billion ETH.
    let large_amount = "1000000000.0"; 
    let large_atomic = atomic(large_amount, 18); 
    
    let entry_large = LedgerEntry {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        event_id: Uuid::new_v4().to_string(),
        account_id: account_id.clone(),
        amount: large_atomic.clone(),
        meta: serde_json::json!({"asset": eth_id, "type": "credit"}).to_string(),
        created_at: 0,
        updated_at: 0,
    };
    ctx.wallet_service.process_ledger_entry(entry_large).await.unwrap();
    
    let w2 = ctx.wallet_service.get_wallet(&wallet_id).await.unwrap().unwrap();
    let total = Decimal::from_str(&w2.available).unwrap();
    
    let expected = Decimal::from_str(&tiny_atomic).unwrap() + Decimal::from_str(&large_atomic).unwrap();
    assert_eq!(total, expected);
}
