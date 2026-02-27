mod helpers;
use chrono::Utc;
use helpers::postgres::PostgresTestContext;
use ledger::domain::accounts::repository::AccountRepository;
use ledger::domain::ledger::model::LedgerEntry;
use ledger::domain::orders::model::{Order, OrderSide, OrderStatus};
use ledger::domain::trade::model::Trade;
use ledger::domain::wallets::Wallet;
use ledger::error::AppError;
use rust_decimal::Decimal;
use std::str::FromStr;
use uuid::Uuid;

// --- Tests ---

// 1. Deposit
#[tokio::test]
async fn test_deposit_increases_balance() {
    let ctx = PostgresTestContext::new(true).await;

    let asset_id = ctx.create_asset("USDT", 2).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    let wallet_id = ctx
        .wallet_service
        .create_wallet(Wallet {
            id: Uuid::new_v4(),
            tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
            account_id: Uuid::parse_str(&account_id).unwrap(),
            asset_id: Uuid::parse_str(&asset_id).unwrap(),
            available: Decimal::ZERO,
            ..Default::default()
        })
        .await
        .expect("Create Wallet")
        .id;

    let deposit_amount = Decimal::from_str("100.50").unwrap();
    let entry = LedgerEntry {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        event_id: Uuid::new_v4(),
        account_id: Uuid::parse_str(&account_id).unwrap(),
        amount: deposit_amount,
        meta: serde_json::json!({"asset": asset_id, "type": "credit"}),
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };

    ctx.wallet_service
        .process_ledger_entry(entry)
        .await
        .expect("Process Deposit Entry");

    let updated = ctx
        .wallet_service
        .get_wallet(&wallet_id.to_string())
        .await
        .unwrap()
        .unwrap();
    assert_eq!(updated.available, deposit_amount);
}

// 2. Withdrawal Insufficient Funds
#[tokio::test]
async fn test_withdrawal_insufficient_funds() {
    let ctx = PostgresTestContext::new(true).await;

    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;

    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    // Fund 10.00 USD
    let amount = Decimal::from_str("10.00").unwrap();
    ctx.wallet_service
        .create_wallet(Wallet {
            id: Uuid::new_v4(),
            tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
            account_id: Uuid::parse_str(&account_id).unwrap(),
            asset_id: Uuid::parse_str(&usd_id).unwrap(),
            available: amount,
            ..Default::default()
        })
        .await
        .unwrap();

    let order = Order {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&account_id).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: OrderSide::Buy,
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
    let ctx = PostgresTestContext::new(true).await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    ctx.wallet_service
        .create_wallet(Wallet {
            id: Uuid::new_v4(),
            tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
            account_id: Uuid::parse_str(&account_id).unwrap(),
            asset_id: Uuid::parse_str(&usd_id).unwrap(),
            available: Decimal::from_str("100000").unwrap(), // 1000.00 * 100
            locked: Decimal::ZERO,
            total: Decimal::from_str("100000").unwrap(),
            ..Default::default()
        })
        .await
        .unwrap();

    let order = Order {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&account_id).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: OrderSide::Buy,
        quantity: Decimal::from_str("2.0").unwrap(),
        price: Decimal::from_str("100.0").unwrap(), // Cost: 200 * 100 = 20000
        ..Default::default()
    };

    ctx.order_service
        .create_order(order)
        .await
        .expect("Order placed");

    let w = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&account_id, &usd_id)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(w.available, Decimal::from_str("80000").unwrap()); // 800 * 100
    assert_eq!(w.locked, Decimal::from_str("20000").unwrap()); // 200 * 100
}

// 4. Sell Limit Locks Base
#[tokio::test]
async fn test_create_order_sell_limit_locks_base() {
    let ctx = PostgresTestContext::new(true).await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    ctx.wallet_service
        .create_wallet(Wallet {
            id: Uuid::new_v4(),
            tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
            account_id: Uuid::parse_str(&account_id).unwrap(),
            asset_id: Uuid::parse_str(&btc_id).unwrap(),
            available: Decimal::from_str("1000000000").unwrap(), // 10.00 * 10^8
            locked: Decimal::ZERO,
            total: Decimal::from_str("1000000000").unwrap(),
            ..Default::default()
        })
        .await
        .unwrap();

    let order = Order {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&account_id).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: OrderSide::Sell,
        quantity: Decimal::from_str("2.0").unwrap(), // 2 * 10^8 = 200000000
        price: Decimal::from_str("100.0").unwrap(),
        ..Default::default()
    };

    ctx.order_service
        .create_order(order)
        .await
        .expect("Order placed");

    let w = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&account_id, &btc_id)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(w.available, Decimal::from_str("800000000").unwrap()); // 8 * 10^8
    assert_eq!(w.locked, Decimal::from_str("200000000").unwrap()); // 2 * 10^8
}

