/// Track B — Futures Tests
///
/// These tests define expected ledger behavior for perpetual and dated
/// futures contracts. They require `FundingRateService`, `MarkToMarketService`,
/// and futures-specific settlement logic not yet implemented.
///
/// To run once implemented:
///   cargo test -- --ignored futures
///
/// Required domain additions:
///   - `Instrument.type = "perpetual"` or `"future"` with settlement asset in meta
///   - `FundingRateService::collect_funding(instrument_id) -> Result<()>`
///   - `MarkToMarketService::settle_daily(instrument_id, mark_price) -> Result<()>`
///   - Margin wallet concept (isolated or cross)
mod helpers;
use helpers::memory::InMemoryTestContext;
use helpers::to_atomic_usd;
use rust_decimal::prelude::ToPrimitive;
use rust_decimal::Decimal;
use std::str::FromStr;

/// Test: Futures Order Locks Initial Margin Only, Not Full Notional
///
/// Unlike spot trading (where the full notional must be locked), futures
/// allow leverage: only the initial margin fraction is required upfront.
///
/// Example: 10× leverage → initial margin = 10% of notional.
/// Buying 1 BTC perpetual @ $50,000 (notional = $50,000) locks only $5,000.
///
/// Assert: locked = notional * initial_margin_rate; available = starting - locked
#[tokio::test]
#[ignore = "Track B: Requires FuturesMarginService and perpetual instrument type"]
async fn test_futures_order_locks_initial_margin_only() {
    let ctx = InMemoryTestContext::new();

    let notional = to_atomic_usd(50_000.0);
    let margin_rate = Decimal::from_str("0.10").unwrap(); // 10% initial margin
    let initial_margin = (notional * margin_rate).floor();
    let starting_usd = to_atomic_usd(10_000.0);

    ctx.create_wallet(
        ctx.account_a,
        &ctx.usd_id.to_string(),
        starting_usd.to_f64().unwrap(),
        0.0,
        starting_usd.to_f64().unwrap(),
    );

    // TODO: ctx.futures_order_service.create_order(account_a, perp_btc_usd, side=Buy, qty=1, leverage=10).await;

    let usd_wallet = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();

    assert_eq!(
        &usd_wallet.locked, &initial_margin,
        "Should lock only initial margin, not full notional"
    );
    assert_eq!(&usd_wallet.available, &(starting_usd - initial_margin));

    todo!("Implement FuturesMarginService then complete this test")
}

/// Test: Perpetual — Positive Funding Rate: Long Pays Short
///
/// When the perpetual price trades above the index (bullish bias), the
/// funding rate is positive. Long holders are debited and short holders
/// are credited to bring the price back toward index.
///
/// funding_payment = position_notional * funding_rate
///
/// Assert: long.usd -= funding; short.usd += funding
#[tokio::test]
#[ignore = "Track B: Requires FundingRateService"]
async fn test_perpetual_positive_funding_rate_long_pays_short() {
    let ctx = InMemoryTestContext::new();

    let position_notional = to_atomic_usd(50_000.0);
    let funding_rate = Decimal::from_str("0.0001").unwrap(); // 0.01% per 8h
    let funding_payment = (position_notional * funding_rate).floor();

    ctx.create_wallet(
        ctx.account_a,
        &ctx.usd_id.to_string(),
        position_notional.to_f64().unwrap(),
        0.0,
        position_notional.to_f64().unwrap(),
    ); // long
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0); // short

    // TODO: ctx.funding_rate_service.collect(instrument_id, rate=0.0001, long=account_a, short=account_b).await;

    let long_usd = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();
    let short_usd = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();

    assert_eq!(
        &long_usd.total,
        &(position_notional - funding_payment),
        "Long holder should be debited funding payment"
    );
    assert_eq!(
        &short_usd.total, &funding_payment,
        "Short holder should be credited funding payment"
    );

    todo!("Implement FundingRateService then complete this test")
}

/// Test: Perpetual — Negative Funding Rate: Short Pays Long
///
/// When the perpetual price trades below the index (bearish bias), the
/// funding rate flips negative: short holders pay longs.
///
/// Assert: short.usd -= |funding|; long.usd += |funding|
#[tokio::test]
#[ignore = "Track B: Requires FundingRateService"]
async fn test_perpetual_negative_funding_rate_short_pays_long() {
    let ctx = InMemoryTestContext::new();

    let position_notional = to_atomic_usd(50_000.0);
    let funding_rate = Decimal::from_str("0.0001").unwrap();
    let funding_payment = (position_notional * funding_rate).floor();

    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0); // long, starts with nothing
    ctx.create_wallet(
        ctx.account_b,
        &ctx.usd_id.to_string(),
        position_notional.to_f64().unwrap(),
        0.0,
        position_notional.to_f64().unwrap(),
    ); // short

    // TODO: ctx.funding_rate_service.collect(instrument_id, rate=-0.0001, long=account_a, short=account_b).await;

    let long_usd = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();
    let short_usd = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();

    assert_eq!(&long_usd.total, &funding_payment);
    assert_eq!(&short_usd.total, &(position_notional - funding_payment));

    todo!("Implement FundingRateService then complete this test")
}

