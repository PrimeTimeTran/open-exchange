mod helpers;
use helpers::postgres::PostgresTestContext;
use ledger::domain::orders::model::{Order, OrderSide};
use rust_decimal::Decimal;
use std::str::FromStr;
use uuid::Uuid;

#[tokio::test]
async fn test_create_order_idempotency() {
    let ctx = PostgresTestContext::new(true).await;
    let asset_id = ctx.create_asset("USDT", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USDT", &btc_id, &asset_id).await;

    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    // Fund: 1000 USDT
    let asset_uuid = Uuid::parse_str(&asset_id).unwrap();
    let account_uuid = Uuid::parse_str(&account_id).unwrap();
    let _wallet = ctx
        .seed_wallet(account_uuid, asset_uuid, 1000.0, 0.0, 1000.0)
        .await;

    // Check funds
    let w_check = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&account_id, &asset_id)
        .await
        .unwrap();
    if let Some(w) = &w_check {
        println!(
            "Initial Wallet Balance: Available={}, Locked={}, Asset={}",
            w.available, w.locked, w.asset_id
        );
    } else {
        println!("Wallet NOT FOUND after creation!");
    }

    let order = Order::new(
        Uuid::parse_str(&ctx.tenant_id).unwrap(),
        Uuid::parse_str(&account_id).unwrap(),
        Uuid::parse_str(&instr_id).unwrap(),
        OrderSide::Buy,
        ledger::domain::orders::model::OrderType::Limit, // Default is Limit
        Decimal::from_str("1.0").unwrap(),
        Decimal::from_str("100.0").unwrap(), // Cost: 100 USDT
    );

    // 1. First Request
    let res1 = ctx.order_service.create_order(order.clone()).await;
    if let Err(e) = &res1 {
        println!("Create Order Error: {:?}", e);
    }
    assert!(res1.is_ok());

    let w1 = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&account_id, &asset_id)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(w1.locked, Decimal::from_str("10000").unwrap()); // 100.00 * 100
    assert_eq!(w1.available, Decimal::from_str("90000").unwrap()); // (1000 - 100) * 100

    // 2. Second Request (Duplicate)
    let res2 = ctx.order_service.create_order(order.clone()).await;
    assert!(res2.is_ok()); // Should succeed (idempotent success)

    let w2 = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&account_id, &asset_id)
        .await
        .unwrap()
        .unwrap();

    // Balance should NOT change again
    assert_eq!(w2.locked, Decimal::from_str("10000").unwrap());
    assert_eq!(w2.available, Decimal::from_str("90000").unwrap());
}
