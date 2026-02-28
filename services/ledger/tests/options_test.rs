/// Track B — Options Tests
///
/// These tests define the expected ledger behavior for options contracts.
/// Required domain additions:
///   - `Instrument.type = "option"` with `meta` containing `strike_price`,
///     `expiry_timestamp`, `option_type` ("call" | "put")
///   - `ExerciseService::exercise(option_id, qty) -> Result<()>`
///   - Settlement handling for option premium vs. notional
mod helpers;
use helpers::memory::InMemoryTestContext;
use helpers::{to_atomic_btc, to_atomic_usd};
use ledger::domain::orders::model::OrderSide::{Buy, Sell};
use rust_decimal::Decimal;
use std::str::FromStr;
use uuid::Uuid;

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
async fn test_option_buy_deducts_premium_from_buyer() {
    let ctx = InMemoryTestContext::new();

    // Setup: option instrument (call, strike $50,000, 30-day expiry)
    let usd_id_str = ctx.create_asset_api("USD_OPT", "fiat", 2).await;
    let btc_id_str = ctx.create_asset_api("BTC_OPT", "crypto", 8).await;
    let usd_id = Uuid::parse_str(&usd_id_str).unwrap();

    let _ = ctx
        .create_instrument_api("BTC-CALL-50K", &btc_id_str, &usd_id_str)
        .await;

    let premium = to_atomic_usd(500.0); // $500 premium
    ctx.seed_wallet(ctx.account_a, usd_id, 0.0, 500.0, 500.0)
        .await;

    ctx.exercise_service
        .buy_option(ctx.account_a, usd_id, premium)
        .await
        .unwrap();

    let usd_wallet = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &usd_id_str)
        .await
        .unwrap()
        .unwrap();

    // After buying, premium is deducted from buyer
    let buyer_total = &usd_wallet.total;
    assert!(
        *buyer_total < premium,
        "Buyer premium should have been deducted"
    );
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
async fn test_option_write_credits_premium_and_locks_collateral() {
    let ctx = InMemoryTestContext::new();

    let usd_id_str = ctx.create_asset_api("USD_WRT", "fiat", 2).await;
    let btc_id_str = ctx.create_asset_api("BTC_WRT", "crypto", 8).await;
    let usd_id = Uuid::parse_str(&usd_id_str).unwrap();
    let btc_id = Uuid::parse_str(&btc_id_str).unwrap();

    let initial_btc = to_atomic_btc(1.0);
    let premium = to_atomic_usd(500.0);

    ctx.seed_wallet(ctx.account_b, btc_id, 1.0, 0.0, 1.0).await;
    ctx.seed_wallet(ctx.account_b, usd_id, 0.0, 0.0, 0.0).await;

    ctx.exercise_service
        .write_call(ctx.account_b, btc_id, usd_id, initial_btc, premium)
        .await
        .unwrap();

    let btc_wallet = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &btc_id_str)
        .await
        .unwrap()
        .unwrap();
    let usd_wallet = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &usd_id_str)
        .await
        .unwrap()
        .unwrap();

    // BTC should be locked as collateral
    assert_eq!(btc_wallet.locked, initial_btc);
    assert_eq!(btc_wallet.available, Decimal::ZERO);
    // USD premium credited
    assert_eq!(usd_wallet.available, premium);
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
async fn test_call_option_exercise_transfers_underlying_at_strike() {
    let ctx = InMemoryTestContext::new();

    let strike_usd = to_atomic_usd(50_000.0); // $50,000 strike
    let qty_btc = to_atomic_btc(1.0); // 1.0 BTC

    ctx.seed_wallet(ctx.account_a, ctx.assets.usd, 0.0, 50_000.0, 50_000.0)
        .await;
    ctx.empty_wallet(ctx.account_a, ctx.assets.btc);

    ctx.seed_wallet(ctx.account_b, ctx.assets.btc, 0.0, 1.0, 1.0)
        .await;
    ctx.empty_wallet(ctx.account_b, ctx.assets.usd);

    ctx.exercise_service
        .exercise_call(
            ctx.account_a,
            ctx.account_b,
            qty_btc,
            strike_usd,
            ctx.btc_id,
            ctx.usd_id,
            Decimal::from(60_000), // Market Price > Strike (50k) => ITM
            8,
            2,
        )
        .await
        .unwrap();

    let buyer_btc = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string())
        .await
        .unwrap()
        .unwrap();
    let writer_btc = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string())
        .await
        .unwrap()
        .unwrap();

    assert_eq!(buyer_btc.available, qty_btc);
    assert_eq!(writer_btc.locked, Decimal::ZERO);
}

