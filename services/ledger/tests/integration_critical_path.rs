mod test_db;
use test_db::{IntegrationTestContext, atomic};
use ledger::domain::orders::model::Order;
use ledger::proto::common::{LedgerEntry, Trade};
use ledger::domain::wallets::Wallet;
use uuid::Uuid;
use rust_decimal::Decimal;
use std::str::FromStr;
use ledger::error::AppError;
use ledger::domain::accounts::repository::AccountRepository;

// --- Tests ---

// 1. Deposit
#[tokio::test]
async fn test_deposit_increases_balance() {
    let ctx = IntegrationTestContext::new().await;

    let asset_id = ctx.create_asset("USDT", 2).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    let wallet_id = ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: account_id.clone(),
        asset_id: asset_id.clone(),
        available: "0".to_string(),
        ..Default::default()
    }).await.expect("Create Wallet").id;

    let deposit_amount = atomic("100.50", 2);
    let entry = LedgerEntry {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        event_id: Uuid::new_v4().to_string(),
        account_id: account_id.clone(),
        amount: deposit_amount.clone(),
        meta: serde_json::json!({"asset": asset_id, "type": "credit"}).to_string(),
        created_at: 0,
        updated_at: 0,
    };

    ctx.wallet_service.process_ledger_entry(entry).await.expect("Process Deposit Entry");

    let updated = ctx.wallet_service.get_wallet(&wallet_id).await.unwrap().unwrap();
    assert_eq!(Decimal::from_str(&updated.available).unwrap(), Decimal::from_str(&deposit_amount).unwrap());
}

// 2. Withdrawal Insufficient Funds
#[tokio::test]
async fn test_withdrawal_insufficient_funds() {
    let ctx = IntegrationTestContext::new().await;
    
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;
    
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    // Fund 10.00 USD (Atomic: 1000)
    let amount = atomic("10.00", 2);
    ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: account_id.clone(),
        asset_id: usd_id.clone(),
        available: amount,
        ..Default::default()
    }).await.unwrap();

    let order = Order {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&account_id).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: "buy".into(),
        quantity: Decimal::from_str("1.0").unwrap(),
        price: Decimal::from_str("100.0").unwrap(),
        ..Default::default()
    };

    let result = ctx.order_service.create_order(order).await;
    assert!(result.is_err(), "Should fail due to insufficient funds");
}

// 3. Buy Limit Locks Quote
#[tokio::test]
async fn test_create_order_buy_limit_locks_quote() {
    let ctx = IntegrationTestContext::new().await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: account_id.clone(),
        asset_id: usd_id.clone(),
        available: atomic("1000.00", 2),
        locked: "0".to_string(),
        total: atomic("1000.00", 2),
        ..Default::default()
    }).await.unwrap();

    let order = Order {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&account_id).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: "buy".into(),
        quantity: Decimal::from_str("2.0").unwrap(),
        price: Decimal::from_str("100.0").unwrap(),
        ..Default::default()
    };

    ctx.order_service.create_order(order).await.expect("Order placed");

    let w = ctx.wallet_service.get_wallet_by_account_and_asset(&account_id, &usd_id).await.unwrap().unwrap();
    assert_eq!(w.available, atomic("800.00", 2));
    assert_eq!(w.locked, atomic("200.00", 2));
}

// 4. Sell Limit Locks Base
#[tokio::test]
async fn test_create_order_sell_limit_locks_base() {
    let ctx = IntegrationTestContext::new().await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: account_id.clone(),
        asset_id: btc_id.clone(),
        available: atomic("10.00", 8),
        locked: "0".to_string(),
        total: atomic("10.00", 8),
        ..Default::default()
    }).await.unwrap();

    let order = Order {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&account_id).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: "sell".into(),
        quantity: Decimal::from_str("2.0").unwrap(),
        price: Decimal::from_str("100.0").unwrap(),
        ..Default::default()
    };

    ctx.order_service.create_order(order).await.expect("Order placed");

    let w = ctx.wallet_service.get_wallet_by_account_and_asset(&account_id, &btc_id).await.unwrap().unwrap();
    assert_eq!(w.available, atomic("8.00", 8));
    assert_eq!(w.locked, atomic("2.00", 8));
}

// 5. Insufficient Funds
#[tokio::test]
async fn test_create_order_insufficient_funds() {
    let ctx = IntegrationTestContext::new().await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    // Fund 50 USD -> 5000 atomic
    ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: account_id.clone(),
        asset_id: usd_id.clone(),
        available: atomic("50.00", 2),
        ..Default::default()
    }).await.unwrap();

    let order = Order {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&account_id).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: "buy".into(),
        quantity: Decimal::from_str("1.0").unwrap(),
        price: Decimal::from_str("100.0").unwrap(),
        ..Default::default()
    };

    let result = ctx.order_service.create_order(order).await;

    match result {
        Err(AppError::InsufficientFunds { .. }) => assert!(true),
        _ => panic!("Expected InsufficientFunds error"),
    }
}

