#![allow(dead_code)]
pub mod container;
pub mod memory;
pub mod postgres;

use ledger::domain::fees::constants::FeeConstants;
use rust_decimal::prelude::FromPrimitive;
use rust_decimal::Decimal;
use uuid::Uuid;

/// Returned by Object Mother scenario methods on both `InMemoryTestContext`
/// and `PostgresTestContext`. Holds the minimal IDs a test needs to reference
/// a funded account and its wallet without any further setup.
pub struct FundedAccount {
    pub account_id: Uuid,
    pub wallet_id: Uuid,
}

pub fn to_atomic_usd(amount: f64) -> Decimal {
    (Decimal::from_f64(amount).unwrap() * Decimal::new(100, 0)).floor()
}

pub fn to_atomic_btc(amount: f64) -> Decimal {
    (Decimal::from_f64(amount).unwrap() * Decimal::new(100_000_000, 0)).floor()
}

pub fn calc_taker_fee(amount_atomic: Decimal) -> Decimal {
    (amount_atomic * FeeConstants::get_taker_fee()).floor()
}

pub fn calc_maker_fee(amount_atomic: Decimal) -> Decimal {
    (amount_atomic * FeeConstants::get_maker_fee()).floor()
}

#[macro_export]
macro_rules! assert_decimal_eq {
    ($left:expr, $right:expr) => {
        let left_val = $left;
        let right_val = $right;

        // Helper to convert to Decimal
        let to_decimal = |val: &dyn std::fmt::Display| -> rust_decimal::Decimal {
            let s = val.to_string();
            use std::str::FromStr;
            rust_decimal::Decimal::from_str(&s)
                .unwrap_or_else(|_| panic!("Invalid decimal value: {}", s))
        };

        let left_dec = to_decimal(&left_val);
        let right_dec = to_decimal(&right_val);

        assert_eq!(
            left_dec, right_dec,
            "Decimal mismatch: {} != {}",
            left_dec, right_dec
        );
    };
}
