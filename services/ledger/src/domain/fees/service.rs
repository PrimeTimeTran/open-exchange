use super::constants::FeeConstants;
use async_trait::async_trait;
use rust_decimal::Decimal;

#[async_trait]
pub trait FeeService: Send + Sync {
    fn calculate_fee(&self, qty: Decimal, price: Decimal, role: &str) -> Decimal;
}

#[derive(Clone)]
pub struct StandardFeeService;

impl StandardFeeService {
    pub fn new() -> Self {
        Self {}
    }
}

#[async_trait]
impl FeeService for StandardFeeService {
    fn calculate_fee(&self, qty: Decimal, price: Decimal, role: &str) -> Decimal {
        let rate = if role == "maker" {
            FeeConstants::get_maker_fee()
        } else {
            FeeConstants::get_taker_fee()
        };

        // Fee in Quote Currency (Total * Rate)
        (qty * price) * rate
    }
}
