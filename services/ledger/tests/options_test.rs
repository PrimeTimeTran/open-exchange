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
use helpers::{to_atomic_usd, to_atomic_btc};
use rust_decimal::Decimal;
use std::str::FromStr;

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
// #[ignore = "Track B: Requires ExerciseService and option instrument type"]
async fn test_option_buy_deducts_premium_from_buyer() {
    let ctx = InMemoryTestContext::new();

    // Setup: option instrument (call, strike $50,000, 30-day expiry)
    let usd_id = ctx.create_asset_api("USD_OPT", "fiat", 2).await;
    let btc_id = ctx.create_asset_api("BTC_OPT", "crypto", 8).await;
    let _ = ctx.create_instrument_api("BTC-CALL-50K", &btc_id, &usd_id).await;
    // In the full implementation, the instrument would include:
    // meta: {"option_type": "call", "strike_price": "50000", "expiry": <timestamp>}

    let premium = to_atomic_usd(500.0); // $500 premium
    ctx.create_wallet_decimal(ctx.account_a, &usd_id, Decimal::ZERO, premium, premium);

    ctx.exercise_service.buy_option(ctx.account_a, &usd_id, premium).await.unwrap();

    let usd_wallet = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &usd_id)
        .await.unwrap().unwrap();

    // After buying, premium is deducted from buyer
    let buyer_total = Decimal::from_str(&usd_wallet.total).unwrap();
    assert!(buyer_total < premium, "Buyer premium should have been deducted");
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
// #[ignore = "Track B: Requires ExerciseService and option instrument type"]
async fn test_option_write_credits_premium_and_locks_collateral() {
    let ctx = InMemoryTestContext::new();

    let usd_id = ctx.create_asset_api("USD_WRT", "fiat", 2).await;
    let btc_id = ctx.create_asset_api("BTC_WRT", "crypto", 8).await;

    let initial_btc = to_atomic_btc(1.0);
    let premium     = to_atomic_usd(500.0);

    ctx.create_wallet_decimal(ctx.account_b, &btc_id, initial_btc, Decimal::ZERO, initial_btc);
    ctx.create_wallet_decimal(ctx.account_b, &usd_id, Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);

    ctx.exercise_service.write_call(ctx.account_b, &btc_id, &usd_id, initial_btc, premium).await.unwrap();

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
// #[ignore = "Track B: Requires ExerciseService and option instrument type"]
async fn test_call_option_exercise_transfers_underlying_at_strike() {
    let ctx = InMemoryTestContext::new();

    let strike_usd = to_atomic_usd(50_000.0); // $50,000 strike
    let qty_btc    = to_atomic_btc(1.0);       // 1.0 BTC

    ctx.create_wallet_decimal(ctx.account_a, &ctx.usd_id.to_string(), Decimal::ZERO, strike_usd, strike_usd);
    ctx.create_wallet_decimal(ctx.account_a, &ctx.btc_id.to_string(), Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);
    ctx.create_wallet_decimal(ctx.account_b, &ctx.btc_id.to_string(), Decimal::ZERO, qty_btc, qty_btc);
    ctx.create_wallet_decimal(ctx.account_b, &ctx.usd_id.to_string(), Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);

    ctx.exercise_service.exercise_call(ctx.account_a, ctx.account_b, qty_btc, strike_usd, &ctx.btc_id.to_string(), &ctx.usd_id.to_string()).await.unwrap();

    let buyer_btc  = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    let writer_btc = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();

    assert_eq!(Decimal::from_str(&buyer_btc.available).unwrap(), qty_btc);
    assert_eq!(Decimal::from_str(&writer_btc.locked).unwrap(), Decimal::ZERO);
}

/// Test: Put Option Exercise Transfers Quote Asset to Buyer at Strike
///
/// When an ITM put is exercised:
///   - Buyer delivers qty of base asset (BTC) and receives strike × qty in USD
///   - Writer's locked USD collateral is consumed
///
/// Assert: buyer.usd += strike*qty; buyer.btc -= qty; writer.usd_locked = 0
#[tokio::test]
// #[ignore = "Track B: Requires ExerciseService and option instrument type"]
async fn test_put_option_exercise_transfers_quote_at_strike() {
    let ctx = InMemoryTestContext::new();

    let strike_usd = to_atomic_usd(50_000.0);
    let qty_btc    = to_atomic_btc(1.0);

    ctx.create_wallet_decimal(ctx.account_a, &ctx.btc_id.to_string(), Decimal::ZERO, qty_btc, qty_btc);
    ctx.create_wallet_decimal(ctx.account_a, &ctx.usd_id.to_string(), Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);
    ctx.create_wallet_decimal(ctx.account_b, &ctx.usd_id.to_string(), Decimal::ZERO, strike_usd, strike_usd);
    ctx.create_wallet_decimal(ctx.account_b, &ctx.btc_id.to_string(), Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);

    ctx.exercise_service.exercise_put(ctx.account_a, ctx.account_b, qty_btc, strike_usd, &ctx.btc_id.to_string(), &ctx.usd_id.to_string()).await.unwrap();

    let buyer_usd  = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    let writer_usd = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();

    assert_eq!(Decimal::from_str(&buyer_usd.available).unwrap(), strike_usd);
    assert_eq!(Decimal::from_str(&writer_usd.locked).unwrap(), Decimal::ZERO);
}

/// Test: OTM Option Expiry Releases Writer's Locked Collateral
///
/// An out-of-the-money option that expires worthless must release the
/// writer's locked collateral back to available. The buyer's premium is
/// kept by the exchange / writer — it is non-refundable.
///
/// Assert: writer.btc_locked = 0; writer.btc_available = original_collateral
#[tokio::test]
// #[ignore = "Track B: Requires ExerciseService and option instrument type"]
async fn test_otm_option_expiry_releases_writer_collateral() {
    let ctx = InMemoryTestContext::new();

    let collateral = to_atomic_btc(1.0);
    ctx.create_wallet_decimal(ctx.account_b, &ctx.btc_id.to_string(), Decimal::ZERO, collateral, collateral);

    ctx.exercise_service.expire_option(ctx.account_b, &ctx.btc_id.to_string(), collateral).await.unwrap();
    // Expected: locked BTC is released to available

    let writer_btc = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string())
        .await.unwrap().unwrap();

    assert_eq!(Decimal::from_str(&writer_btc.locked).unwrap(), Decimal::ZERO);
    assert_eq!(Decimal::from_str(&writer_btc.available).unwrap(), collateral);
}

