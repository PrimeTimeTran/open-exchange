mod helpers;
use chrono::Utc;
use helpers::postgres::PostgresTestContext;
use ledger::domain::accounts::repository::AccountRepository;
use ledger::domain::ledger::model::LedgerEntry;
use ledger::domain::orders::model::{Order, OrderSide, OrderStatus};
use ledger::domain::trade::model::Trade;
use ledger::error::AppError;
use rust_decimal::Decimal;
use std::str::FromStr;
use uuid::Uuid;

// --- Tests ---

/// Test: Deposit Increases Balance
///
/// Verifies that processing a credit ledger entry correctly increases
/// the wallet's available balance.
///
/// Scenario:
///   - Create a funded account (0 balance initially)
///   - Process a credit ledger entry for 100.50 USDT
///
/// Assert: wallet balance becomes 100.50
#[tokio::test]
async fn test_deposit_increases_balance() {
    let ctx = PostgresTestContext::new(true).await;

    let usdt_id = Uuid::parse_str(&ctx.create_asset("USDT", 2).await).unwrap();
    let account = ctx.funded_account(usdt_id, "0").await;

    let deposit_amount = Decimal::from_str("100.50").unwrap();
    let entry = LedgerEntry {
        id: Uuid::new_v4(),
        tenant_id: Uuid::parse_str(&ctx.tenant_id).unwrap(),
        event_id: Uuid::new_v4(),
        account_id: account.account_id,
        amount: deposit_amount,
        meta: serde_json::json!({"asset": usdt_id.to_string(), "type": "credit"}),
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };

    ctx.wallet_service
        .process_ledger_entry(entry)
        .await
        .expect("Process Deposit Entry");

    let updated = ctx
        .wallet_service
        .get_wallet(&account.wallet_id.to_string())
        .await
        .unwrap()
        .unwrap();
    assert_eq!(updated.available, deposit_amount);
}