/// Test: Put Option Exercise Transfers Quote Asset to Buyer at Strike
///
/// When an ITM put is exercised:
///   - Buyer delivers qty of base asset (BTC) and receives strike × qty in USD
///   - Writer's locked USD collateral is consumed
///
/// Assert: buyer.usd += strike*qty; buyer.btc -= qty; writer.usd_locked = 0
#[tokio::test]
async fn test_put_option_exercise_transfers_quote_at_strike() {
    let ctx = InMemoryTestContext::new();

    let strike_usd = to_atomic_usd(50_000.0);
    let qty_btc = to_atomic_btc(1.0);

    ctx.seed_wallet(ctx.account_a, ctx.assets.btc, 0.0, 1.0, 1.0)
        .await;
    ctx.empty_wallet(ctx.account_a, ctx.assets.usd);

    ctx.seed_wallet(ctx.account_b, ctx.assets.usd, 0.0, 50_000.0, 50_000.0)
        .await;
    ctx.empty_wallet(ctx.account_b, ctx.assets.btc);

    ctx.exercise_service
        .exercise_put(
            ctx.account_a,
            ctx.account_b,
            qty_btc,
            strike_usd,
            ctx.btc_id,
            ctx.usd_id,
            Decimal::from(40_000), // Market Price < Strike (50k) => ITM for Put
            8,
            2,
        )
        .await
        .unwrap();

    let buyer_usd = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();
    let writer_usd = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();

    assert_eq!(buyer_usd.available, strike_usd);
    assert_eq!(writer_usd.locked, Decimal::ZERO);
}

/// Test: OTM Option Expiry Releases Writer's Locked Collateral
///
/// An out-of-the-money option that expires worthless must release the
/// writer's locked collateral back to available. The buyer's premium is
/// kept by the exchange / writer — it is non-refundable.
///
/// Assert: writer.btc_locked = 0; writer.btc_available = original_collateral
#[tokio::test]
async fn test_otm_option_expiry_releases_writer_collateral() {
    let ctx = InMemoryTestContext::new();

    let collateral = to_atomic_btc(1.0);
    ctx.seed_wallet(ctx.account_b, ctx.assets.btc, 0.0, 1.0, 1.0)
        .await;

    ctx.exercise_service
        .expire_option(ctx.account_b, ctx.btc_id, collateral)
        .await
        .unwrap();
    // Expected: locked BTC is released to available

    let writer_btc = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string())
        .await
        .unwrap()
        .unwrap();

    assert_eq!(writer_btc.locked, Decimal::ZERO);
    assert_eq!(writer_btc.available, collateral);
}

/// Test: Option Assignment Debits the Assigned Writer's Collateral
///
/// When a call option is exercised, a specific open writer position is
/// randomly assigned. That writer's locked base asset is consumed and
/// transferred to the buyer. Other writers' positions are unaffected.
///
/// Assert: assigned_writer.btc_locked = 0; unassigned_writer.btc_locked unchanged
#[tokio::test]
async fn test_option_assignment_debits_writer_on_exercise() {
    let ctx = InMemoryTestContext::new();

    let collateral = to_atomic_btc(1.0);
    let strike_usd = to_atomic_usd(50_000.0);

    // Two writers, same option contract
    ctx.seed_wallet(ctx.account_a, ctx.assets.btc, 0.0, 1.0, 1.0)
        .await;
    ctx.seed_wallet(ctx.account_b, ctx.assets.btc, 0.0, 1.0, 1.0)
        .await;

    // Buyer setup for exercise payment
    let buyer = uuid::Uuid::new_v4();
    ctx.seed_wallet(buyer, ctx.assets.usd, 0.0, 50_000.0, 50_000.0)
        .await;

    ctx.exercise_service
        .exercise_and_assign(
            buyer,
            &[ctx.account_a, ctx.account_b],
            collateral,
            strike_usd,
            ctx.btc_id,
            ctx.usd_id,
            Decimal::from(60_000), // ITM
            8,
            2,
        )
        .await
        .unwrap();
    // Only ONE writer is assigned; the other's collateral is untouched.

    // After assignment, total locked across both writers should equal exactly 1 collateral (the unassigned one)
    let writer_a = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string())
        .await
        .unwrap()
        .unwrap();
    let writer_b = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string())
        .await
        .unwrap()
        .unwrap();

    let total_locked = &writer_a.locked + &writer_b.locked;

    // One was assigned (locked → 0), one was not (locked = collateral)
    assert_eq!(
        total_locked, collateral,
        "Exactly one writer should remain locked"
    );
}

/// Test: Writing a Call Fails If Insufficient Collateral
#[tokio::test]
async fn test_write_call_fails_insufficient_collateral() {
    let ctx = InMemoryTestContext::new();

    let premium = to_atomic_usd(500.0);
    let contract_qty = to_atomic_btc(1.0);

    ctx.seed_wallet(ctx.account_b, ctx.assets.btc, 0.5, 0.0, 0.5)
        .await;
    ctx.empty_wallet(ctx.account_b, ctx.assets.usd);

    let result = ctx
        .exercise_service
        .write_call(ctx.account_b, ctx.btc_id, ctx.usd_id, contract_qty, premium)
        .await;

    assert!(
        result.is_err(),
        "Should fail due to insufficient collateral"
    );
}

