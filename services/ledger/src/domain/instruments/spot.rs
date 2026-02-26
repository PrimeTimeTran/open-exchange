use super::handler::InstrumentHandler;
use crate::domain::orders::model::{Order, OrderSide};
use crate::error::Result;
use crate::proto::common::Instrument;
use rust_decimal::Decimal;

pub struct SpotHandler;

impl InstrumentHandler for SpotHandler {
    fn identify_collateral_asset(&self, order: &Order, instrument: &Instrument) -> Result<String> {
        if order.side == OrderSide::Buy {
            Ok(instrument.quote_asset_id.clone())
        } else {
            Ok(instrument.underlying_asset_id.clone())
        }
    }

    fn calculate_raw_collateral_amount(
        &self,
        order: &Order,
        _instrument: &Instrument,
    ) -> Result<Decimal> {
        let remaining_qty = order.quantity - order.filled_quantity;

        if order.side == OrderSide::Buy {
            // For Spot Buy, we lock Price * Quantity (Budget)
            Ok(remaining_qty * order.price)
        } else {
            // For Spot Sell, we lock Quantity (Base Asset)
            Ok(remaining_qty)
        }
    }
}
