use super::handler::InstrumentHandler;
use crate::domain::orders::model::{Order, OrderSide};
use crate::proto::common::Instrument;
use crate::error::{Result, AppError};
use rust_decimal::Decimal;
use std::str::FromStr;

pub struct OptionHandler;

impl InstrumentHandler for OptionHandler {
    fn identify_collateral_asset(&self, order: &Order, instrument: &Instrument) -> Result<String> {
        if order.side == OrderSide::Buy {
            // Buyer always pays Premium in Quote Asset
            return Ok(instrument.quote_asset_id.clone());
        }

        // Seller logic depends on Put vs Call
        let option_type = self.get_option_type(instrument)?;
        
        if option_type == "put" {
            // Short Put: Lock Cash (Quote Asset) to buy the underlying later
            Ok(instrument.quote_asset_id.clone())
        } else {
            // Short Call: Lock Underlying (Base Asset) to deliver later
            Ok(instrument.underlying_asset_id.clone())
        }
    }

    fn calculate_raw_collateral_amount(&self, order: &Order, instrument: &Instrument) -> Result<Decimal> {
        let remaining_qty = order.quantity - order.filled_quantity;

        if order.side == OrderSide::Buy {
            // Buy Option: Collateral = Premium = Price * Quantity
            return Ok(remaining_qty * order.price);
        }

        // Seller Logic
        let option_type = self.get_option_type(instrument)?;

        if option_type == "put" {
            // Short Put: Collateral = Strike Price * Quantity
            let strike_price = self.get_strike_price(instrument)?;
            Ok(remaining_qty * strike_price)
        } else {
            // Short Call: Collateral = Quantity (of underlying)
            Ok(remaining_qty)
        }
    }
}

impl OptionHandler {
    fn get_option_type(&self, instrument: &Instrument) -> Result<String> {
        let meta: serde_json::Value = serde_json::from_str(&instrument.meta)
            .map_err(|_| AppError::MalformedRequest("Invalid option metadata".into()))?;
        
        meta.get("option_type")
            .and_then(|v| v.as_str())
            .map(|s| s.to_lowercase())
            .ok_or_else(|| AppError::MalformedRequest("Missing option_type in metadata".into()))
    }

    fn get_strike_price(&self, instrument: &Instrument) -> Result<Decimal> {
        let meta: serde_json::Value = serde_json::from_str(&instrument.meta)
            .map_err(|_| AppError::MalformedRequest("Invalid option metadata".into()))?;
        
        let strike_str = meta.get("strike_price")
            .and_then(|v| v.as_str())
            .ok_or_else(|| AppError::MalformedRequest("Missing strike_price in metadata".into()))?;
            
        Decimal::from_str(strike_str)
            .map_err(|_| AppError::MalformedRequest("Invalid strike_price format".into()))
    }
}