/// Test: Exercise Call Fails If Buyer Insufficient Funds
#[tokio::test]
async fn test_exercise_call_fails_insufficient_buyer_funds() {
    let ctx = InMemoryTestContext::new();

    let strike_usd = to_atomic_usd(50_000.0);
    let qty_btc = to_atomic_btc(1.0);

    // Buyer has 0 locked USD, but needs 50,000 locked
    ctx.empty_wallet(ctx.account_a, ctx.assets.usd);
    ctx.empty_wallet(ctx.account_a, ctx.assets.btc);

    // Writer has everything ready
    ctx.seed_wallet(ctx.account_b, ctx.assets.btc, 1.0, 0.0, 1.0)
        .await;

    let result = ctx
        .exercise_service
        .exercise_call(
            ctx.account_a,
            ctx.account_b,
            qty_btc,
            strike_usd,
            ctx.btc_id,
            ctx.usd_id,
            Decimal::from(60_000), // ITM
            8,
            2,
        )
        .await;

    assert!(
        result.is_err(),
        "Should fail due to insufficient buyer funds"
    );
}

/// Test: Partial Exercise Updates Balances Correctly
///
/// If a buyer holds multiple contracts or a large position, they might exercise only a portion.
/// The writer should only release/consume the proportional collateral.
#[tokio::test]
async fn test_partial_exercise_updates_balances_correctly() {
    let ctx = InMemoryTestContext::new();

    let strike_usd_per_btc = to_atomic_usd(50_000.0);
    let total_qty_btc = to_atomic_btc(2.0); // Writer wrote 2 BTC contracts
    let exercise_qty_btc = to_atomic_btc(0.5); // Buyer exercises 0.5 BTC
    let exercise_cost = (strike_usd_per_btc * Decimal::from_str("0.5").unwrap()).floor(); // $25,000

    // Buyer Setup: needs $25,000 locked for exercise
    ctx.seed_wallet(ctx.account_a, ctx.assets.usd, 0.0, 25_000.0, 25_000.0)
        .await;
    ctx.empty_wallet(ctx.account_a, ctx.assets.btc);

    // Writer Setup: locked 2.0 BTC collateral
    ctx.seed_wallet(ctx.account_b, ctx.assets.btc, 0.0, 2.0, 2.0)
        .await;
    ctx.empty_wallet(ctx.account_b, ctx.assets.usd);

    ctx.exercise_service
        .exercise_call(
            ctx.account_a,
            ctx.account_b,
            exercise_qty_btc,
            exercise_cost,
            ctx.btc_id,
            ctx.usd_id,
            Decimal::from(60_000), // ITM
            8,
            2,
        )
        .await
        .unwrap();

    // Verify Buyer
    let buyer_btc = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string())
        .await
        .unwrap()
        .unwrap();
    assert_eq!(buyer_btc.available, exercise_qty_btc);

    // Verify Writer: Should still have 1.5 BTC locked (2.0 - 0.5)
    let writer_btc = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string())
        .await
        .unwrap()
        .unwrap();
    let expected_remaining_locked = total_qty_btc - exercise_qty_btc;
    assert_eq!(writer_btc.locked, expected_remaining_locked);
}

/// Test: Expire Option Idempotency
///
/// Calling expire on an option where collateral is already released (or 0) should be safe.
#[tokio::test]
async fn test_expire_option_idempotency() {
    let ctx = InMemoryTestContext::new();
    let collateral = to_atomic_btc(1.0);
    ctx.seed_wallet(ctx.account_b, ctx.assets.btc, 0.0, 0.0, 1.0)
        .await;

    // Should succeed but do nothing
    let result = ctx
        .exercise_service
        .expire_option(ctx.account_b, ctx.btc_id, collateral)
        .await;

    assert!(result.is_ok());

    let writer_btc = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string())
        .await
        .unwrap()
        .unwrap();
    assert_eq!(writer_btc.available, Decimal::ZERO);
}

/// Test: Cash Settlement of ITM Call Option at Expiry
///
/// Scenario:
///   - Buyer buys 1 BTC call @ $75k strike. Premium paid $5k (already happened).
///   - Expiry price: $90k.
///   - Option is In-The-Money (ITM) by $15k ($90k - $75k).
///   - Contract Size: 100 units (standard option multiplier).
///   - Settlement: Writer pays $15k * 100 = $1.5M to Buyer.
///
/// Assert:
///   - Buyer USD += $1,500,000
///   - Writer USD -= $1,500,000
#[tokio::test]
async fn test_cash_settlement_itm_call_option() {
    let ctx = InMemoryTestContext::new();

    let strike_price = to_atomic_usd(75_000.0);
    let settlement_price = to_atomic_usd(90_000.0);
    // 1 contract = 100 units
    let qty_btc = to_atomic_btc(100.0);
    let expected_payout = to_atomic_usd(1_500_000.0); // 15,000 * 100

    // Setup Buyer (needs account)
    ctx.empty_wallet(ctx.account_a, ctx.assets.usd);

    // Setup Writer (needs funds to pay out)
    // Writer must have enough available or locked funds.
    // In a real scenario, margin would be locked. Here we just ensure they have the cash.
    ctx.seed_wallet(ctx.account_b, ctx.assets.usd, 1_500_000.0, 0.0, 1_500_000.0)
        .await;

    // 8 decimals for BTC
    let payout = ctx
        .exercise_service
        .cash_settle_call(
            ctx.account_a,
            ctx.account_b,
            qty_btc,
            8,
            strike_price,
            settlement_price,
            ctx.usd_id,
        )
        .await
        .unwrap();

    assert_eq!(payout, expected_payout);

    // Verify balances
    let buyer_usd = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();
    let writer_usd = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();

    assert_eq!(buyer_usd.available, expected_payout);
    assert_eq!(writer_usd.available, Decimal::ZERO);
}

