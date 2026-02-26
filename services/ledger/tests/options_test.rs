/// Track B — Options Tests
///
/// These tests define the expected ledger behavior for options contracts.
/// They are marked `#[ignore]` because they require an `ExerciseService`
/// and options-specific settlement logic that is not yet implemented.
///
/// To run these tests once implemented:
///   cargo test -- --ignored options
///
/// Required domain additions:
///   - `Instrument.type = "option"` with `meta` containing `strike_price`,
///     `expiry_timestamp`, `option_type` ("call" | "put")
///   - `ExerciseService::exercise(option_id, qty) -> Result<()>`
///   - Settlement handling for option premium vs. notional
mod helpers;
use helpers::memory::InMemoryTestContext;
use rust_decimal::Decimal;
use rust_decimal::prelude::ToPrimitive;
use std::str::FromStr;

fn to_atomic_usd(amount: f64) -> Decimal {
    use rust_decimal::prelude::FromPrimitive;
    (Decimal::from_f64(amount).unwrap() * Decimal::new(100, 0)).floor()
}

fn to_atomic_btc(amount: f64) -> Decimal {
    use rust_decimal::prelude::FromPrimitive;
    (Decimal::from_f64(amount).unwrap() * Decimal::new(100_000_000, 0)).floor()
}

/// Test: Buying an Option Deducts Premium From Buyer's Quote Wallet
///
/// When a trader buys an options contract, they pay the option premium
/// (price × qty) upfront from their quote wallet (USD). This is the cost
/// of acquiring the right — not the right to the underlying asset itself.
///
/// Scenario: buy 1 call option with $500 premium
///   - Buyer's USD decreases by $500 (50,000 cents)
///   - Buyer holds the option contract
///
/// Assert: buyer.usd_total = initial - premium
#[tokio::test]
#[ignore = "Track B: Requires ExerciseService and option instrument type"]
async fn test_option_buy_deducts_premium_from_buyer() {
    let ctx = InMemoryTestContext::new();

    // Setup: option instrument (call, strike $50,000, 30-day expiry)
    let usd_id = ctx.create_asset_api("USD_OPT", "fiat", 2).await;
    let btc_id = ctx.create_asset_api("BTC_OPT", "crypto", 8).await;
    let _ = ctx.create_instrument_api("BTC-CALL-50K", &btc_id, &usd_id).await;
    // In the full implementation, the instrument would include:
    // meta: {"option_type": "call", "strike_price": "50000", "expiry": <timestamp>}

    let premium = to_atomic_usd(500.0); // $500 premium
    ctx.create_wallet(ctx.account_a, &usd_id, 0.0, premium.to_f64().unwrap(), premium.to_f64().unwrap());

    // TODO: ctx.option_service.buy_option(account_a, option_instrument_id, qty=1, premium).await;

    let usd_wallet = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &usd_id)
        .await.unwrap().unwrap();

    // After buying, premium is deducted from buyer
    let buyer_total = Decimal::from_str(&usd_wallet.total).unwrap();
    assert!(buyer_total < premium, "Buyer premium should have been deducted");

    todo!("Implement ExerciseService then complete this test")
}

/// Test: Writing a Call Option Credits Premium and Locks Collateral
///
/// The option writer (seller) receives the premium immediately but must
/// lock the underlying base asset as collateral to guarantee delivery if
/// the option is exercised (called away).
///
/// Scenario: write 1 BTC call option, receive $500 USD premium
///   - Writer's USD increases by $500 (premium received)
///   - Writer's BTC available decreases by 1.0 BTC (locked as collateral)
///
/// Assert: writer.usd_available += premium; writer.btc_locked = 1 BTC
#[tokio::test]
#[ignore = "Track B: Requires ExerciseService and option instrument type"]
async fn test_option_write_credits_premium_and_locks_collateral() {
    let ctx = InMemoryTestContext::new();

    let usd_id = ctx.create_asset_api("USD_WRT", "fiat", 2).await;
    let btc_id = ctx.create_asset_api("BTC_WRT", "crypto", 8).await;

    let initial_btc = to_atomic_btc(1.0);
    let premium     = to_atomic_usd(500.0);

    ctx.create_wallet(ctx.account_b, &btc_id, initial_btc.to_f64().unwrap(), 0.0, initial_btc.to_f64().unwrap());
    ctx.create_wallet(ctx.account_b, &usd_id, 0.0, 0.0, 0.0);

    // TODO: ctx.option_service.write_call(account_b, btc_id, usd_id, qty=1, premium).await;

    let btc_wallet = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &btc_id)
        .await.unwrap().unwrap();
    let usd_wallet = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &usd_id)
        .await.unwrap().unwrap();

    // BTC should be locked as collateral
    assert_eq!(Decimal::from_str(&btc_wallet.locked).unwrap(), initial_btc);
    assert_eq!(Decimal::from_str(&btc_wallet.available).unwrap(), Decimal::ZERO);
    // USD premium credited
    assert_eq!(Decimal::from_str(&usd_wallet.available).unwrap(), premium);

    todo!("Implement ExerciseService then complete this test")
}

