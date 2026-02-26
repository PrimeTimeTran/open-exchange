#![allow(dead_code)]
pub mod memory;
pub mod postgres;

use ledger::domain::fees::constants::FeeConstants;
use rust_decimal::prelude::FromPrimitive;
use rust_decimal::Decimal;

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

#[allow(unused_macros)]
#[macro_export]
macro_rules! assert_decimal_val_eq {
    ($left:expr, $right:expr) => {
        assert_eq!(
            rust_decimal::Decimal::from_str(&$left).unwrap(),
            $right,
            "Expected {} but got {}",
            $right,
            &$left
        );
    };
}