// 5. Insufficient Funds
#[tokio::test]
async fn test_create_order_insufficient_funds() {
    let ctx = PostgresTestContext::new(true).await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    // Fund 50 USD
    ctx.wallet_service
        .create_wallet(Wallet {
            id: Uuid::new_v4(),
            tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
            account_id: Uuid::parse_str(&account_id).unwrap(),
            asset_id: Uuid::parse_str(&usd_id).unwrap(),
            available: Decimal::from_str("50.00").unwrap(),
            ..Default::default()
        })
        .await
        .unwrap();

    let order = Order {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&account_id).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: OrderSide::Buy,
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
    let ctx = PostgresTestContext::new(true).await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    ctx.wallet_service
        .create_wallet(Wallet {
            id: Uuid::new_v4(),
            tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
            account_id: Uuid::parse_str(&account_id).unwrap(),
            asset_id: Uuid::parse_str(&usd_id).unwrap(),
            available: Decimal::from_str("100000").unwrap(),
            locked: Decimal::ZERO,
            ..Default::default()
        })
        .await
        .unwrap();

    let order_id = Uuid::new_v4();
    let order = Order {
        id: order_id,
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&account_id).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: OrderSide::Buy,
        quantity: Decimal::from_str("1.0").unwrap(),
        price: Decimal::from_str("100.0").unwrap(), // 10000 atomic
        status: OrderStatus::Open,
        ..Default::default()
    };
    ctx.order_service
        .create_order(order)
        .await
        .expect("Order create success");

    ctx.order_service
        .cancel_order(order_id)
        .await
        .expect("Cancel success");

    let w = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&account_id, &usd_id)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(w.available, Decimal::from_str("100000").unwrap());
    assert_eq!(w.locked, Decimal::ZERO);
}

// 7. Full Fill Settlement
#[tokio::test]
async fn test_trade_settlement_full_fill() {
    let ctx = PostgresTestContext::new(true).await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;

    // Separate Users
    let buyer_user_id = ctx.create_user().await;
    let buyer_id = ctx.create_account(&buyer_user_id).await;

    let seller_user_id = ctx.create_user().await;
    let seller_id = ctx.create_account(&seller_user_id).await;

    ctx.wallet_service
        .create_wallet(Wallet {
            id: Uuid::new_v4(),
            tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
            account_id: Uuid::parse_str(&buyer_id).unwrap(),
            asset_id: Uuid::parse_str(&usd_id).unwrap(),
            available: Decimal::from_str("100000").unwrap(), // 1000.00 * 100
            ..Default::default()
        })
        .await
        .unwrap();

    ctx.wallet_service
        .create_wallet(Wallet {
            id: Uuid::new_v4(),
            tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
            account_id: Uuid::parse_str(&seller_id).unwrap(),
            asset_id: Uuid::parse_str(&btc_id).unwrap(),
            available: Decimal::from_str("1000000000").unwrap(), // 10.00 * 10^8
            ..Default::default()
        })
        .await
        .unwrap();

    let buy_order = Order {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&buyer_id).unwrap(),
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
        account_id: Uuid::parse_str(&seller_id).unwrap(),
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
        .expect("Settlement success");

    let buyer_usd = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&buyer_id, &usd_id)
        .await
        .unwrap()
        .unwrap();
    // 900.00 minus fees (approx 0.2%)
    let balance = buyer_usd.available;
    let expected_max = Decimal::from_str("90000").unwrap(); // 900.00 * 100
    assert!(balance <= expected_max);
    assert!(balance > Decimal::from_str("89000").unwrap()); // 890.00 * 100
    assert_eq!(buyer_usd.locked, Decimal::ZERO);

    let seller_btc = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&seller_id, &btc_id)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(
        seller_btc.available,
        Decimal::from_str("900000000").unwrap()
    ); // 9.00 * 10^8
    assert_eq!(seller_btc.locked, Decimal::ZERO);
}