/// Test: Call Option Exercise Transfers Underlying at Strike Price
///
/// When an ITM (in-the-money) call is exercised:
///   - Buyer pays strike_price × qty in quote asset (USD)
///   - Buyer receives qty of base asset (BTC)
///   - Writer's locked BTC collateral is consumed (deducted from locked + total)
///
/// Assert: buyer.btc += qty; buyer.usd -= strike*qty; writer.btc_locked -= qty
#[tokio::test]
#[ignore = "Track B: Requires ExerciseService and option instrument type"]
async fn test_call_option_exercise_transfers_underlying_at_strike() {
    let ctx = InMemoryTestContext::new();

    let strike_usd = to_atomic_usd(50_000.0); // $50,000 strike
    let qty_btc    = to_atomic_btc(1.0);       // 1.0 BTC

    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 0.0, strike_usd.to_f64().unwrap(), strike_usd.to_f64().unwrap());
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);
    ctx.create_wallet(ctx.account_b, &ctx.btc_id.to_string(), 0.0, qty_btc.to_f64().unwrap(), qty_btc.to_f64().unwrap());
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);

    // TODO: ctx.exercise_service.exercise_call(option_id, buyer=account_a, writer=account_b).await;

    let buyer_btc  = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    let writer_btc = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();

    assert_eq!(Decimal::from_str(&buyer_btc.available).unwrap(), qty_btc);
    assert_eq!(Decimal::from_str(&writer_btc.locked).unwrap(), Decimal::ZERO);

    todo!("Implement ExerciseService then complete this test")
}

/// Test: Put Option Exercise Transfers Quote Asset to Buyer at Strike
///
/// When an ITM put is exercised:
///   - Buyer delivers qty of base asset (BTC) and receives strike × qty in USD
///   - Writer's locked USD collateral is consumed
///
/// Assert: buyer.usd += strike*qty; buyer.btc -= qty; writer.usd_locked = 0
#[tokio::test]
#[ignore = "Track B: Requires ExerciseService and option instrument type"]
async fn test_put_option_exercise_transfers_quote_at_strike() {
    let ctx = InMemoryTestContext::new();

    let strike_usd = to_atomic_usd(50_000.0);
    let qty_btc    = to_atomic_btc(1.0);

    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, qty_btc.to_f64().unwrap(), qty_btc.to_f64().unwrap());
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, strike_usd.to_f64().unwrap(), strike_usd.to_f64().unwrap());
    ctx.create_wallet(ctx.account_b, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);

    // TODO: ctx.exercise_service.exercise_put(option_id, buyer=account_a, writer=account_b).await;

    let buyer_usd  = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    let writer_usd = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();

    assert_eq!(Decimal::from_str(&buyer_usd.available).unwrap(), strike_usd);
    assert_eq!(Decimal::from_str(&writer_usd.locked).unwrap(), Decimal::ZERO);

    todo!("Implement ExerciseService then complete this test")
}

/// Test: OTM Option Expiry Releases Writer's Locked Collateral
///
/// An out-of-the-money option that expires worthless must release the
/// writer's locked collateral back to available. The buyer's premium is
/// kept by the exchange / writer — it is non-refundable.
///
/// Assert: writer.btc_locked = 0; writer.btc_available = original_collateral
#[tokio::test]
#[ignore = "Track B: Requires ExerciseService and option instrument type"]
async fn test_otm_option_expiry_releases_writer_collateral() {
    let ctx = InMemoryTestContext::new();

    let collateral = to_atomic_btc(1.0);
    ctx.create_wallet(ctx.account_b, &ctx.btc_id.to_string(), 0.0, collateral.to_f64().unwrap(), collateral.to_f64().unwrap());

    // TODO: ctx.exercise_service.expire_option(option_id).await;
    // Expected: locked BTC is released to available

    let writer_btc = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string())
        .await.unwrap().unwrap();

    assert_eq!(Decimal::from_str(&writer_btc.locked).unwrap(), Decimal::ZERO);
    assert_eq!(Decimal::from_str(&writer_btc.available).unwrap(), collateral);

    todo!("Implement ExerciseService then complete this test")
}

/// Test: Option Assignment Debits the Assigned Writer's Collateral
///
/// When a call option is exercised, a specific open writer position is
/// randomly assigned. That writer's locked base asset is consumed and
/// transferred to the buyer. Other writers' positions are unaffected.
///
/// Assert: assigned_writer.btc_locked = 0; unassigned_writer.btc_locked unchanged
#[tokio::test]
#[ignore = "Track B: Requires ExerciseService and option instrument type"]
async fn test_option_assignment_debits_writer_on_exercise() {
    let ctx = InMemoryTestContext::new();

    let collateral = to_atomic_btc(1.0);

    // Two writers, same option contract
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, collateral.to_f64().unwrap(), collateral.to_f64().unwrap());
    ctx.create_wallet(ctx.account_b, &ctx.btc_id.to_string(), 0.0, collateral.to_f64().unwrap(), collateral.to_f64().unwrap());

    // TODO: ctx.exercise_service.exercise_and_assign(option_id, exercising_buyer, writers=[account_a, account_b]).await;
    // Only ONE writer is assigned; the other's collateral is untouched.

    // After assignment, total locked across both writers should equal exactly 1 collateral (the unassigned one)
    let writer_a = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    let writer_b = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();

    let total_locked = Decimal::from_str(&writer_a.locked).unwrap()
        + Decimal::from_str(&writer_b.locked).unwrap();

    // One was assigned (locked → 0), one was not (locked = collateral)
    assert_eq!(total_locked, collateral, "Exactly one writer should remain locked");

    todo!("Implement ExerciseService then complete this test")
}