/// Test: Option Assignment Debits the Assigned Writer's Collateral
///
/// When a call option is exercised, a specific open writer position is
/// randomly assigned. That writer's locked base asset is consumed and
/// transferred to the buyer. Other writers' positions are unaffected.
///
/// Assert: assigned_writer.btc_locked = 0; unassigned_writer.btc_locked unchanged
#[tokio::test]
// #[ignore = "Track B: Requires ExerciseService and option instrument type"]
async fn test_option_assignment_debits_writer_on_exercise() {
    let ctx = InMemoryTestContext::new();

    let collateral = to_atomic_btc(1.0);
    let strike_usd = to_atomic_usd(50_000.0);

    // Two writers, same option contract
    ctx.create_wallet_decimal(ctx.account_a, &ctx.btc_id.to_string(), Decimal::ZERO, collateral, collateral);
    ctx.create_wallet_decimal(ctx.account_b, &ctx.btc_id.to_string(), Decimal::ZERO, collateral, collateral);

    // Buyer setup for exercise payment
    let buyer = uuid::Uuid::new_v4();
    ctx.create_wallet_decimal(buyer, &ctx.usd_id.to_string(), Decimal::ZERO, strike_usd, strike_usd);

    ctx.exercise_service.exercise_and_assign(buyer, &[ctx.account_a, ctx.account_b], collateral, strike_usd, &ctx.btc_id.to_string(), &ctx.usd_id.to_string()).await.unwrap();
    // Only ONE writer is assigned; the other's collateral is untouched.

    // After assignment, total locked across both writers should equal exactly 1 collateral (the unassigned one)
    let writer_a = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    let writer_b = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();

    let total_locked = Decimal::from_str(&writer_a.locked).unwrap()
        + Decimal::from_str(&writer_b.locked).unwrap();

    // One was assigned (locked → 0), one was not (locked = collateral)
    assert_eq!(total_locked, collateral, "Exactly one writer should remain locked");
}