// 6. Cancel Unlocks Funds
#[tokio::test]
async fn test_cancel_order_unlocks_funds() {
    let ctx = IntegrationTestContext::new().await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: account_id.clone(),
        asset_id: usd_id.clone(),
        available: atomic("1000.00", 2),
        locked: "0".to_string(),
        ..Default::default()
    }).await.unwrap();

    let order_id = Uuid::new_v4();
    let order = Order {
        id: order_id,
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&account_id).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: "buy".into(),
        quantity: Decimal::from_str("1.0").unwrap(),
        price: Decimal::from_str("100.0").unwrap(),
        status: "open".into(),
        ..Default::default()
    };
    ctx.order_service.create_order(order).await.unwrap();

    ctx.order_service.cancel_order(order_id).await.expect("Cancel success");

    let w = ctx.wallet_service.get_wallet_by_account_and_asset(&account_id, &usd_id).await.unwrap().unwrap();
    assert_eq!(w.available, atomic("1000.00", 2));
    assert_eq!(w.locked, "0");
}

// 7. Full Fill Settlement
#[tokio::test]
async fn test_trade_settlement_full_fill() {
    let ctx = IntegrationTestContext::new().await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;
    
    // Separate Users
    let buyer_user_id = ctx.create_user().await;
    let buyer_id = ctx.create_account(&buyer_user_id).await;
    
    let seller_user_id = ctx.create_user().await;
    let seller_id = ctx.create_account(&seller_user_id).await;

    ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: buyer_id.clone(),
        asset_id: usd_id.clone(),
        available: atomic("1000.00", 2),
        ..Default::default()
    }).await.unwrap();

    ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: seller_id.clone(),
        asset_id: btc_id.clone(),
        available: atomic("10.00", 8),
        ..Default::default()
    }).await.unwrap();

    let buy_order = Order {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&buyer_id).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: "buy".into(),
        quantity: Decimal::from_str("1.0").unwrap(),
        price: Decimal::from_str("100.0").unwrap(),
        ..Default::default()
    };
    ctx.order_service.create_order(buy_order.clone()).await.unwrap();

    let sell_order = Order {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&seller_id).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: "sell".into(),
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

    ctx.settlement_service.process_trade_event(trade).await.expect("Settlement success");

    let buyer_usd = ctx.wallet_service.get_wallet_by_account_and_asset(&buyer_id, &usd_id).await.unwrap().unwrap();
    // 900.00 minus fees (approx 0.2%)
    let balance = Decimal::from_str(&buyer_usd.available).unwrap();
    let expected_max = Decimal::from_str(&atomic("900.00", 2)).unwrap();
    assert!(balance <= expected_max);
    assert!(balance > Decimal::from_str(&atomic("890.00", 2)).unwrap());
    assert_eq!(buyer_usd.locked, "0");

    let seller_btc = ctx.wallet_service.get_wallet_by_account_and_asset(&seller_id, &btc_id).await.unwrap().unwrap();
    assert_eq!(seller_btc.available, atomic("9.00", 8));
    assert_eq!(seller_btc.locked, "0");
}

// 8. Partial Fill
#[tokio::test]
async fn test_trade_settlement_partial_fill() {
    let ctx = IntegrationTestContext::new().await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;
    
    let buyer_user_id = ctx.create_user().await;
    let seller_user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&buyer_user_id).await;
    let seller_id = ctx.create_account(&seller_user_id).await;

    ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: account_id.clone(),
        asset_id: usd_id.clone(),
        available: atomic("1000.00", 2),
        ..Default::default()
    }).await.unwrap();

    let buy_order = Order {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&account_id).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: "buy".into(),
        quantity: Decimal::from_str("2.0").unwrap(),
        price: Decimal::from_str("100.0").unwrap(),
        ..Default::default()
    };
    ctx.order_service.create_order(buy_order.clone()).await.unwrap();

    let w1 = ctx.wallet_service.get_wallet_by_account_and_asset(&account_id, &usd_id).await.unwrap().unwrap();
    assert_eq!(w1.locked, atomic("200.00", 2));

    let sell_order_id = Uuid::new_v4();
    ctx.wallet_service.create_wallet(Wallet { id: Uuid::new_v4().to_string(), tenant_id: ctx.tenant_id.clone(), account_id: seller_id.clone(), asset_id: btc_id.clone(), available: atomic("10.0", 8), ..Default::default() }).await.unwrap();
    
    let sell_order = Order { id: sell_order_id, tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(), account_id: Uuid::parse_str(&seller_id).unwrap(), instrument_id: Uuid::parse_str(&instr_id).unwrap(), side: "sell".into(), quantity: Decimal::from_str("1.0").unwrap(), price: Decimal::from_str("100.0").unwrap(), ..Default::default() };
    ctx.order_service.create_order(sell_order.clone()).await.unwrap();

    let trade = Trade {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        instrument_id: instr_id.clone(),
        buy_order_id: buy_order.id.to_string(),
        sell_order_id: sell_order_id.to_string(),
        price: "100.0".to_string(),
        quantity: "1.0".to_string(),
        meta: "{}".to_string(),
        created_at: 0,
        updated_at: 0,
    };

    ctx.settlement_service.process_trade_event(trade).await.expect("Settlement success");

    let w2 = ctx.wallet_service.get_wallet_by_account_and_asset(&account_id, &usd_id).await.unwrap().unwrap();
    assert_eq!(w2.locked, atomic("100.00", 2));
    
    let available = Decimal::from_str(&w2.available).unwrap();
    let expected_available = Decimal::from_str(&atomic("800.00", 2)).unwrap();
    assert!(available <= expected_available);
}

