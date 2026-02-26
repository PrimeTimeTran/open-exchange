/// Track B — Corporate Actions Tests
///
/// These tests define expected ledger behavior for equity corporate actions
/// (dividends, splits, reverse splits). They require `CorporateActionService`
/// which is not yet implemented.
///
/// To run once implemented:
///   cargo test -- --ignored corporate
///
/// Required domain additions:
///   - `CorporateActionService::pay_dividend(instrument_id, amount_per_share, record_date)`
///   - `CorporateActionService::apply_split(instrument_id, ratio, split_type)`
///   - Record date snapshot of all holders
mod helpers;
use helpers::memory::InMemoryTestContext;
use rust_decimal::Decimal;
use std::str::FromStr;

fn to_atomic_usd(amount: f64) -> Decimal {
    use rust_decimal::prelude::FromPrimitive;
    (Decimal::from_f64(amount).unwrap() * Decimal::new(100, 0)).floor()
}

/// Test: Cash Dividend Is Credited to All Equity Holders
///
/// When a company declares a cash dividend, every account holding shares
/// on the record date receives dividend_per_share × qty_held credited to
/// their quote (cash) wallet.
///
/// The exchange's corporate action service must:
///   1. Snapshot all holders at the record date
///   2. Credit each holder's cash wallet proportionally
///   3. Debit the company's retained earnings / issuer account
///
/// Conservation: sum of all credits == total dividend payout
///
/// Scenario: 2 holders:
///   - account_a: 10 shares → receives 10 × $1.50 = $15.00
///   - account_b:  5 shares → receives  5 × $1.50 = $7.50
///
/// Assert: each holder receives correct USD credit; total paid = $22.50
#[tokio::test]
#[ignore = "Track B: Requires CorporateActionService implementation"]
async fn test_cash_dividend_credited_to_all_equity_holders() {
    let ctx = InMemoryTestContext::new();

    let aapl_id = ctx.create_asset_api("AAPL_DIV", "equity", 2).await;
    let usd_id  = ctx.create_asset_api("USD_DIV",  "fiat",   2).await;

    let _ = ctx.create_instrument_api("AAPL_DIV-USD", &aapl_id, &usd_id).await;

    // Holder A: 10 shares (1,000 atomic at 2 decimals)
    ctx.create_wallet(ctx.account_a, &aapl_id, 1_000.0, 0.0, 1_000.0);
    ctx.create_wallet(ctx.account_a, &usd_id,  0.0,     0.0, 0.0);

    // Holder B: 5 shares (500 atomic)
    ctx.create_wallet(ctx.account_b, &aapl_id, 500.0, 0.0, 500.0);
    ctx.create_wallet(ctx.account_b, &usd_id,  0.0,   0.0, 0.0);

    let dividend_per_share_atomic = to_atomic_usd(1.50); // $1.50 in cents = 150

    // TODO: ctx.corporate_action_service.pay_dividend(aapl_id, dividend_per_share=150, record_date=now).await;

    let holder_a_usd = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &usd_id).await.unwrap().unwrap();
    let holder_b_usd = ctx.wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &usd_id).await.unwrap().unwrap();

    // 10 shares × 150 cents = 1,500 cents = $15.00
    let expected_a = dividend_per_share_atomic * Decimal::from(10);
    // 5 shares × 150 cents = 750 cents = $7.50
    let expected_b = dividend_per_share_atomic * Decimal::from(5);

    assert_eq!(Decimal::from_str(&holder_a_usd.available).unwrap(), expected_a,
        "Account A should receive $15.00 dividend");
    assert_eq!(Decimal::from_str(&holder_b_usd.available).unwrap(), expected_b,
        "Account B should receive $7.50 dividend");

    // Conservation: total credits = total payout
    let total_paid = expected_a + expected_b;
    let _ = total_paid; // TODO: verify against issuer debit

    todo!("Implement CorporateActionService then complete this test")
}