/// Test: Writing a Call Fails If Insufficient Collateral
#[tokio::test]
async fn test_write_call_fails_insufficient_collateral() {
    let ctx = InMemoryTestContext::new();

    let initial_btc = to_atomic_btc(0.5); // Not enough for 1.0 BTC contract
    let premium     = to_atomic_usd(500.0);
    let contract_qty = to_atomic_btc(1.0);

    ctx.create_wallet_decimal(ctx.account_b, &ctx.btc_id.to_string(), initial_btc, Decimal::ZERO, initial_btc);
    ctx.create_wallet_decimal(ctx.account_b, &ctx.usd_id.to_string(), Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);

    let result = ctx.exercise_service.write_call(
        ctx.account_b, 
        &ctx.btc_id.to_string(), 
        &ctx.usd_id.to_string(), 
        contract_qty, 
        premium
    ).await;

    assert!(result.is_err(), "Should fail due to insufficient collateral");
}

/// Test: Exercise Call Fails If Buyer Insufficient Funds
#[tokio::test]
async fn test_exercise_call_fails_insufficient_buyer_funds() {
    let ctx = InMemoryTestContext::new();

    let strike_usd = to_atomic_usd(50_000.0);
    let qty_btc    = to_atomic_btc(1.0);

    // Buyer has 0 locked USD, but needs 50,000 locked
    ctx.create_wallet_decimal(ctx.account_a, &ctx.usd_id.to_string(), Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);
    ctx.create_wallet_decimal(ctx.account_a, &ctx.btc_id.to_string(), Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);
    
    // Writer has everything ready
    ctx.create_wallet_decimal(ctx.account_b, &ctx.btc_id.to_string(), qty_btc, Decimal::ZERO, qty_btc);

    let result = ctx.exercise_service.exercise_call(
        ctx.account_a, 
        ctx.account_b, 
        qty_btc, 
        strike_usd, 
        &ctx.btc_id.to_string(), 
        &ctx.usd_id.to_string()
    ).await;

    assert!(result.is_err(), "Should fail due to insufficient buyer funds");
}

/// Test: Partial Exercise Updates Balances Correctly
///
/// If a buyer holds multiple contracts or a large position, they might exercise only a portion.
/// The writer should only release/consume the proportional collateral.
#[tokio::test]
async fn test_partial_exercise_updates_balances_correctly() {
    let ctx = InMemoryTestContext::new();

    let strike_usd_per_btc = to_atomic_usd(50_000.0);
    let total_qty_btc      = to_atomic_btc(2.0); // Writer wrote 2 BTC contracts
    let exercise_qty_btc   = to_atomic_btc(0.5); // Buyer exercises 0.5 BTC
    let exercise_cost      = (strike_usd_per_btc * Decimal::from_str("0.5").unwrap()).floor(); // $25,000

    // Buyer Setup: needs $25,000 locked for exercise
    ctx.create_wallet_decimal(ctx.account_a, &ctx.usd_id.to_string(), Decimal::ZERO, exercise_cost, exercise_cost);
    ctx.create_wallet_decimal(ctx.account_a, &ctx.btc_id.to_string(), Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);

    // Writer Setup: locked 2.0 BTC collateral
    ctx.create_wallet_decimal(ctx.account_b, &ctx.btc_id.to_string(), Decimal::ZERO, total_qty_btc, total_qty_btc);
    ctx.create_wallet_decimal(ctx.account_b, &ctx.usd_id.to_string(), Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);

    ctx.exercise_service.exercise_call(
        ctx.account_a, 
        ctx.account_b, 
        exercise_qty_btc, 
        exercise_cost, 
        &ctx.btc_id.to_string(), 
        &ctx.usd_id.to_string()
    ).await.unwrap();

    // Verify Buyer
    let buyer_btc = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    assert_eq!(Decimal::from_str(&buyer_btc.available).unwrap(), exercise_qty_btc);

    // Verify Writer: Should still have 1.5 BTC locked (2.0 - 0.5)
    let writer_btc = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    let expected_remaining_locked = total_qty_btc - exercise_qty_btc;
    assert_eq!(Decimal::from_str(&writer_btc.locked).unwrap(), expected_remaining_locked);
}