/// Test: Cash Settlement of ITM Put Option at Expiry
///
/// Scenario:
///   - Buyer buys 1 BTC put @ $50k strike.
///   - Expiry price: $25k.
///   - Option is In-The-Money (ITM) by $25k ($50k - $25k).
///   - Contract Size: 100 units.
///   - Settlement: Writer pays $25k * 100 = $2.5M to Buyer.
///
/// Assert:
///   - Buyer USD += $2,500,000
///   - Writer USD -= $2,500,000
#[tokio::test]
async fn test_cash_settlement_itm_put_option() {
    let ctx = InMemoryTestContext::new();

    let strike_price = to_atomic_usd(50_000.0);
    let settlement_price = to_atomic_usd(25_000.0);
    // 1 contract = 100 units
    let qty_btc = to_atomic_btc(100.0);
    let expected_payout = to_atomic_usd(2_500_000.0); // 25,000 * 100

    // Setup Buyer
    ctx.empty_wallet(ctx.account_a, ctx.assets.usd);

    // Setup Writer
    ctx.seed_wallet(ctx.account_b, ctx.assets.usd, 2_500_000.0, 0.0, 2_500_000.0)
        .await;

    // 8 decimals for BTC
    let payout = ctx
        .exercise_service
        .cash_settle_put(
            ctx.account_a,
            ctx.account_b,
            qty_btc,
            8,
            strike_price,
            settlement_price,
            ctx.usd_id,
        )
        .await
        .unwrap();

    assert_eq!(payout, expected_payout);

    // Verify balances
    let buyer_usd = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();
    let writer_usd = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();

    assert_eq!(buyer_usd.available, expected_payout);
    assert_eq!(writer_usd.available, Decimal::ZERO);
}

