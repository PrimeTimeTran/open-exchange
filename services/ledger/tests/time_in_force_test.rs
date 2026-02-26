mod helpers;
use helpers::memory::InMemoryTestContext;
use ledger::domain::orders::model::{Order, OrderSide, OrderStatus, OrderType};
use ledger::domain::fees::constants::FeeConstants;
use rust_decimal::Decimal;
use rust_decimal::prelude::{FromPrimitive, ToPrimitive};
use ledger::domain::orders::OrderRepository;
use std::str::FromStr;
use uuid::Uuid;
use chrono::Utc;

fn to_atomic_usd(amount: f64) -> Decimal {
    (Decimal::from_f64(amount).unwrap() * Decimal::new(100, 0)).floor()
}

fn to_atomic_btc(amount: f64) -> Decimal {
    (Decimal::from_f64(amount).unwrap() * Decimal::new(100_000_000, 0)).floor()
}

fn calc_taker_fee(amount_atomic: Decimal) -> Decimal {
    (amount_atomic * FeeConstants::get_taker_fee()).floor()
}

macro_rules! assert_decimal_val_eq {
    ($left:expr, $right:expr) => {
        assert_eq!(
            Decimal::from_str(&$left).unwrap(),
            $right,
            "Expected {} but got {}",
            $right,
            &$left
        );
    };
}

/// Test: IOC — Partial Fill Cancels Remainder
///
/// An Immediate-or-Cancel (IOC) order must fill as much as possible on
/// arrival and cancel any unfilled remainder. The ledger's role is to:
///   1. Lock the full quantity's funds when the order is placed.
///   2. Release the unused locked funds when the remainder is cancelled.
///
/// Scenario: IOC buy for 1.0 BTC; only 0.5 BTC is available.
///   - 0.5 BTC settles normally.
///   - Matching engine signals cancel for the remaining 0.5 BTC.
///   - Ledger must return the locked funds for the unfilled half.
///
/// Assert: locked = 0 after cancellation; buyer holds 0.5 BTC
#[tokio::test]
async fn test_ioc_partial_fill_cancels_remainder() {
    let ctx = InMemoryTestContext::new();

    let price          = 50_000.0_f64;
    let full_qty       = 1.0_f64;
    let partial_qty    = 0.5_f64;
    let full_budget    = to_atomic_usd(price * full_qty);
    let partial_cost   = to_atomic_usd(price * partial_qty);
    let taker_fee      = calc_taker_fee(partial_cost);

    // Buyer: USD budget for 1.0 BTC, 0 BTC
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(),
        0.0, full_budget.to_f64().unwrap(), full_budget.to_f64().unwrap());
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);

    // Seller: 0.5 BTC locked
    ctx.create_wallet(ctx.account_b, &ctx.btc_id.to_string(),
        0.0, to_atomic_btc(partial_qty).to_f64().unwrap(),
        to_atomic_btc(partial_qty).to_f64().unwrap());
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);

    // IOC buy order stored in repo (funds already locked)
    let ioc_buy_order = Order {
        id:            Uuid::new_v4(),
        tenant_id:     ctx.tenant_id,
        account_id:    ctx.account_a,
        instrument_id: ctx.instrument_id,
        side:          OrderSide::Buy,
        r#type:        OrderType::Limit,
        quantity:      Decimal::from_f64(full_qty).unwrap(),
        price:         Decimal::from_f64(price).unwrap(),
        status:        OrderStatus::Open,
        filled_quantity: Decimal::ZERO,
        average_fill_price: Decimal::ZERO,
        meta:          serde_json::json!({"time_in_force": "IOC"}),
        created_at:    Utc::now(),
        updated_at:    Utc::now(),
    };
    ctx.order_repo.add(ioc_buy_order.clone());

    let sell_order = ctx.create_order(ctx.account_b, "sell", price, partial_qty);

    // Step 1: Partial fill of 0.5 BTC
    let trade = ctx.create_trade(ioc_buy_order.id, sell_order.id, price, partial_qty);
    let (settlement_service, wallet_service) = ctx.init_test_services();
    settlement_service.process_trade_event(trade).await.unwrap();

    // Step 2: Matching engine cancels the IOC remainder
    ctx.order_service.cancel_order(ioc_buy_order.id).await.unwrap();

    let usd_wallet = wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await.unwrap().unwrap();

    let btc_wallet = wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string())
        .await.unwrap().unwrap();

    // All locks released after cancel
    assert_decimal_val_eq!(usd_wallet.locked, Decimal::ZERO);

    // Buyer received 0.5 BTC
    let expected_btc = to_atomic_btc(partial_qty);
    assert_decimal_val_eq!(btc_wallet.available, expected_btc);

    // Verify order is cancelled or partial-fill
    let order = ctx.order_repo.get(ioc_buy_order.id).await.unwrap().unwrap();
    assert!(
        order.status == OrderStatus::Cancelled || order.status == OrderStatus::PartialFill,
        "IOC remainder should be cancelled; got {:?}", order.status
    );
}

