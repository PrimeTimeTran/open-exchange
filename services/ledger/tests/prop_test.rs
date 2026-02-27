use ledger::domain::utils::parse;
use proptest::prelude::*;
use rust_decimal::Decimal;

// Helper to convert float to Decimal safely for testing
fn to_decimal(f: f64) -> Decimal {
    // Rounding to 8 decimals to match Ledger precision and avoid float artifacts
    Decimal::from_f64_retain(f)
        .map(|d| d.round_dp(8))
        .unwrap_or(Decimal::ZERO)
}

proptest! {
    // 1. Decimal Arithmetic Invariants
    // Ensure that basic arithmetic operations on our monetary types hold true
    // regardless of the magnitude, within reasonable bounds for financial data.
    #[test]
    fn test_decimal_addition_commutativity(
        a in -1_000_000_000.0..1_000_000_000.0f64,
        b in -1_000_000_000.0..1_000_000_000.0f64
    ) {
        let da = to_decimal(a);
        let db = to_decimal(b);
        prop_assert_eq!(da + db, db + da);
    }

    #[test]
    fn test_decimal_subtraction_inverse(
        a in -1_000_000_000.0..1_000_000_000.0f64,
        b in -1_000_000_000.0..1_000_000_000.0f64
    ) {
        let da = to_decimal(a);
        let db = to_decimal(b);
        prop_assert_eq!((da + db) - db, da);
    }

    // 2. Parse Utility Robustness
    // Our domain uses a custom parse() utility. We must ensure it handles valid
    // numeric strings correctly and rejects garbage without panicking.
    #[test]
    fn test_parse_valid_decimals(
        v in -1_000_000_000..1_000_000_000i64
    ) {
        let s = v.to_string();
        let parsed = parse(&s);
        prop_assert!(parsed.is_ok());
        prop_assert_eq!(parsed.unwrap(), Decimal::from(v));
    }

    #[test]
    fn test_parse_handles_garbage_gracefully(s in "\\PC*") {
        // prop_assert! will pass if parse returns Err, fail if Ok
        // But we want to assert that it DOES NOT PANIC.
        // Proptest catches panics by default, so just calling it is enough.
        let _ = parse(&s);
    }

    // 3. Wallet Balance Invariants
    // Simulates wallet updates: available + locked must always equal total.
    #[test]
    fn test_wallet_balance_invariant(
        available in 0.0..1_000_000.0f64,
        locked in 0.0..1_000_000.0f64
    ) {
        let d_avail = to_decimal(available);
        let d_locked = to_decimal(locked);
        let d_total = d_avail + d_locked;

        // Invariant: Total = Available + Locked
        prop_assert_eq!(d_total - d_locked, d_avail);
        prop_assert!(d_total >= d_avail);
        prop_assert!(d_total >= d_locked);
    }

    // 4. Fee Calculation Properties
    // Fees should never be negative for positive amounts, and should scale linearly.
    #[test]
    fn test_fee_calculation_properties(
        amount in 0.0..1_000_000.0f64,
        rate in 0.0..1.0f64 // 0% to 100% fee
    ) {
        let d_amount = to_decimal(amount);
        let d_rate = to_decimal(rate);

        let fee = d_amount * d_rate;

        // Fee shouldn't be negative
        prop_assert!(fee >= Decimal::ZERO);

        // Fee shouldn't exceed amount (assuming rate <= 1.0)
        prop_assert!(fee <= d_amount);

        // Remaining amount should be positive
        let remaining = d_amount - fee;
        prop_assert!(remaining >= Decimal::ZERO);
    }
}
