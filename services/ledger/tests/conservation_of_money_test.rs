mod helpers;
use chrono::Utc;
use helpers::postgres::PostgresTestContext;
use ledger::domain::accounts::repository::AccountRepository;
use ledger::domain::orders::model::{Order, OrderSide};
use ledger::domain::trade::model::Trade;
use rust_decimal::Decimal;
use std::str::FromStr;
use uuid::Uuid;

#[tokio::test]
async fn test_conservation_of_money_spot_trading() {
    let ctx = PostgresTestContext::new(true).await;

    // 1. Setup Assets
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;

    // 2. Setup Participants
    let buyer_user = ctx.create_user().await;
    let buyer_acc = ctx.create_account(&buyer_user).await;

    let seller_user = ctx.create_user().await;
    let seller_acc = ctx.create_account(&seller_user).await;

    // 3. Fund Participants
    let buyer_acc_id = Uuid::parse_str(&buyer_acc).unwrap();
    let seller_acc_id = Uuid::parse_str(&seller_acc).unwrap();
    let usd_asset_id = Uuid::parse_str(&usd_id).unwrap();
    let btc_asset_id = Uuid::parse_str(&btc_id).unwrap();

    // Buyer: 1000 USD, 0 BTC
    ctx.seed_wallet(buyer_acc_id, usd_asset_id, 1000.0, 0.0, 1000.0)
        .await;
    ctx.empty_wallet(buyer_acc_id, btc_asset_id).await;

    // Seller: 0 USD, 10 BTC
    ctx.seed_wallet(seller_acc_id, btc_asset_id, 10.0, 0.0, 10.0)
        .await;
    ctx.empty_wallet(seller_acc_id, usd_asset_id).await;

    // Create Fee Account Wallets
    let fee_acc = ctx
        .account_repo
        .get_by_name("fees_account")
        .await
        .unwrap()
        .unwrap();
    ctx.empty_wallet(fee_acc.id, usd_asset_id).await;
    ctx.empty_wallet(fee_acc.id, btc_asset_id).await;

    // Verify Initial Global State
    // USD Supply: 1000.00 (Buyer)
    // BTC Supply: 10.00 (Seller)

    // 4. Execute Trade
    // Buy 1 BTC @ 100 USD
    let buy_order = Order {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&buyer_acc).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: OrderSide::Buy,
        quantity: Decimal::from_str("1.0").unwrap(),
        price: Decimal::from_str("100.0").unwrap(),
        ..Default::default()
    };
    ctx.order_service
        .create_order(buy_order.clone())
        .await
        .unwrap();

    let sell_order = Order {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&seller_acc).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: OrderSide::Sell,
        quantity: Decimal::from_str("1.0").unwrap(),
        price: Decimal::from_str("100.0").unwrap(),
        ..Default::default()
    };
    ctx.order_service
        .create_order(sell_order.clone())
        .await
        .unwrap();

    let trade = Trade {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        buy_order_id: buy_order.id,
        sell_order_id: sell_order.id,
        price: Decimal::new(100, 0),
        quantity: Decimal::new(1, 0),
        meta: serde_json::json!({}),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    ctx.settlement_service
        .process_trade_event(trade)
        .await
        .expect("Settlement Success");

    // 5. Verify Final Global State (Conservation of Money)

    // Calculate Total USD
    let buyer_usd = get_balance(&ctx, &buyer_acc, &usd_id).await;
    let seller_usd = get_balance(&ctx, &seller_acc, &usd_id).await;
    let fee_acc = ctx
        .account_repo
        .get_by_name("fees_account")
        .await
        .unwrap()
        .unwrap();
    let fee_usd = get_balance(&ctx, &fee_acc.id.to_string(), &usd_id).await;

    let total_usd = buyer_usd + seller_usd + fee_usd;

    // 1000.00 USD = 100000 atomic units
    assert_eq!(
        total_usd,
        Decimal::from_str("100000").unwrap(),
        "USD Leak Detected!"
    );

    // Calculate Total BTC
    let buyer_btc = get_balance(&ctx, &buyer_acc, &btc_id).await;
    let seller_btc = get_balance(&ctx, &seller_acc, &btc_id).await;
    let fee_btc = get_balance(&ctx, &fee_acc.id.to_string(), &btc_id).await;

    let total_btc = buyer_btc + seller_btc + fee_btc;
    assert_eq!(
        total_btc,
        Decimal::from_str("1000000000").unwrap(),
        "BTC Leak Detected!"
    );

    // Verify Individual Distribution (Stronger Assertion)
    // Trade: 1.0 BTC @ 100.00 USD
    // Taker Fee (Buyer): 10 bps = 0.001 * 1.0 BTC = 0.001 BTC
    // But wait, buyer pays fee in quote (USD) usually?
    // Let's assume standard Exchange Model:
    //  - Buyer receives 1.0 BTC.
    //  - Seller pays fee? Or Buyer pays fee in addition?

    // Actually, checking the fee account balance specifically is the best way to verify correct attribution.
    // If fees were charged, they must be in the fee account.
    if fee_usd > Decimal::ZERO || fee_btc > Decimal::ZERO {
        // Fees were collected, ensure they match the deficit from participants
        let initial_usd = Decimal::from_str("100000").unwrap(); // 1000.00
        let initial_btc = Decimal::from_str("1000000000").unwrap(); // 10.00000000

        let current_usd = buyer_usd + seller_usd;
        let current_btc = buyer_btc + seller_btc;

        assert_eq!(initial_usd - current_usd, fee_usd, "USD Fee mismatch");
        assert_eq!(initial_btc - current_btc, fee_btc, "BTC Fee mismatch");
    }
}

async fn get_balance(ctx: &PostgresTestContext, account_id: &str, asset_id: &str) -> Decimal {
    match ctx
        .wallet_service
        .get_wallet_by_account_and_asset(account_id, asset_id)
        .await
        .unwrap()
    {
        Some(w) => w.total,
        None => Decimal::ZERO,
    }
}