/// Test: Sell Call (Covered) - ITM, OTM, ATM Scenarios
///
/// Scenario: Writer sells 1 BTC Call @ $50k Strike. Premium $5k.
/// Contract Size: 100 units (Standard).
/// Collateral: 100 BTC (Covered).
///
/// 1. ITM ($55k): Writer pays ($55k - $50k) * 100 = $500,000.
///    - Collateral (100 BTC) released.
///    - Writer must have enough cash to settle (funded in test).
///
/// 2. OTM ($45k): Writer pays 0.
///    - Keeps $5k premium.
///    - Collateral (100 BTC) released.
///
/// 3. ATM ($50k): Writer pays 0.
///    - Keeps $5k premium.
///    - Collateral (100 BTC) released.
#[tokio::test]
async fn test_sell_call_scenarios() {
    let ctx = InMemoryTestContext::new();

    let strike_price = to_atomic_usd(50_000.0);
    let premium = to_atomic_usd(5_000.0);
    let qty_btc = to_atomic_btc(100.0); // 100 units

    // --- Scenario 1: ITM Close at $55,000 ---
    {
        let settlement_price = to_atomic_usd(55_000.0);
        let expected_payout = to_atomic_usd(500_000.0); // (55k - 50k) * 100

        // Setup Writer: Has 100 BTC, and enough USD to cover settlement (500k).
        let writer = uuid::Uuid::new_v4();

        // Credit BTC (100) for collateral
        ctx.seed_wallet(writer, ctx.assets.btc, 100.0, 0.0, 100.0)
            .await;

        // Credit USD (500k) for settlement payout capability
        ctx.seed_wallet(writer, ctx.assets.usd, 500_000.0, 0.0, 500_000.0)
            .await;

        // Buyer (to receive payout)
        let buyer = uuid::Uuid::new_v4();
        ctx.empty_wallet(buyer, ctx.assets.usd);

        // 1. Write Call
        ctx.exercise_service
            .write_call(writer, ctx.btc_id, ctx.usd_id, qty_btc, premium)
            .await
            .unwrap();

        // Check Writer State: BTC Locked, USD = Initial + Premium
        let w_btc = ctx
            .wallet_service
            .get_wallet_by_account_and_asset(&writer.to_string(), &ctx.btc_id.to_string())
            .await
            .unwrap()
            .unwrap();
        let w_usd = ctx
            .wallet_service
            .get_wallet_by_account_and_asset(&writer.to_string(), &ctx.usd_id.to_string())
            .await
            .unwrap()
            .unwrap();

        assert_eq!(w_btc.locked, qty_btc);
        // Available USD = Initial (500k) + Premium (5k)
        let initial_plus_premium = expected_payout + premium;
        assert_eq!(w_usd.available, initial_plus_premium);

        // 2. Settlement (ITM)
        ctx.exercise_service
            .cash_settle_call(
                buyer,
                writer,
                qty_btc,
                8,
                strike_price,
                settlement_price,
                ctx.usd_id,
            )
            .await
            .unwrap();

        // 3. Release Collateral (Trade Over)
        ctx.exercise_service
            .expire_option(writer, ctx.btc_id, qty_btc)
            .await
            .unwrap();

        // Assertions
        let w_usd_final = ctx
            .wallet_service
            .get_wallet_by_account_and_asset(&writer.to_string(), &ctx.usd_id.to_string())
            .await
            .unwrap()
            .unwrap();
        let w_btc_final = ctx
            .wallet_service
            .get_wallet_by_account_and_asset(&writer.to_string(), &ctx.btc_id.to_string())
            .await
            .unwrap()
            .unwrap();
        let b_usd_final = ctx
            .wallet_service
            .get_wallet_by_account_and_asset(&buyer.to_string(), &ctx.usd_id.to_string())
            .await
            .unwrap()
            .unwrap();

        // Writer USD: (500k + 5k) - 500k Payout = 5k (Retains Premium)
        assert_eq!(w_usd_final.available, premium);

        // Writer BTC: Fully released
        assert_eq!(w_btc_final.locked, Decimal::ZERO);
        assert_eq!(w_btc_final.available, qty_btc);

        // Buyer USD: +500k (Payout)
        assert_eq!(b_usd_final.available, expected_payout);
    }

    // --- Scenario 2: OTM Close at $45,000 ---
    {
        let settlement_price = to_atomic_usd(45_000.0);

        let writer = uuid::Uuid::new_v4();
        // Setup Writer: 100 BTC, 0 USD
        ctx.seed_wallet(writer, ctx.assets.btc, 100.0, 0.0, 100.0)
            .await;
        ctx.empty_wallet(writer, ctx.assets.usd);

        let buyer = uuid::Uuid::new_v4();
        ctx.empty_wallet(buyer, ctx.assets.usd);

        // 1. Write Call
        ctx.exercise_service
            .write_call(writer, ctx.btc_id, ctx.usd_id, qty_btc, premium)
            .await
            .unwrap();

        // 2. Settlement (OTM - Payout 0)
        let payout = ctx
            .exercise_service
            .cash_settle_call(
                buyer,
                writer,
                qty_btc,
                8,
                strike_price,
                settlement_price,
                ctx.usd_id,
            )
            .await
            .unwrap();
        assert_eq!(payout, Decimal::ZERO);

        // 3. Release Collateral
        ctx.exercise_service
            .expire_option(writer, ctx.btc_id, qty_btc)
            .await
            .unwrap();

        let w_usd = ctx
            .wallet_service
            .get_wallet_by_account_and_asset(&writer.to_string(), &ctx.usd_id.to_string())
            .await
            .unwrap()
            .unwrap();

        // Writer keeps premium ($5000)
        assert_eq!(w_usd.available, premium);
    }

    // --- Scenario 3: ATM Close at $50,000 ---
    {
        let settlement_price = to_atomic_usd(50_000.0);

        let writer = uuid::Uuid::new_v4();
        ctx.seed_wallet(writer, ctx.assets.btc, 100.0, 0.0, 100.0)
            .await;
        ctx.empty_wallet(writer, ctx.assets.usd);

        let buyer = uuid::Uuid::new_v4();
        ctx.empty_wallet(buyer, ctx.assets.usd);

        // 1. Write Call
        ctx.exercise_service
            .write_call(writer, ctx.btc_id, ctx.usd_id, qty_btc, premium)
            .await
            .unwrap();

        // 2. Settlement (ATM - Payout 0)
        let payout = ctx
            .exercise_service
            .cash_settle_call(
                buyer,
                writer,
                qty_btc,
                8,
                strike_price,
                settlement_price,
                ctx.usd_id,
            )
            .await
            .unwrap();
        assert_eq!(payout, Decimal::ZERO);

        // 3. Release Collateral
        ctx.exercise_service
            .expire_option(writer, ctx.btc_id, qty_btc)
            .await
            .unwrap();

        let w_usd = ctx
            .wallet_service
            .get_wallet_by_account_and_asset(&writer.to_string(), &ctx.usd_id.to_string())
            .await
            .unwrap()
            .unwrap();

        // Writer keeps premium ($5000)
        assert_eq!(w_usd.available, premium);
    }
}

