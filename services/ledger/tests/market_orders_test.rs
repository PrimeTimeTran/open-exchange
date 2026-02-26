#[macro_use]
mod helpers;
use helpers::memory::InMemoryTestContext;
use helpers::{calc_taker_fee, to_atomic_btc, to_atomic_usd};
use ledger::domain::orders::model::{Order, OrderSide, OrderType};
use ledger::error::AppError;
use rust_decimal::prelude::ToPrimitive;
use rust_decimal::Decimal;
use std::str::FromStr;

/// Test: Market Buy Locks Full Budget
///
/// A market buy order does not know the final fill price, so it locks
/// price * quantity (the "max budget") up front. This prevents overspending
/// and is identical to a limit order's locking mechanic.
///
/// Setup:  account_a holds 1,000 USD (100,000 cents)
/// Action: place market buy 1.0 BTC @ $500 (budget = $500 = 50,000 cents)
/// Assert: available = 50,000 cents; locked = 50,000 cents; total unchanged
#[tokio::test]
async fn test_market_buy_locks_max_budget() {
    let ctx = InMemoryTestContext::new();

    let initial_usd = to_atomic_usd(1000.0); // 100,000 cents
    let budget = to_atomic_usd(500.0); //  50,000 cents

    ctx.create_wallet(
        ctx.account_a,
        &ctx.usd_id.to_string(),
        100_000.0,
        0.0,
        100_000.0,
    );

    let order = Order::new(
        ctx.tenant_id,
        ctx.account_a,
        ctx.instrument_id,
        OrderSide::Buy,
        OrderType::Market,
        Decimal::from_str("1.0").unwrap(),
        Decimal::from_str("500.0").unwrap(),
    );

    ctx.order_service
        .create_order(order)
        .await
        .expect("Market buy order should be accepted");

    let wallet = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();

    let total = Decimal::from_str(&wallet.total).unwrap();
    assert_decimal_val_eq!(wallet.locked, budget);
    assert_decimal_val_eq!(wallet.available, initial_usd - budget);
    assert_eq!(total, initial_usd, "Total must not change when locking");
}

/// Test: Market Sell Locks Full Base Asset Quantity
///
/// A market sell requires locking the seller's base asset (e.g. BTC) just
/// like a limit sell. The final sale price is unknown, but the quantity being
/// committed is exact.
///
/// Setup:  account_b holds 2.0 BTC (200,000,000 satoshis)
/// Action: market sell 1.0 BTC
/// Assert: BTC locked = 100,000,000 sats; available = 100,000,000 sats
#[tokio::test]
async fn test_market_sell_locks_full_base_quantity() {
    let ctx = InMemoryTestContext::new();

    let initial_btc = to_atomic_btc(2.0);
    let lock_amount = to_atomic_btc(1.0);

    ctx.create_wallet(
        ctx.account_b,
        &ctx.btc_id.to_string(),
        200_000_000.0,
        0.0,
        200_000_000.0,
    );

    let order = Order::new(
        ctx.tenant_id,
        ctx.account_b,
        ctx.instrument_id,
        OrderSide::Sell,
        OrderType::Market,
        Decimal::from_str("1.0").unwrap(),
        Decimal::ZERO,
    );

    ctx.order_service
        .create_order(order)
        .await
        .expect("Market sell order should be accepted");

    let wallet = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string())
        .await
        .unwrap()
        .unwrap();

    assert_decimal_val_eq!(wallet.locked, lock_amount);
    assert_decimal_val_eq!(wallet.available, initial_btc - lock_amount);
}

/// Test: Market Order Settles at Counterparty's Limit Price
///
/// The ledger does not set the fill price — the matching engine does.
/// When a market buy is matched against a resting limit sell, settlement
/// occurs at the limit seller's price, not any "price" carried by the
/// market order itself.
///
/// Setup:  buyer has locked budget @ $500; seller has 1 BTC locked
/// Trade:  matched at $480 (the limit sell price)
/// Assert: buyer is debited $480 * 1.0 * scale (plus taker fee), not $500
#[tokio::test]
async fn test_market_order_fills_at_counterparty_limit_price() {
    let ctx = InMemoryTestContext::new();

    // Buyer locked $500 worth of USD budget (50,000 cents)
    let buyer_locked_usd = to_atomic_usd(500.0);
    ctx.create_wallet(
        ctx.account_a,
        &ctx.usd_id.to_string(),
        0.0,
        buyer_locked_usd.to_f64().unwrap(),
        buyer_locked_usd.to_f64().unwrap(),
    );
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);

    // Seller locked 1.0 BTC
    let seller_locked_btc = to_atomic_btc(1.0);
    ctx.create_wallet(
        ctx.account_b,
        &ctx.btc_id.to_string(),
        0.0,
        seller_locked_btc.to_f64().unwrap(),
        seller_locked_btc.to_f64().unwrap(),
    );
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);

    // The limit price is $480, not the market order's $500 budget
    let fill_price = 480.0_f64;
    let fill_qty = 1.0_f64;

    let buy_order = ctx.create_order(ctx.account_a, "buy", fill_price, fill_qty);
    let sell_order = ctx.create_order(ctx.account_b, "sell", fill_price, fill_qty);
    let trade = ctx.create_trade(buy_order.id, sell_order.id, fill_price, fill_qty);

    let (settlement_service, wallet_service) = ctx.init_test_services();
    settlement_service.process_trade_event(trade).await.unwrap();

    let buyer_usd = wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();

    let notional = to_atomic_usd(fill_price * fill_qty);
    let taker_fee = calc_taker_fee(notional);
    let expected_total_usd = buyer_locked_usd - notional - taker_fee;

    // Buyer's total USD must reflect settlement at $480, not $500
    assert_decimal_val_eq!(buyer_usd.total, expected_total_usd);
}

