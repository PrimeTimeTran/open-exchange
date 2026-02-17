mod helpers;
use helpers::postgres::{PostgresTestContext, atomic};
use ledger::domain::wallets::Wallet;
use ledger::domain::orders::model::{Order, OrderSide};
use ledger::domain::accounts::repository::AccountRepository;
use ledger::proto::common::Trade;
use uuid::Uuid;
use std::str::FromStr;
use rust_decimal::Decimal;

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
    // Buyer: 1000 USD, 0 BTC
    ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: buyer_acc.clone(),
        asset_id: usd_id.clone(),
        available: atomic("1000.00", 2),
        locked: "0".to_string(),
        total: atomic("1000.00", 2),
        ..Default::default()
    }).await.unwrap();
    
    // Create Buyer BTC wallet (for receiving)
    ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: buyer_acc.clone(),
        asset_id: btc_id.clone(),
        available: "0".to_string(),
        locked: "0".to_string(),
        total: "0".to_string(),
        ..Default::default()
    }).await.unwrap();

    // Seller: 0 USD, 10 BTC
    ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: seller_acc.clone(),
        asset_id: btc_id.clone(),
        available: atomic("10.00", 8),
        locked: "0".to_string(),
        total: atomic("10.00", 8),
        ..Default::default()
    }).await.unwrap();
    
    // Create Seller USD wallet (for receiving)
    ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: seller_acc.clone(),
        asset_id: usd_id.clone(),
        available: "0".to_string(),
        locked: "0".to_string(),
        total: "0".to_string(),
        ..Default::default()
    }).await.unwrap();
    
    // Create Fee Account Wallets
    let fee_acc = ctx.account_repo.get_by_name("fees_account").await.unwrap().unwrap();
    ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: fee_acc.id.to_string(),
        asset_id: usd_id.clone(),
        available: "0".to_string(),
        locked: "0".to_string(),
        total: "0".to_string(),
        ..Default::default()
    }).await.unwrap();
    
    ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: fee_acc.id.to_string(),
        asset_id: btc_id.clone(),
        available: "0".to_string(),
        locked: "0".to_string(),
        total: "0".to_string(),
        ..Default::default()
    }).await.unwrap();

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
    ctx.order_service.create_order(buy_order.clone()).await.unwrap();

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
    ctx.order_service.create_order(sell_order.clone()).await.unwrap();

    let trade = Trade {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        instrument_id: instr_id.clone(),
        buy_order_id: buy_order.id.to_string(),
        sell_order_id: sell_order.id.to_string(),
        price: "100.0".to_string(),
        quantity: "1.0".to_string(),
        meta: "{}".to_string(),
        created_at: 0,
        updated_at: 0,
    };

    ctx.settlement_service.process_trade_event(trade).await.expect("Settlement Success");

    // 5. Verify Final Global State (Conservation of Money)
    
    // Calculate Total USD
    let buyer_usd = get_balance(&ctx, &buyer_acc, &usd_id).await;
    let seller_usd = get_balance(&ctx, &seller_acc, &usd_id).await;
    let fee_acc = ctx.account_repo.get_by_name("fees_account").await.unwrap().unwrap();
    let fee_usd = get_balance(&ctx, &fee_acc.id.to_string(), &usd_id).await;
    
    println!("DEBUG: Buyer USD: {}, Seller USD: {}, Fee USD: {}", buyer_usd, seller_usd, fee_usd);

    let total_usd = buyer_usd + seller_usd + fee_usd;
    
    // 1000.00 USD = 100000 atomic units
    assert_eq!(total_usd, Decimal::from_str("100000").unwrap(), "USD Leak Detected!");

    // Calculate Total BTC
    let buyer_btc = get_balance(&ctx, &buyer_acc, &btc_id).await;
    let seller_btc = get_balance(&ctx, &seller_acc, &btc_id).await;
    let fee_btc = get_balance(&ctx, &fee_acc.id.to_string(), &btc_id).await;

    let total_btc = buyer_btc + seller_btc + fee_btc;
    assert_eq!(total_btc, Decimal::from_str("1000000000").unwrap(), "BTC Leak Detected!");
    
    // Verify Distribution
    // Buyer paid 100 USD + Fee. Seller got 100 USD - Fee? Or Buyer paid fee on top?
    // Standard logic: Taker pays fee.
    // If Buyer is taker (Buy Order matched): Paid 100 + Fee? Or Deducted from 100?
    // Let's assume standard fee model: Fee is deducted from proceeds or added to cost.
    
    // Just verifying the SUM proves money didn't vanish.
}

async fn get_balance(ctx: &PostgresTestContext, account_id: &str, asset_id: &str) -> Decimal {
    match ctx.wallet_service.get_wallet_by_account_and_asset(account_id, asset_id).await.unwrap() {
        Some(w) => Decimal::from_str(&w.total).unwrap(),
        None => Decimal::ZERO,
    }
}
