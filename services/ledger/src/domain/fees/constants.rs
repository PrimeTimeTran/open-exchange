use rust_decimal::Decimal;

pub struct FeeConstants;

impl FeeConstants {
    pub const MAKER_FEE_RATE: &'static str = "0.001"; // 0.1%
    pub const TAKER_FEE_RATE: &'static str = "0.002"; // 0.2%

    pub fn get_maker_fee() -> Decimal {
        use std::str::FromStr;
        Decimal::from_str(Self::MAKER_FEE_RATE).unwrap()
    }

    pub fn get_taker_fee() -> Decimal {
        use std::str::FromStr;
        Decimal::from_str(Self::TAKER_FEE_RATE).unwrap()
    }
}