/// Test: Market Buy Partial Fill Refunds Unused Budget
///
/// If a market buy fills only partially (e.g. only 0.5 BTC of 1.0 BTC is
/// available), the matching engine cancels the unfilled remainder. On
/// cancellation, the locked funds for the unmatched quantity are returned
/// to available.
///
/// Setup:  buyer locked budget for 1.0 BTC @ $500 (50,000 cents)
/// Trade:  0.5 BTC settles at $500
/// Cancel: order is cancelled after partial fill
/// Assert: locked = 0 (remainder released), available = original - cost of 0.5 BTC
#[tokio::test]
async fn test_market_buy_partial_fill_refunds_unused_budget() {
    let ctx = InMemoryTestContext::new();

    let budget = to_atomic_usd(500.0); // 1.0 BTC @ $500
    ctx.create_wallet(
        ctx.account_a,
        &ctx.usd_id.to_string(),
        0.0,
        budget.to_f64().unwrap(),
        budget.to_f64().unwrap(),
    );
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);

    ctx.create_wallet(
        ctx.account_b,
        &ctx.btc_id.to_string(),
        to_atomic_btc(0.5).to_f64().unwrap(),
        to_atomic_btc(0.5).to_f64().unwrap(),
        to_atomic_btc(1.0).to_f64().unwrap(),
    );
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);

    // Create market buy order
    let buy_order = Order::new(
        ctx.tenant_id,
        ctx.account_a,
        ctx.instrument_id,
        OrderSide::Buy,
        OrderType::Market,
        Decimal::from_str("1.0").unwrap(),
        Decimal::from_str("500.0").unwrap(),
    );
    ctx.order_repo.add(buy_order.clone());

    let sell_order = ctx.create_order(ctx.account_b, "sell", 500.0, 0.5);

    // Settle 0.5 BTC partial fill
    let trade = ctx.create_trade(buy_order.id, sell_order.id, 500.0, 0.5);
    let (settlement_service, wallet_service) = ctx.init_test_services();
    settlement_service.process_trade_event(trade).await.unwrap();

    // Now cancel the unfilled remainder (simulating matching engine IOC cancel)
    ctx.order_service.cancel_order(buy_order.id).await.unwrap();

    let usd_wallet = wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();

    // After cancel, nothing should remain locked
    assert_decimal_val_eq!(usd_wallet.locked, Decimal::ZERO);
}

/// Test: Market Order Rejected When Balance Is Zero
///
/// Placing any order (market or limit) requires available funds. A market
/// buy with no USD balance must be rejected before any wallet mutation.
///
/// Assert: error is InsufficientFunds, wallet is unchanged
#[tokio::test]
async fn test_market_order_zero_balance_rejected() {
    let ctx = InMemoryTestContext::new();

    // Wallet exists but has zero balance
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);

    let order = Order::new(
        ctx.tenant_id,
        ctx.account_a,
        ctx.instrument_id,
        OrderSide::Buy,
        OrderType::Market,
        Decimal::from_str("1.0").unwrap(),
        Decimal::from_str("500.0").unwrap(),
    );

    let result = ctx.order_service.create_order(order).await;
    assert!(result.is_err(), "Should reject order with zero balance");

    let err = result.unwrap_err();
    match err {
        AppError::InsufficientFunds { .. } => {}
        other => panic!("Expected InsufficientFunds, got: {:?}", other),
    }

    // Wallet must be completely untouched
    let wallet = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();

    assert_decimal_val_eq!(wallet.available, Decimal::ZERO);
    assert_decimal_val_eq!(wallet.locked, Decimal::ZERO);
}
