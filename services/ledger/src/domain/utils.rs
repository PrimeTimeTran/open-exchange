use crate::error::{AppError, Result};
use rust_decimal::Decimal;
use std::str::FromStr;

pub fn parse(s: &str) -> Result<Decimal> {
    Decimal::from_str(s).map_err(|_| AppError::Internal(format!("Invalid decimal string: {}", s)))
}