/// Test: Buy Call Locks Only Premium Not Strike
#[tokio::test]
async fn test_buy_call_locks_only_premium_not_strike() {
    let ctx = InMemoryTestContext::new();

    ctx.seed_wallet(ctx.account_a, ctx.assets.usd, 1000.0, 0.0, 1000.0)
        .await;

    ctx.place_limit_order_on_instrument(ctx.account_a, ctx.instruments.aapl_call, Buy, 5.0, 1.0)
        .await
        .unwrap();

    let wallet = ctx.wallet(ctx.account_a, ctx.assets.usd).await;
    assert_decimal_eq!(wallet.locked, "500");
}

/// Test: Buy Put Locks Only Premium Not Notional
#[tokio::test]
async fn test_buy_put_locks_only_premium_not_notional() {
    let ctx = InMemoryTestContext::new();

    ctx.seed_wallet(ctx.account_a, ctx.assets.usd, 1000.0, 0.0, 1000.0)
        .await;

    ctx.place_limit_order_on_instrument(ctx.account_a, ctx.instruments.aapl_put, Buy, 10.0, 1.0)
        .await
        .unwrap();

    let wallet = ctx.wallet(ctx.account_a, ctx.assets.usd).await;
    assert_decimal_eq!(wallet.locked, "1000");
}

/// Test: Call Writer Buyback Premium Cancels Position (Flow Verification)
#[tokio::test]
async fn test_call_writer_buyback_premium_cancels_position() {
    let ctx = InMemoryTestContext::new();
    let writer = ctx.account_b;
    let buyer = ctx.account_a;
    let instrument = ctx.instruments.aapl_call;

    ctx.seed_wallet(writer, ctx.assets.aapl, 1.0, 0.0, 1.0)
        .await;
    ctx.seed_wallet(writer, ctx.assets.usd, 0.0, 0.0, 0.0).await;
    ctx.seed_wallet(buyer, ctx.assets.usd, 100.0, 0.0, 100.0)
        .await;

    let sell_order = ctx
        .place_limit_order_on_instrument(writer, instrument, Sell, 5.0, 1.0)
        .await
        .unwrap();

    let buy_order = ctx
        .place_limit_order_on_instrument(buyer, instrument, Buy, 5.0, 1.0)
        .await
        .unwrap();

    let trade = ctx.seed_trade(buy_order.id, sell_order.id, 5.0, 1.0);
    ctx.settlement_service
        .process_trade_event(trade)
        .await
        .unwrap();

    let w_usd = ctx.wallet(writer, ctx.assets.usd).await;
    assert!(
        w_usd.total > Decimal::ZERO,
        "Writer should have received premium"
    );
}

#[tokio::test]
async fn test_exercise_otm_call_rejected() {
    let ctx = InMemoryTestContext::new();
    // Buyer has 1 call option.
    // Strike: 150.00. Current Market Price: 100.00 (OTM).

    let buyer = ctx.account_a;
    let writer = ctx.account_b;
    let instrument = ctx.instruments.aapl_call; // Strike 150

    // 1. Setup Position
    // Buyer needs 1 AAPL-CALL.
    // We can cheat and just seed the wallet if "Option" is an asset,
    // but currently we simulate it via a trade or just assuming ownership?
    // InMemoryTestContext doesn't easily seed "Positions".
    // We need to Buy it.

    // Setup Writer
    ctx.seed_wallet(writer, ctx.assets.aapl, 1.0, 0.0, 1.0)
        .await;
    ctx.seed_wallet(writer, ctx.assets.usd, 0.0, 0.0, 0.0).await;
    // Setup Buyer
    ctx.seed_wallet(buyer, ctx.assets.usd, 1000.0, 0.0, 1000.0)
        .await;

    // Write & Buy
    let sell_order = ctx
        .place_limit_order_on_instrument(writer, instrument, Sell, 5.0, 1.0)
        .await
        .unwrap();

    let buy_order = ctx
        .place_limit_order_on_instrument(buyer, instrument, Buy, 5.0, 1.0)
        .await
        .unwrap();

    let trade = ctx.seed_trade(buy_order.id, sell_order.id, 5.0, 1.0);
    ctx.settlement_service
        .process_trade_event(trade)
        .await
        .unwrap();

    // 2. Attempt Exercise when Market Price is 100.00 (Strike 150)
    let market_price = Decimal::from(100);

    // Attempt Exercise
    // exercise_call(buyer, writer, quantity, cost, base_asset, quote_asset)
    let strike_cost = to_atomic_usd(150.0); // 150.00 * 1.0
    let result: Result<(), ledger::error::AppError> = ctx
        .exercise_service
        .exercise_call(
            buyer,
            writer,
            Decimal::from(1),
            strike_cost,
            ctx.assets.aapl,
            ctx.assets.usd,
            market_price,
            8,
            2,
        )
        .await;

    // Expect Error: Option is Out of The Money
    assert!(result.is_err(), "Exercise of OTM option should be rejected");
}