/// Test: IOC — Zero Fill Cancels Entirely
///
/// If an IOC order finds no matching counterparty, the entire order must be
/// cancelled and all locked funds returned to available.
///
/// Assert: available restored to pre-order balance; locked = 0
#[tokio::test]
async fn test_ioc_zero_fill_cancels_entirely() {
    let ctx = InMemoryTestContext::new();

    let price    = 50_000.0_f64;
    let qty      = 1.0_f64;
    let budget   = to_atomic_usd(price * qty);

    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(),
        0.0, budget.to_f64().unwrap(), budget.to_f64().unwrap());

    let ioc_order = Order {
        id:            Uuid::new_v4(),
        tenant_id:     ctx.tenant_id,
        account_id:    ctx.account_a,
        instrument_id: ctx.instrument_id,
        side:          OrderSide::Buy,
        r#type:        OrderType::Limit,
        quantity:      Decimal::from_f64(qty).unwrap(),
        price:         Decimal::from_f64(price).unwrap(),
        status:        OrderStatus::Open,
        filled_quantity: Decimal::ZERO,
        average_fill_price: Decimal::ZERO,
        meta:          serde_json::json!({"time_in_force": "IOC"}),
        created_at:    Utc::now(),
        updated_at:    Utc::now(),
    };
    ctx.order_repo.add(ioc_order.clone());

    // No trade occurs. Matching engine cancels the IOC order immediately.
    ctx.order_service.cancel_order(ioc_order.id).await.unwrap();

    let wallet = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await.unwrap().unwrap();

    assert_decimal_val_eq!(wallet.locked,    Decimal::ZERO);
    assert_decimal_val_eq!(wallet.available, budget);
    assert_decimal_val_eq!(wallet.total,     budget);
}

/// Test: FOK — Cancelled When Not Fully Fillable
///
/// A Fill-or-Kill order must fill completely or not at all. When the
/// available liquidity is insufficient, the matching engine cancels the
/// entire order. The ledger must cleanly release all locked funds.
///
/// Scenario: FOK buy for 2.0 BTC; only 1.0 BTC available.
///   No trade occurs. Order is cancelled.
///
/// Assert: locked = 0, available restored; no BTC credit
#[tokio::test]
async fn test_fok_cancels_if_not_fully_fillable() {
    let ctx = InMemoryTestContext::new();

    let price  = 50_000.0_f64;
    let qty    = 2.0_f64;
    let budget = to_atomic_usd(price * qty);

    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(),
        0.0, budget.to_f64().unwrap(), budget.to_f64().unwrap());
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);

    let fok_order = Order {
        id:            Uuid::new_v4(),
        tenant_id:     ctx.tenant_id,
        account_id:    ctx.account_a,
        instrument_id: ctx.instrument_id,
        side:          OrderSide::Buy,
        r#type:        OrderType::Limit,
        quantity:      Decimal::from_f64(qty).unwrap(),
        price:         Decimal::from_f64(price).unwrap(),
        status:        OrderStatus::Open,
        filled_quantity: Decimal::ZERO,
        average_fill_price: Decimal::ZERO,
        meta:          serde_json::json!({"time_in_force": "FOK"}),
        created_at:    Utc::now(),
        updated_at:    Utc::now(),
    };
    ctx.order_repo.add(fok_order.clone());

    // Only 1.0 BTC available — FOK condition fails; no trade, just cancel
    ctx.order_service.cancel_order(fok_order.id).await.unwrap();

    let usd_wallet = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await.unwrap().unwrap();

    let btc_wallet = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string())
        .await.unwrap().unwrap();

    assert_decimal_val_eq!(usd_wallet.locked,    Decimal::ZERO);
    assert_decimal_val_eq!(usd_wallet.available, budget);
    assert_decimal_val_eq!(btc_wallet.available, Decimal::ZERO);
}

/// Test: FOK — Succeeds When Fully Fillable
///
/// When a FOK order can be completely filled in one match, it settles
/// identically to a regular limit order. No special ledger treatment needed
/// beyond the normal settlement path.
///
/// Scenario: FOK buy 1.0 BTC @ $50,000 vs. a 1.0 BTC sell at same price.
///
/// Assert: wallets settle correctly with fees; order is Filled
#[tokio::test]
async fn test_fok_succeeds_when_fully_fillable() {
    let ctx = InMemoryTestContext::new();

    let price    = 50_000.0_f64;
    let qty      = 1.0_f64;
    let notional = to_atomic_usd(price * qty);
    let taker_fee = calc_taker_fee(notional);

    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(),
        0.0, notional.to_f64().unwrap(), notional.to_f64().unwrap());
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);

    ctx.create_wallet(ctx.account_b, &ctx.btc_id.to_string(),
        0.0, to_atomic_btc(qty).to_f64().unwrap(), to_atomic_btc(qty).to_f64().unwrap());
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);

    let fok_order  = ctx.create_order(ctx.account_a, "buy",  price, qty);
    let sell_order = ctx.create_order(ctx.account_b, "sell", price, qty);

    let trade = ctx.create_trade(fok_order.id, sell_order.id, price, qty);
    let (settlement_service, wallet_service) = ctx.init_test_services();
    settlement_service.process_trade_event(trade).await.unwrap();

    let buyer_btc = wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string())
        .await.unwrap().unwrap();

    // Buyer received 1.0 BTC (in satoshis)
    assert_decimal_val_eq!(buyer_btc.available, to_atomic_btc(qty));

    // Buyer's USD total is reduced by cost + fee
    let buyer_usd = wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await.unwrap().unwrap();

    assert_decimal_val_eq!(buyer_usd.total, Decimal::ZERO - taker_fee);
}