/// Test: Mark-to-Market Settlement Credits the Profitable Side
///
/// In futures, unrealized PnL is settled daily against mark price. The
/// profitable side receives cash into their margin wallet; the losing side
/// is debited. This converts unrealized PnL to realized.
///
/// Scenario: Long bought @ $48,000; mark price is $50,000 → $2,000 profit
///   - Long's margin wallet increases by $2,000
///   - Short's margin wallet decreases by $2,000
///
/// Assert: long.usd += 200,000 cents; short.usd -= 200,000 cents
#[tokio::test]
#[ignore = "Track B: Requires MarkToMarketService"]
async fn test_mark_to_market_settlement_credits_profitable_side() {
    let ctx = InMemoryTestContext::new();

    let entry_price = to_atomic_usd(48_000.0);
    let mark_price = to_atomic_usd(50_000.0);
    let pnl = mark_price - entry_price; // 200,000 cents = $2,000

    ctx.create_wallet(
        ctx.account_a,
        &ctx.usd_id.to_string(),
        entry_price.to_f64().unwrap(),
        0.0,
        entry_price.to_f64().unwrap(),
    ); // long
    ctx.create_wallet(
        ctx.account_b,
        &ctx.usd_id.to_string(),
        entry_price.to_f64().unwrap(),
        0.0,
        entry_price.to_f64().unwrap(),
    ); // short

    // TODO: ctx.mark_to_market_service.settle(instrument_id, mark_price=50000, long=account_a, short=account_b).await;

    let long_usd = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();
    let short_usd = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();

    assert_eq!(&long_usd.total, &(entry_price + pnl));
    assert_eq!(&short_usd.total, &(entry_price - pnl));

    todo!("Implement MarkToMarketService then complete this test")
}

/// Test: Dated Futures Expiry Settles All Positions at Index Price
///
/// At contract expiry, all open positions are force-closed at the settlement
/// (index) price. Final PnL is transferred to/from margin wallets and
/// positions are marked closed.
///
/// Assert: all positions closed; PnL transferred; no remaining locked margin
#[tokio::test]
#[ignore = "Track B: Requires FuturesSettlementService with expiry logic"]
async fn test_dated_futures_expiry_settles_at_index_price() {
    let ctx = InMemoryTestContext::new();

    let entry_price = to_atomic_usd(48_000.0);
    let settlement_price = to_atomic_usd(51_000.0);
    let pnl = settlement_price - entry_price; // $3,000 profit for long

    ctx.create_wallet(
        ctx.account_a,
        &ctx.usd_id.to_string(),
        entry_price.to_f64().unwrap(),
        0.0,
        entry_price.to_f64().unwrap(),
    ); // long
    ctx.create_wallet(
        ctx.account_b,
        &ctx.usd_id.to_string(),
        entry_price.to_f64().unwrap(),
        0.0,
        entry_price.to_f64().unwrap(),
    ); // short

    // TODO: ctx.futures_settlement_service.expire(contract_id, settlement_price=51000).await;

    let long_usd = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();
    let short_usd = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();

    assert_eq!(&long_usd.total, &(entry_price + pnl));
    assert_eq!(&short_usd.total, &(entry_price - pnl));
    assert_eq!(&long_usd.locked, &Decimal::ZERO);
    assert_eq!(&short_usd.locked, &Decimal::ZERO);

    todo!("Implement FuturesSettlementService then complete this test")
}

/// Test: Closing a Futures Position Releases Locked Margin
///
/// When a trader closes their futures position (offsetting trade), their
/// initial margin must be fully returned to available. The position is
/// eliminated from the books.
///
/// Assert: usd_locked = 0 after position close; margin returned to available
#[tokio::test]
#[ignore = "Track B: Requires FuturesMarginService"]
async fn test_futures_position_close_releases_margin() {
    let ctx = InMemoryTestContext::new();

    let initial_margin = to_atomic_usd(5_000.0);
    let starting_usd = to_atomic_usd(10_000.0);

    ctx.create_wallet(
        ctx.account_a,
        &ctx.usd_id.to_string(),
        (starting_usd - initial_margin).to_f64().unwrap(),
        initial_margin.to_f64().unwrap(),
        starting_usd.to_f64().unwrap(),
    );

    // TODO: ctx.futures_service.close_position(account_a, instrument_id).await;

    let usd_wallet = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();

    assert_eq!(
        &usd_wallet.locked,
        &Decimal::ZERO,
        "All margin should be released on position close"
    );

    todo!("Implement FuturesMarginService then complete this test")
}