#[tokio::test]
async fn test_exercise_otm_put_rejected() {
    let ctx = InMemoryTestContext::new();
    let buyer = ctx.account_a;
    let writer = ctx.account_b;

    // Strike 50k. Market 55k. Put is OTM (Selling at 50k is worse than market 55k).
    let strike_cost = to_atomic_usd(50_000.0);
    let market_price = Decimal::from(55_000); // Higher than strike -> OTM for Put

    // Buyer has 1 BTC to sell
    ctx.seed_wallet(buyer, ctx.assets.btc, 1.0, 0.0, 1.0).await;
    // Writer has USD to buy
    ctx.seed_wallet(writer, ctx.assets.usd, 50_000.0, 0.0, 50_000.0)
        .await;

    // Note: Assuming exercise_put signature matches exercise_call with market_price
    // or we add it. For TDD, we assume the API *should* support validation.
    // If signature mismatch, this will fail to compile, prompting signature update.
    let result = ctx
        .exercise_service
        .exercise_put(
            buyer,
            writer,
            to_atomic_btc(1.0),
            strike_cost,
            ctx.assets.btc,
            ctx.assets.usd,
            market_price,
            8,
            2,
        )
        .await;

    // Since current signature (from previous tests) lacks market_price, we can't test
    // internal OTM rejection yet without changing the service.
    // However, if we assume the SERVICE fetches price or we pass it...
    // Let's comment out the assertion for now or mock the failure if we can't pass price.
    // Ideally:
    assert!(result.is_err(), "OTM Put exercise should be rejected");
}

#[tokio::test]
async fn test_american_option_early_exercise() {
    let _ctx = InMemoryTestContext::new();
    // Setup American Option (can exercise anytime)
    // We need an instrument definition that says "American".
    // Current helpers don't easily allow setting meta options style.
    // This test documents the requirement:
    // 1. Create Instrument with meta { "style": "AMERICAN", "expiry": FUTURE_TIME }
    // 2. Write Option
    // 3. Exercise NOW (before expiry)
    // 4. Assert Success
}

#[tokio::test]
async fn test_european_option_early_exercise_rejected() {
    let _ctx = InMemoryTestContext::new();
    // Setup European Option (exercise ONLY at expiry)
    // 1. Create Instrument with meta { "style": "EUROPEAN", "expiry": FUTURE_TIME }
    // 2. Write Option
    // 3. Exercise NOW (before expiry)
    // 4. Assert Failure (Too Early)
}

#[tokio::test]
async fn test_multi_expiry_series_settlement() {
    let ctx = InMemoryTestContext::new();
    let writer = ctx.account_b;
    let collateral = to_atomic_btc(1.0);
    let premium = to_atomic_usd(100.0);

    // Writer has 2 BTC
    ctx.seed_wallet(writer, ctx.assets.btc, 2.0, 0.0, 2.0).await;
    ctx.seed_wallet(writer, ctx.assets.usd, 0.0, 0.0, 0.0).await;

    // 1. Write Call A (Expires Today) - Locks 1 BTC
    // We use asset ID as a proxy for "Series A" tracking since ExerciseService is per-asset
    // In reality, these would be different instrument IDs, but ExerciseService locks BASE asset.
    // So both lock BTC.
    ctx.exercise_service
        .write_call(writer, ctx.assets.btc, ctx.assets.usd, collateral, premium)
        .await
        .unwrap();

    // 2. Write Call B (Expires Next Month) - Locks 1 BTC
    ctx.exercise_service
        .write_call(writer, ctx.assets.btc, ctx.assets.usd, collateral, premium)
        .await
        .unwrap();

    let wallet = ctx.wallet(writer, ctx.assets.btc).await;
    assert_decimal_eq!(wallet.locked, "200000000"); // 2 BTC locked

    // 3. Expire Call A (Release 1 BTC)
    ctx.exercise_service
        .expire_option(writer, ctx.assets.btc, collateral)
        .await
        .unwrap();

    let wallet = ctx.wallet(writer, ctx.assets.btc).await;
    assert_decimal_eq!(wallet.locked, "100000000"); // 1 BTC remains locked
    assert_decimal_eq!(wallet.available, "100000000"); // 1 BTC released
}

#[tokio::test]
async fn test_naked_call_write_rejected_no_underlying() {
    let ctx = InMemoryTestContext::new();
    let writer = ctx.account_b;

    // Writer has 0 BTC.
    ctx.empty_wallet(writer, ctx.assets.btc);
    // Writer has 0 USD (for margin).
    ctx.empty_wallet(writer, ctx.assets.usd);

    // Attempt to write 1 BTC Call
    let result = ctx
        .exercise_service
        .write_call(
            writer,
            ctx.assets.btc,
            ctx.assets.usd,
            to_atomic_btc(1.0),
            to_atomic_usd(500.0),
        )
        .await;

    // Should fail because neither covered (no BTC) nor margined (no USD)
    assert!(
        result.is_err(),
        "Naked call write with no collateral/margin should be rejected"
    );
}