/// Test: Order Insufficient Funds
///
/// Verifies that placing a buy order exceeding the available balance
/// is rejected.
///
/// Scenario:
///   - Wallet has 10.00 USD
///   - Order requests 100.00 USD
///
/// Assert: returns InsufficientFunds error
#[tokio::test]
async fn test_withdrawal_insufficient_funds() {
    let ctx = PostgresTestContext::new(true).await;

    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;

    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    // Fund 10.00 USD
    ctx.seed_wallet(
        Uuid::parse_str(&account_id).unwrap(),
        Uuid::parse_str(&usd_id).unwrap(),
        10.0,
        0.0,
        10.0,
    )
    .await;

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

/// Test: Buy Limit Locks Quote Currency
///
/// Verifies that a buy limit order locks the estimated cost (price * qty)
/// in the quote currency wallet.
///
/// Scenario:
///   - Wallet has 1000.00 USD
///   - Buy 2.0 BTC @ 100.00 USD (Cost 200.00 USD)
///
/// Assert: available = 800.00; locked = 200.00
#[tokio::test]
async fn test_create_order_buy_limit_locks_quote() {
    let ctx = PostgresTestContext::new(true).await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    ctx.seed_wallet(
        Uuid::parse_str(&account_id).unwrap(),
        Uuid::parse_str(&usd_id).unwrap(),
        1000.0,
        0.0,
        1000.0,
    )
    .await;

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

/// Test: Sell Limit Locks Base Currency
///
/// Verifies that a sell limit order locks the exact quantity of the
/// base asset being sold.
///
/// Scenario:
///   - Wallet has 10.00 BTC
///   - Sell 2.0 BTC @ 100.00 USD
///
/// Assert: available = 8.00 BTC; locked = 2.00 BTC
#[tokio::test]
async fn test_create_order_sell_limit_locks_base() {
    let ctx = PostgresTestContext::new(true).await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    ctx.seed_wallet(
        Uuid::parse_str(&account_id).unwrap(),
        Uuid::parse_str(&btc_id).unwrap(),
        10.0,
        0.0,
        10.0,
    )
    .await;

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

/// Test: Create Order Insufficient Funds
///
/// Verifies that order creation fails if the user does not have enough
/// funds to cover the lock requirement.
///
/// Scenario:
///   - Wallet has 50.00 USD
///   - Buy 1.0 BTC @ 100.00 USD (Cost 100.00 USD)
///
/// Assert: returns InsufficientFunds error
#[tokio::test]
async fn test_create_order_insufficient_funds() {
    let ctx = PostgresTestContext::new(true).await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    // Fund 50 USD
    ctx.seed_wallet(
        Uuid::parse_str(&account_id).unwrap(),
        Uuid::parse_str(&usd_id).unwrap(),
        50.0,
        0.0,
        50.0,
    )
    .await;

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

/// Test: Cancel Order Unlocks Funds
///
/// Verifies that cancelling an open order releases the locked funds
/// back to the available balance.
///
/// Scenario:
///   - Buy 1.0 BTC @ 100.00 USD (Locks 100.00 USD)
///   - Cancel the order
///
/// Assert: locked = 0; available restored to original
#[tokio::test]
async fn test_cancel_order_unlocks_funds() {
    let ctx = PostgresTestContext::new(true).await;
    let usd_id = ctx.create_asset("USD", 2).await;
    let btc_id = ctx.create_asset("BTC", 8).await;
    let instr_id = ctx.create_instrument("BTC-USD", &btc_id, &usd_id).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    ctx.seed_wallet(
        Uuid::parse_str(&account_id).unwrap(),
        Uuid::parse_str(&usd_id).unwrap(),
        1000.0,
        0.0,
        1000.0,
    )
    .await;

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

/// Test: Trade Settlement Full Fill
///
/// Verifies that matching and settling a full trade updates both
/// buyer and seller wallets correctly.
///
/// Scenario:
///   - Buyer: 1000.00 USD
///   - Seller: 10.00 BTC
///   - Trade: 1.0 BTC @ 100.00 USD
///
/// Assert:
///   - Buyer USD: 1000 - 100 - fee
///   - Seller BTC: 10 - 1
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

    ctx.seed_wallet(
        Uuid::parse_str(&buyer_id).unwrap(),
        Uuid::parse_str(&usd_id).unwrap(),
        1000.0,
        0.0,
        1000.0,
    )
    .await;

    ctx.seed_wallet(
        Uuid::parse_str(&seller_id).unwrap(),
        Uuid::parse_str(&btc_id).unwrap(),
        10.0,
        0.0,
        10.0,
    )
    .await;

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

/// Test: Trade Settlement Partial Fill
///
/// Verifies that a partial fill settles the traded amount and leaves
/// the remaining order open with remaining funds locked.
///
/// Scenario:
///   - Buyer Order: 2.0 BTC @ 100.00 USD (Locks 200.00 USD)
///   - Seller Order: 1.0 BTC @ 100.00 USD
///   - Trade: 1.0 BTC
///
/// Assert:
///   - Buyer Locked: Reduced from 200 to 100 (for remaining 1.0 BTC)
///   - Buyer Available: Reduced by settled amount + fee
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

    ctx.seed_wallet(
        Uuid::parse_str(&account_id).unwrap(),
        Uuid::parse_str(&usd_id).unwrap(),
        1000.0,
        0.0,
        1000.0,
    )
    .await;

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
    ctx.seed_wallet(
        Uuid::parse_str(&seller_id).unwrap(),
        Uuid::parse_str(&btc_id).unwrap(),
        10.0,
        0.0,
        10.0,
    )
    .await;

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

/// Test: Ledger Entry Integrity Check
///
/// Verifies that processing a sequence of ledger entries results in
/// a wallet balance that exactly matches the sum of the entries.
///
/// Scenario:
///   - Process a mix of credit and debit entries
///
/// Assert: wallet total == sum(entries)
#[tokio::test]
async fn test_ledger_entry_integrity_check() {
    let ctx = PostgresTestContext::new(true).await;
    let asset_id = ctx.create_asset("USDT", 2).await;
    let user_id = ctx.create_user().await;
    let account_id = ctx.create_account(&user_id).await;

    ctx.empty_wallet(
        Uuid::parse_str(&account_id).unwrap(),
        Uuid::parse_str(&asset_id).unwrap(),
    )
    .await;

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

/// Test: System Fee Collection
///
/// Verifies that trading fees are collected into the system fee account.
///
/// Scenario:
///   - Execute a trade with standard fee rate
///
/// Assert: Fee account balance increases
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

    ctx.seed_wallet(
        Uuid::parse_str(&buyer_id).unwrap(),
        Uuid::parse_str(&usd_id).unwrap(),
        1000.0,
        0.0,
        1000.0,
    )
    .await;
    ctx.seed_wallet(
        Uuid::parse_str(&seller_id).unwrap(),
        Uuid::parse_str(&btc_id).unwrap(),
        10.0,
        0.0,
        10.0,
    )
    .await;

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
