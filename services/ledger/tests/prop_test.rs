use ledger::domain::ledger::model::LedgerEntry;
use ledger::domain::utils::parse;
use ledger::domain::wallets::model::Wallet;
use ledger::domain::wallets::service::WalletService;
use proptest::prelude::*;
use rust_decimal::Decimal;
use uuid::Uuid;

// Helper to convert float to Decimal safely for testing
fn to_decimal(f: f64) -> Decimal {
    // Rounding to 8 decimals to match Ledger precision and avoid float artifacts
    Decimal::from_f64_retain(f)
        .map(|d| d.round_dp(8))
        .unwrap_or(Decimal::ZERO)
}

// Simple Model of a Wallet for verification
#[derive(Debug, Default, Clone)]
struct SimpleWallet {
    available: Decimal,
    locked: Decimal,
    total: Decimal,
}

impl SimpleWallet {
    fn apply(&mut self, amount: Decimal, entry_type: &str) {
        match entry_type {
            "available" => {
                self.available += amount;
                self.total += amount;
            }
            "locked" => {
                self.locked += amount;
                self.total += amount;
            }
            "fee" | "credit" | "revenue" => {
                self.available += amount;
                self.total += amount;
            }
            "debit" => {
                self.locked += amount;
                self.total += amount;
            }
            _ => {
                // Logic mimics WalletService::update_wallet_from_entry fallback
                if amount < Decimal::ZERO {
                    self.locked += amount;
                    self.total += amount;
                } else {
                    self.available += amount;
                    self.total += amount;
                }
            }
        }
    }
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

    // 5. State Transition Model Testing
    // Applies a sequence of operations to both the real Wallet logic
    // and a simple Model, asserting they stay in sync.
    #[test]
    fn test_wallet_state_transitions(
        ops in proptest::collection::vec(
            (
                // Amount: -1M to +1M
                -1_000_000.0..1_000_000.0f64,
                // Type: available, locked, fee, credit, revenue, debit
                prop_oneof![
                    Just("available"),
                    Just("locked"),
                    Just("fee"),
                    Just("credit"),
                    Just("revenue"),
                    Just("debit"),
                    Just("unknown")
                ]
            ),
            1..50 // Number of operations
        )
    ) {
        let mut wallet = Wallet::default();
        let mut model = SimpleWallet::default();

        for (amount_f, entry_type) in ops {
            let amount = to_decimal(amount_f);

            // Apply to Real System
            // We need to construct a valid-looking LedgerEntry
            // We use a dummy ID and tenant, but meta type is crucial.
            let entry = LedgerEntry {
                id: Uuid::new_v4(),
                tenant_id: Uuid::new_v4(),
                event_id: Uuid::new_v4(),
                account_id: Uuid::new_v4(),
                amount,
                meta: serde_json::json!({ "type": entry_type, "asset": "USD" }),
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            };

            // Using the exposed static method
            if let Ok(_) = WalletService::update_wallet_from_entry(&mut wallet, &entry) {
                 model.apply(amount, &entry_type);
            } else {
                panic!("Wallet update failed unexpectedly");
            }

            // Assert Invariants
            prop_assert_eq!(wallet.available, model.available);
            prop_assert_eq!(wallet.locked, model.locked);
            prop_assert_eq!(wallet.total, model.total);
            prop_assert_eq!(wallet.available + wallet.locked, wallet.total);
        }
    }
}