/// Test: Expire Option Idempotency
///
/// Calling expire on an option where collateral is already released (or 0) should be safe.
#[tokio::test]
async fn test_expire_option_idempotency() {
    let ctx = InMemoryTestContext::new();
    let collateral = to_atomic_btc(1.0);

    // Start with 0 locked
    ctx.create_wallet_decimal(ctx.account_b, &ctx.btc_id.to_string(), Decimal::ZERO, Decimal::ZERO, collateral);

    // Should succeed but do nothing
    let result = ctx.exercise_service.expire_option(
        ctx.account_b, 
        &ctx.btc_id.to_string(), 
        collateral
    ).await;
    
    assert!(result.is_ok());

    let writer_btc = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    assert_eq!(Decimal::from_str(&writer_btc.locked).unwrap(), Decimal::ZERO);
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
    ctx.create_wallet_decimal(ctx.account_a, &ctx.usd_id.to_string(), Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);

    // Setup Writer (needs funds to pay out)
    // Writer must have enough available or locked funds.
    // In a real scenario, margin would be locked. Here we just ensure they have the cash.
    ctx.create_wallet_decimal(ctx.account_b, &ctx.usd_id.to_string(), expected_payout, Decimal::ZERO, expected_payout);

    // 8 decimals for BTC
    let payout = ctx.exercise_service.cash_settle_call(
        ctx.account_a,
        ctx.account_b,
        qty_btc,
        8,
        strike_price,
        settlement_price,
        &ctx.usd_id.to_string()
    ).await.unwrap();

    assert_eq!(payout, expected_payout);

    // Verify balances
    let buyer_usd = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    let writer_usd = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();

    assert_eq!(Decimal::from_str(&buyer_usd.available).unwrap(), expected_payout);
    assert_eq!(Decimal::from_str(&writer_usd.available).unwrap(), Decimal::ZERO);
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
    ctx.create_wallet_decimal(ctx.account_a, &ctx.usd_id.to_string(), Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);

    // Setup Writer
    ctx.create_wallet_decimal(ctx.account_b, &ctx.usd_id.to_string(), expected_payout, Decimal::ZERO, expected_payout);

    // 8 decimals for BTC
    let payout = ctx.exercise_service.cash_settle_put(
        ctx.account_a,
        ctx.account_b,
        qty_btc,
        8,
        strike_price,
        settlement_price,
        &ctx.usd_id.to_string()
    ).await.unwrap();

    assert_eq!(payout, expected_payout);

    // Verify balances
    let buyer_usd = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    let writer_usd = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();

    assert_eq!(Decimal::from_str(&buyer_usd.available).unwrap(), expected_payout);
    assert_eq!(Decimal::from_str(&writer_usd.available).unwrap(), Decimal::ZERO);
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
    let premium      = to_atomic_usd(5_000.0);
    let qty_btc      = to_atomic_btc(100.0); // 100 units
    
    // --- Scenario 1: ITM Close at $55,000 ---
    {
        let settlement_price = to_atomic_usd(55_000.0);
        let expected_payout  = to_atomic_usd(500_000.0); // (55k - 50k) * 100

        // Setup Writer: Has 100 BTC, and enough USD to cover settlement (500k).
        let writer = uuid::Uuid::new_v4();
        
        // Credit BTC (100) for collateral
        ctx.create_wallet_decimal(writer, &ctx.btc_id.to_string(), qty_btc, Decimal::ZERO, qty_btc);
        
        // Credit USD (500k) for settlement payout capability
        ctx.create_wallet_decimal(writer, &ctx.usd_id.to_string(), expected_payout, Decimal::ZERO, expected_payout);

        // Buyer (to receive payout)
        let buyer = uuid::Uuid::new_v4();
        ctx.create_wallet_decimal(buyer, &ctx.usd_id.to_string(), Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);

        // 1. Write Call
        ctx.exercise_service.write_call(writer, &ctx.btc_id.to_string(), &ctx.usd_id.to_string(), qty_btc, premium).await.unwrap();

        // Check Writer State: BTC Locked, USD = Initial + Premium
        let w_btc = ctx.wallet_service.get_wallet_by_account_and_asset(&writer.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
        let w_usd = ctx.wallet_service.get_wallet_by_account_and_asset(&writer.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
        
        assert_eq!(Decimal::from_str(&w_btc.locked).unwrap(), qty_btc);
        // Available USD = Initial (500k) + Premium (5k)
        let initial_plus_premium = expected_payout + premium;
        assert_eq!(Decimal::from_str(&w_usd.available).unwrap(), initial_plus_premium);

        // 2. Settlement (ITM)
        ctx.exercise_service.cash_settle_call(
            buyer, writer, qty_btc, 8, strike_price, settlement_price, &ctx.usd_id.to_string()
        ).await.unwrap();

        // 3. Release Collateral (Trade Over)
        ctx.exercise_service.expire_option(writer, &ctx.btc_id.to_string(), qty_btc).await.unwrap();

        // Assertions
        let w_usd_final = ctx.wallet_service.get_wallet_by_account_and_asset(&writer.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
        let w_btc_final = ctx.wallet_service.get_wallet_by_account_and_asset(&writer.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
        let b_usd_final = ctx.wallet_service.get_wallet_by_account_and_asset(&buyer.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();

        // Writer USD: (500k + 5k) - 500k Payout = 5k (Retains Premium)
        assert_eq!(Decimal::from_str(&w_usd_final.available).unwrap(), premium);
        
        // Writer BTC: Fully released
        assert_eq!(Decimal::from_str(&w_btc_final.locked).unwrap(), Decimal::ZERO);
        assert_eq!(Decimal::from_str(&w_btc_final.available).unwrap(), qty_btc);
        
        // Buyer USD: +500k (Payout)
        assert_eq!(Decimal::from_str(&b_usd_final.available).unwrap(), expected_payout);
    }

    // --- Scenario 2: OTM Close at $45,000 ---
    {
        let settlement_price = to_atomic_usd(45_000.0);
        
        let writer = uuid::Uuid::new_v4();
        // Setup Writer: 1 BTC, 0 USD
        ctx.create_wallet_decimal(writer, &ctx.btc_id.to_string(), qty_btc, Decimal::ZERO, qty_btc);
        ctx.create_wallet_decimal(writer, &ctx.usd_id.to_string(), Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);
        let buyer = uuid::Uuid::new_v4();
        ctx.create_wallet_decimal(buyer, &ctx.usd_id.to_string(), Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);

        // 1. Write Call
        ctx.exercise_service.write_call(writer, &ctx.btc_id.to_string(), &ctx.usd_id.to_string(), qty_btc, premium).await.unwrap();

        // 2. Settlement (OTM - Payout 0)
        let payout = ctx.exercise_service.cash_settle_call(
            buyer, writer, qty_btc, 8, strike_price, settlement_price, &ctx.usd_id.to_string()
        ).await.unwrap();
        assert_eq!(payout, Decimal::ZERO);

        // 3. Release Collateral
        ctx.exercise_service.expire_option(writer, &ctx.btc_id.to_string(), qty_btc).await.unwrap();

        let w_usd = ctx.wallet_service.get_wallet_by_account_and_asset(&writer.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
        
        // Writer keeps premium ($5000)
        assert_eq!(Decimal::from_str(&w_usd.available).unwrap(), premium);
    }

    // --- Scenario 3: ATM Close at $50,000 ---
    {
        let settlement_price = to_atomic_usd(50_000.0);
        
        let writer = uuid::Uuid::new_v4();
        ctx.create_wallet_decimal(writer, &ctx.btc_id.to_string(), qty_btc, Decimal::ZERO, qty_btc);
        ctx.create_wallet_decimal(writer, &ctx.usd_id.to_string(), Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);
        let buyer = uuid::Uuid::new_v4();
        ctx.create_wallet_decimal(buyer, &ctx.usd_id.to_string(), Decimal::ZERO, Decimal::ZERO, Decimal::ZERO);

        // 1. Write Call
        ctx.exercise_service.write_call(writer, &ctx.btc_id.to_string(), &ctx.usd_id.to_string(), qty_btc, premium).await.unwrap();

        // 2. Settlement (ATM - Payout 0)
        let payout = ctx.exercise_service.cash_settle_call(
            buyer, writer, qty_btc, 8, strike_price, settlement_price, &ctx.usd_id.to_string()
        ).await.unwrap();
        assert_eq!(payout, Decimal::ZERO);

        // 3. Release Collateral
        ctx.exercise_service.expire_option(writer, &ctx.btc_id.to_string(), qty_btc).await.unwrap();

        let w_usd = ctx.wallet_service.get_wallet_by_account_and_asset(&writer.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
        
        // Writer keeps premium ($5000)
        assert_eq!(Decimal::from_str(&w_usd.available).unwrap(), premium);
    }
}