/// Test: Stock Split Doubles Quantity and Halves Reference Price
///
/// A 2:1 forward split doubles every holder's share count. The economic
/// value (notional) must remain unchanged: 2× shares × (0.5× price) = same.
///
/// The ledger must update wallet balances for all holders atomically.
///
/// Scenario: account_a holds 100 shares @ $200 reference price
///   After 2:1 split:
///     - account_a.aapl_available = 200 (doubled)
///     - instrument reference price = $100 (halved)
///
/// Assert: balance doubled; notional unchanged
#[tokio::test]
#[ignore = "Track B: Requires CorporateActionService implementation"]
async fn test_stock_split_doubles_quantity_halves_book_price() {
    let ctx = InMemoryTestContext::new();

    let aapl_id = ctx.create_asset_api("AAPL_SPL", "equity", 2).await;
    let usd_id  = ctx.create_asset_api("USD_SPL",  "fiat",   2).await;
    let _instr  = ctx.create_instrument_api("AAPL_SPL-USD", &aapl_id, &usd_id).await;

    // Account A: 100 shares (10,000 atomic at 2 decimals)
    let initial_shares = 10_000.0_f64;
    ctx.create_wallet(ctx.account_a, &aapl_id, initial_shares, 0.0, initial_shares);
    ctx.create_wallet(ctx.account_a, &usd_id,  0.0, 0.0, 0.0);

    // TODO: ctx.corporate_action_service.apply_split(aapl_id, ratio=2, split_type="forward").await;

    let wallet_after = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &aapl_id)
        .await.unwrap().unwrap();

    let expected_shares = Decimal::from_str(&initial_shares.to_string()).unwrap()
        * Decimal::from(2);

    assert_eq!(Decimal::from_str(&wallet_after.available).unwrap(), expected_shares,
        "2:1 split should double share count");

    // Notional value must be conserved:
    // pre:  100 shares × $200 = $20,000
    // post: 200 shares × $100 = $20,000
    // (reference price halving is verified via instrument metadata)

    todo!("Implement CorporateActionService then complete this test")
}

/// Test: Reverse Split Halves Quantity and Pays Odd-Lot Remainder in Cash
///
/// A 1:2 reverse split halves every holder's share count, rounding down to
/// whole shares. Any fractional remainder (odd lot) is paid out in cash at
/// the pre-split price.
///
/// Scenario: account holds 5 shares (1:2 reverse split → 2.5 shares → 2 shares + cash)
///   - New share count: 2 (floor of 2.5)
///   - Cash payout: 0.5 × pre-split price
///
/// Assert: shares = floor(original / 2); cash += (original mod 2) × price
#[tokio::test]
#[ignore = "Track B: Requires CorporateActionService implementation"]
async fn test_reverse_split_halves_quantity_doubles_price() {
    let ctx = InMemoryTestContext::new();

    let aapl_id = ctx.create_asset_api("AAPL_RSP", "equity", 2).await;
    let usd_id  = ctx.create_asset_api("USD_RSP",  "fiat",   2).await;
    let _instr  = ctx.create_instrument_api("AAPL_RSP-USD", &aapl_id, &usd_id).await;

    // 5 shares (500 atomic at 2 decimals) — odd number for the 1:2 reverse split
    ctx.create_wallet(ctx.account_a, &aapl_id, 500.0, 0.0, 500.0);
    ctx.create_wallet(ctx.account_a, &usd_id,  0.0,   0.0, 0.0);

    // Pre-split reference price: $100 per share
    let pre_split_price_cents = to_atomic_usd(100.0); // 10,000 cents

    // TODO: ctx.corporate_action_service.apply_split(aapl_id, ratio=2, split_type="reverse").await;

    let shares_after = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &aapl_id)
        .await.unwrap().unwrap();
    let cash_after = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &usd_id)
        .await.unwrap().unwrap();

    // 5 shares / 2 = 2 full shares + 1 odd lot share (0.5 original = 50 atomic / 2)
    let expected_shares_atomic = Decimal::from(200); // 2.00 shares in 2-decimal form
    assert_eq!(Decimal::from_str(&shares_after.available).unwrap(), expected_shares_atomic,
        "After 1:2 reverse split, 5 shares → 2 shares");

    // Odd lot cash payout: 1 leftover original share × $100 / 2 = $50
    let odd_lot_shares = Decimal::from(1); // 1 original share didn't make it
    let cash_payout = odd_lot_shares * pre_split_price_cents; // conceptual
    let _ = cash_payout;

    assert!(Decimal::from_str(&cash_after.available).unwrap() > Decimal::ZERO,
        "Odd-lot remainder should be paid out in cash");

    todo!("Implement CorporateActionService then complete this test")
}
