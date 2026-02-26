use crate::domain::instruments::model::Instrument;
use crate::domain::orders::model::Order;
use crate::error::Result;
use rust_decimal::Decimal;

/// Trait for handling instrument-specific logic, specifically around collateral requirements.
pub trait InstrumentHandler: Send + Sync {
    /// Identifies which asset ID should be locked as collateral for this order.
    fn identify_collateral_asset(&self, order: &Order, instrument: &Instrument) -> Result<String>;

    /// Calculates the raw amount (non-atomic) of collateral required.
    fn calculate_raw_collateral_amount(
        &self,
        order: &Order,
        instrument: &Instrument,
    ) -> Result<Decimal>;
}