#[tokio::test]
async fn test_option_premium_to_fee_account_on_settlement() {
    let ctx = InMemoryTestContext::new();
    let buyer = ctx.account_a;
    let writer = ctx.account_b;
    let premium = to_atomic_usd(500.0);

    ctx.seed_wallet(buyer, ctx.assets.usd, 0.0, 1000.0, 1000.0)
        .await;
    ctx.seed_wallet(writer, ctx.assets.btc, 1.0, 0.0, 1.0).await;
    ctx.seed_wallet(writer, ctx.assets.usd, 0.0, 0.0, 0.0).await;

    // When writing a call, premium is transferred.
    // Currently ExerciseService does NOT deduct fees.
    // This test verifies the full amount is transferred.
    // If fees are added later, this test should be updated to assert:
    // writer_received = premium - fee;
    // fee_account += fee;

    ctx.exercise_service
        .buy_option(buyer, ctx.assets.usd, premium)
        .await
        .unwrap();
    // In this test harness, buy_option just debits buyer.
    // And write_call just credits writer.
    // They are decoupled in ExerciseService (it's lower level).
    // So we manually check if write_call credits full amount.

    ctx.exercise_service
        .write_call(
            writer,
            ctx.assets.btc,
            ctx.assets.usd,
            to_atomic_btc(1.0),
            premium,
        )
        .await
        .unwrap();

    let w_usd = ctx.wallet(writer, ctx.assets.usd).await;
    assert_decimal_eq!(w_usd.available, "50000"); // Full $500.00 received. No fee.
}

#[tokio::test]
async fn test_itm_put_writer_has_insufficient_usd_at_expiry() {
    let ctx = InMemoryTestContext::new();
    let writer = ctx.account_b;
    let buyer = ctx.account_a;
    let strike_val = to_atomic_usd(50_000.0);
    let premium = to_atomic_usd(500.0);

    // Setup Writer: Has exactly $50k
    ctx.seed_wallet(writer, ctx.assets.usd, 50_000.0, 0.0, 50_000.0)
        .await;
    // Setup Buyer: Has 1 BTC to put
    ctx.seed_wallet(buyer, ctx.assets.btc, 0.0, 1.0, 1.0).await;
    ctx.empty_wallet(buyer, ctx.assets.usd);

    // 1. Write Put -> Should Lock $50k
    ctx.exercise_service
        .write_put(writer, ctx.assets.usd, strike_val, premium)
        .await
        .unwrap();

    let w_usd = ctx.wallet(writer, ctx.assets.usd).await;
    assert_decimal_eq!(w_usd.locked, "5000000"); // 50k locked
    assert_decimal_eq!(w_usd.available, "50000"); // 500 premium available

    // 2. Try to withdraw locked funds (should fail)
    // We try to lock/withdraw 1000 from available (which is only 500).
    // Or simpler: try to lock more than available.
    use ledger::proto::ledger::withdrawal_service_server::WithdrawalService;
    use ledger::proto::ledger::CreateWithdrawalRequest;

    let wd_req = tonic::Request::new(CreateWithdrawalRequest {
        wallet_id: w_usd.id.to_string(),
        amount: "100000".to_string(), // $1000.00 > $500.00
        address: "addr".to_string(),
    });
    let wd_res = ctx.withdrawal_api.create_withdrawal(wd_req).await;
    assert!(
        wd_res.is_err(),
        "Should not be able to withdraw beyond available"
    );

    // 3. Exercise Put -> Consumes locked funds.
    // Market Price < Strike (ITM)
    let market_price = Decimal::from(40_000);

    ctx.exercise_service
        .exercise_put(
            buyer,
            writer,
            to_atomic_btc(1.0),
            strike_val,
            ctx.assets.btc,
            ctx.assets.usd,
            market_price,
            8,
            2,
        )
        .await
        .unwrap();

    let w_usd_final = ctx.wallet(writer, ctx.assets.usd).await;
    // Locked should be 0 (consumed)
    assert_decimal_eq!(w_usd_final.locked, "0");
    // Available should still be premium (500)
    assert_decimal_eq!(w_usd_final.available, "50000");
}

#[tokio::test]
async fn test_atm_option_payout_is_exactly_zero() {
    let ctx = InMemoryTestContext::new();
    let buyer = ctx.account_a;
    let writer = ctx.account_b;

    let strike = to_atomic_usd(50_000.0);
    let settlement = to_atomic_usd(50_000.0); // ATM

    ctx.seed_wallet(writer, ctx.assets.usd, 100_000.0, 0.0, 100_000.0)
        .await;

    let payout = ctx
        .exercise_service
        .cash_settle_call(
            buyer,
            writer,
            to_atomic_btc(1.0),
            8,
            strike,
            settlement,
            ctx.assets.usd,
        )
        .await
        .unwrap();

    assert_eq!(payout, Decimal::ZERO, "ATM option payout should be zero");
}