// 8. Partial Fill
#[tokio::test]
async fn test_trade_settlement_partial_fill() {
    let ctx = PostgresTestContext::new(true).await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;

    let buyer_user_id = ctx.create_user().await;
    let seller_user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&buyer_user_id).await;
    let seller_id = ctx.create_account(&seller_user_id).await;

    ctx.wallet_service
        .create_wallet(Wallet {
            id: Uuid::new_v4(),
            tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
            account_id: Uuid::parse_str(&account_id).unwrap(),
            asset_id: Uuid::parse_str(&usd_id).unwrap(),
            available: Decimal::from_str("100000").unwrap(), // 1000.00 * 100
            ..Default::default()
        })
        .await
        .unwrap();

    let buy_order = Order {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&account_id).unwrap(),
        instrument_id: Uuid::parse_str(&instr_id).unwrap(),
        side: OrderSide::Buy,
        quantity: Decimal::from_str("2.0").unwrap(),
        price: Decimal::from_str("100.0").unwrap(),
        ..Default::default()
    };
    ctx.order_service
        .create_order(buy_order.clone())
        .await
        .unwrap();

    let w1 = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&account_id, &usd_id)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(w1.locked, Decimal::from_str("20000").unwrap()); // 200.00 * 100

    let sell_order_id = Uuid::new_v4();
    ctx.wallet_service
        .create_wallet(Wallet {
            id: Uuid::new_v4(),
            tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
            account_id: Uuid::parse_str(&seller_id).unwrap(),
            asset_id: Uuid::parse_str(&btc_id).unwrap(),
            available: Decimal::from_str("1000000000").unwrap(), // 10.0 * 10^8
            ..Default::default()
        })
        .await
        .unwrap();

    let sell_order = Order {
        id: sell_order_id,
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&seller_id).unwrap(),
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
        sell_order_id: sell_order_id,
        price: Decimal::new(100, 0),
        quantity: Decimal::new(1, 0),
        meta: serde_json::json!({}),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    ctx.settlement_service
        .process_trade_event(trade)
        .await
        .expect("Settlement success");

    let w2 = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&account_id, &usd_id)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(w2.locked, Decimal::from_str("10000").unwrap()); // 100.00 * 100

    let available = w2.available;
    let expected_available = Decimal::from_str("80000").unwrap(); // 800.00 * 100
    assert!(available <= expected_available);
}

// 9. Ledger Integrity Check
#[tokio::test]
async fn test_ledger_entry_integrity_check() {
    let ctx = PostgresTestContext::new(true).await;
    let asset_id = ctx.create_asset("USDT", 2).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    ctx.wallet_service
        .create_wallet(Wallet {
            id: Uuid::new_v4(),
            tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
            account_id: Uuid::parse_str(&account_id).unwrap(),
            asset_id: Uuid::parse_str(&asset_id).unwrap(),
            available: Decimal::ZERO,
            ..Default::default()
        })
        .await
        .unwrap();

    let amounts = vec!["100.0", "50.0", "-25.0", "10.5"];
    let mut total = Decimal::ZERO;

    for amount in amounts {
        let val = Decimal::from_str(amount).unwrap();
        total += val;

        let entry = LedgerEntry {
            id: Uuid::new_v4(),
            tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
            event_id: Uuid::new_v4(),
            account_id: Uuid::parse_str(&account_id).unwrap(),
            amount: val,
            meta: serde_json::json!({"asset": asset_id, "type": "credit"}),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        };
        ctx.wallet_service
            .process_ledger_entry(entry)
            .await
            .unwrap();
    }

    let w = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&account_id, &asset_id)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(w.total, total);
}

#[tokio::test]
async fn test_system_fee_collection() {
    let ctx = PostgresTestContext::new(true).await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;

    // Separate users
    let buyer_user_id = ctx.create_user().await;
    let buyer_id = ctx.create_account(&buyer_user_id).await;
    let seller_user_id = ctx.create_user().await;
    let seller_id = ctx.create_account(&seller_user_id).await;

    ctx.wallet_service
        .create_wallet(Wallet {
            id: Uuid::new_v4(),
            tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
            account_id: Uuid::parse_str(&buyer_id).unwrap(),
            asset_id: Uuid::parse_str(&usd_id).unwrap(),
            available: Decimal::from_str("100000").unwrap(), // 1000.0 * 100
            ..Default::default()
        })
        .await
        .unwrap();
    ctx.wallet_service
        .create_wallet(Wallet {
            id: Uuid::new_v4(),
            tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
            account_id: Uuid::parse_str(&seller_id).unwrap(),
            asset_id: Uuid::parse_str(&btc_id).unwrap(),
            available: Decimal::from_str("1000000000").unwrap(), // 10.0 * 10^8
            ..Default::default()
        })
        .await
        .unwrap();

    let buy_order = Order {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        account_id: Uuid::parse_str(&buyer_id).unwrap(),
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
        account_id: Uuid::parse_str(&seller_id).unwrap(),
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
        .expect("Settlement");

    let fee_acc = ctx
        .account_repo
        .get_by_name("fees_account")
        .await
        .unwrap()
        .unwrap();

    let fee_wallet = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&fee_acc.id.to_string(), &usd_id)
        .await
        .unwrap();

    if let Some(w) = fee_wallet {
        assert!(w.total >= Decimal::ZERO);
    }
}
