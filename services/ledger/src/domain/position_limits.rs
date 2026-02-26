use crate::domain::utils::parse;
/// Position limit enforcement service.
///
/// Provides configurable checks for:
///   - per-order size cap
///   - per-account total notional exposure cap
///   - per-instrument open interest cap
///   - single-asset concentration limit (percentage of portfolio)
///
/// All limits are set at construction time. The service is stateless otherwise;
/// it does not persist anything to the database.
use crate::error::{AppError, Result};
use rust_decimal::Decimal;
use std::str::FromStr;

/// Configuration for a `PositionLimitService` instance.
#[derive(Clone, Debug)]
pub struct PositionLimitConfig {
    /// Maximum quantity allowed in a single order (in base asset atomic units).
    pub max_order_size: Decimal,
    /// Maximum total open notional per account (in quote asset atomic units).
    pub max_notional_per_account: Decimal,
    /// Maximum total open interest per instrument (in base asset atomic units).
    pub max_open_interest: Decimal,
    /// Maximum fraction of portfolio value in any single asset (e.g. 0.20 = 20%).
    pub max_concentration: Decimal,
}

impl Default for PositionLimitConfig {
    fn default() -> Self {
        Self {
            max_order_size: parse("10000000000").unwrap(), // 100 BTC (8 decimals)
            max_notional_per_account: parse("50000000").unwrap(), // $500,000 (2 decimals)
            max_open_interest: parse("100000000000").unwrap(), // 1,000 BTC (8 decimals)
            max_concentration: Decimal::from_str("1.00").unwrap(), // 100% (effectively disabled for standard)
        }
    }
}

#[derive(Clone)]
pub struct PositionLimitService {
    config: PositionLimitConfig,
}

impl PositionLimitService {
    pub fn new(config: PositionLimitConfig) -> Self {
        Self { config }
    }

    pub fn with_defaults() -> Self {
        Self::new(PositionLimitConfig::default())
    }

    // ── Checks ───────────────────────────────────────────────────────────────

    /// Reject an order whose quantity exceeds the per-order size cap.
    pub fn check_order_size(&self, qty: Decimal) -> Result<()> {
        if qty > self.config.max_order_size {
            return Err(AppError::ValidationError(format!(
                "Order size {} exceeds max allowed {} (position limit)",
                qty, self.config.max_order_size
            )));
        }
        Ok(())
    }

    /// Reject an order if adding `new_notional` would exceed the per-account cap.
    ///
    /// `current_notional` is the sum of all existing open notional for the account.
    pub fn check_notional_exposure(
        &self,
        current_notional: Decimal,
        new_notional: Decimal,
    ) -> Result<()> {
        if current_notional + new_notional > self.config.max_notional_per_account {
            return Err(AppError::ValidationError(format!(
                "Adding notional {} would push account to {} which exceeds cap {}",
                new_notional,
                current_notional + new_notional,
                self.config.max_notional_per_account
            )));
        }
        Ok(())
    }

    /// Reject an order if adding `qty` would push open interest above the cap.
    ///
    /// `current_open_interest` is the total open quantity across all accounts.
    pub fn check_open_interest(&self, current_open_interest: Decimal, qty: Decimal) -> Result<()> {
        if current_open_interest + qty > self.config.max_open_interest {
            return Err(AppError::ValidationError(format!(
                "Adding {} would push open interest to {} which exceeds cap {}",
                qty,
                current_open_interest + qty,
                self.config.max_open_interest
            )));
        }
        Ok(())
    }

    /// Reject a buy order if it would make a single asset exceed `max_concentration`
    /// of total portfolio value.
    ///
    /// * `current_asset_value` – current mark value of the asset in the account.
    /// * `new_asset_value`     – additional value being purchased.
    /// * `total_portfolio_value` – total portfolio value at current marks.
    pub fn check_concentration(
        &self,
        current_asset_value: Decimal,
        new_asset_value: Decimal,
        total_portfolio_value: Decimal,
    ) -> Result<()> {
        if total_portfolio_value <= Decimal::ZERO {
            return Ok(());
        }
        let new_concentration = (current_asset_value + new_asset_value) / total_portfolio_value;
        if new_concentration > self.config.max_concentration {
            return Err(
                AppError::ValidationError(
                    format!(
                        "Purchase would make asset {:.2}% of portfolio, exceeding {:.2}% concentration limit",
                        new_concentration * Decimal::from(100),
                        self.config.max_concentration * Decimal::from(100)
                    )
                )
            );
        }
        Ok(())
    }
}
