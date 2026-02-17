mod helpers;
use helpers::postgres::{PostgresTestContext, atomic};
use ledger::domain::orders::model::{Order, OrderSide};
use ledger::domain::wallets::Wallet;
use uuid::Uuid;
use rust_decimal::Decimal;
use std::str::FromStr;

#[tokio::test]
async fn test_create_order_idempotency() {
    let ctx = PostgresTestContext::new(true).await;
    let asset_id = ctx.create_asset("USDT", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USDT", &btc_id, &asset_id).await;
    
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    // Fund: 1000 USDT
    ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: account_id.clone(),
        asset_id: asset_id.clone(),
        available: atomic("1000.00", 2),
        ..Default::default()
    }).await.unwrap();

    let order_id = Uuid::new_v4();
    let order = Order {
        id: order_id,
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&account_id).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: OrderSide::Buy,
        quantity: Decimal::from_str("1.0").unwrap(),
        price: Decimal::from_str("100.0").unwrap(), // Cost: 100 USDT
        ..Default::default()
    };

    // 1. First Request
    let res1 = ctx.order_service.create_order(order.clone()).await;
    assert!(res1.is_ok());

    let w1 = ctx.wallet_service.get_wallet_by_account_and_asset(&account_id, &asset_id).await.unwrap().unwrap();
    assert_eq!(w1.locked, atomic("100.00", 2));
    assert_eq!(w1.available, atomic("900.00", 2)); // 1000 - 100

    // 2. Second Request (Duplicate)
    let res2 = ctx.order_service.create_order(order.clone()).await;
    assert!(res2.is_ok()); // Should succeed (idempotent success)

    let w2 = ctx.wallet_service.get_wallet_by_account_and_asset(&account_id, &asset_id).await.unwrap().unwrap();
    // Verify funds were NOT locked a second time
    assert_eq!(w2.locked, atomic("100.00", 2)); 
    assert_eq!(w2.available, atomic("900.00", 2));
}