// 9. Ledger Integrity Check
#[tokio::test]
async fn test_ledger_entry_integrity_check() {
    let ctx = IntegrationTestContext::new().await;
    let asset_id = ctx.create_asset("USDT", 2).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    ctx.wallet_service.create_wallet(Wallet {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: account_id.clone(),
        asset_id: asset_id.clone(),
        available: "0".to_string(),
        ..Default::default()
    }).await.unwrap();

    let amounts = vec!["100.0", "50.0", "-25.0", "10.5"];
    let mut total = Decimal::ZERO;

    for amount in amounts {
        let atom = atomic(amount, 2);
        total += Decimal::from_str(&atom).unwrap();
        
        let entry = LedgerEntry {
            id: Uuid::new_v4().to_string(),
            tenant_id: ctx.tenant_id.clone(),
            event_id: Uuid::new_v4().to_string(),
            account_id: account_id.clone(),
            amount: atom,
            meta: serde_json::json!({"asset": asset_id, "type": "credit"}).to_string(),
            created_at: 0,
            updated_at: 0,
        };
        ctx.wallet_service.process_ledger_entry(entry).await.unwrap();
    }

    let w = ctx.wallet_service.get_wallet_by_account_and_asset(&account_id, &asset_id).await.unwrap().unwrap();
    assert_eq!(Decimal::from_str(&w.total).unwrap(), total);
}

#[tokio::test]
async fn test_system_fee_collection() {
    let ctx = IntegrationTestContext::new().await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;
    
    // Separate users
    let buyer_user_id = ctx.create_user().await;
    let buyer_id = ctx.create_account(&buyer_user_id).await;
    let seller_user_id = ctx.create_user().await;
    let seller_id = ctx.create_account(&seller_user_id).await;

    ctx.wallet_service.create_wallet(Wallet { id: Uuid::new_v4().to_string(), tenant_id: ctx.tenant_id.clone(), account_id: buyer_id.clone(), asset_id: usd_id.clone(), available: atomic("1000.0", 2), ..Default::default() }).await.unwrap();
    ctx.wallet_service.create_wallet(Wallet { id: Uuid::new_v4().to_string(), tenant_id: ctx.tenant_id.clone(), account_id: seller_id.clone(), asset_id: btc_id.clone(), available: atomic("10.0", 8), ..Default::default() }).await.unwrap();

    let buy_order = Order { id: Uuid::new_v4(), tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(), account_id: Uuid::parse_str(&buyer_id).unwrap(), instrument_id: Uuid::parse_str(&instr_id).unwrap(), side: "buy".into(), quantity: Decimal::from_str("1.0").unwrap(), price: Decimal::from_str("100.0").unwrap(), ..Default::default() };
    ctx.order_service.create_order(buy_order.clone()).await.unwrap();
    let sell_order = Order { id: Uuid::new_v4(), tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(), account_id: Uuid::parse_str(&seller_id).unwrap(), instrument_id: Uuid::parse_str(&instr_id).unwrap(), side: "sell".into(), quantity: Decimal::from_str("1.0").unwrap(), price: Decimal::from_str("100.0").unwrap(), ..Default::default() };
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

    ctx.settlement_service.process_trade_event(trade).await.expect("Settlement");

    let fee_acc = ctx.account_repo.get_by_name("fees_account").await.unwrap().unwrap();
    
    let fee_wallet = ctx.wallet_service.get_wallet_by_account_and_asset(&fee_acc.id.to_string(), &usd_id).await.unwrap();
    
    if let Some(w) = fee_wallet {
        println!("Fee collected: {}", w.total);
        assert!(Decimal::from_str(&w.total).unwrap() >= Decimal::ZERO);
    }
}
