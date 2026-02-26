use crate::domain::trade::model::Trade;
use crate::proto::common::OrderSide;
use crate::proto::ledger::Match;
use chrono::TimeZone;
use rust_decimal::Decimal;
use std::str::FromStr;
use uuid::Uuid;

pub struct MatchMapper;

impl MatchMapper {
    pub fn to_trade(match_data: Match, tenant_id: &str) -> Result<Trade, String> {
        let taker_side_enum = OrderSide::try_from(match_data.taker_side)
            .map_err(|_| format!("Invalid Taker Side value: {}", match_data.taker_side))?;

        let (buy_order_id, sell_order_id) = match taker_side_enum {
            OrderSide::Buy => (
                match_data.taker_order_id.clone(),
                match_data.maker_order_id.clone(),
            ),
            OrderSide::Sell => (
                match_data.maker_order_id.clone(),
                match_data.taker_order_id.clone(),
            ),
            _ => {
                return Err(format!(
                    "Invalid Taker Side for match {}: {:?}",
                    match_data.match_id, taker_side_enum
                ));
            }
        };

        Ok(Trade {
            id: Uuid::new_v4(),
            tenant_id: Uuid::parse_str(tenant_id).map_err(|_| "Invalid tenant ID".to_string())?,
            instrument_id: Uuid::parse_str(&match_data.instrument_id)
                .map_err(|_| "Invalid instrument ID".to_string())?,
            buy_order_id: Uuid::parse_str(&buy_order_id)
                .map_err(|_| "Invalid buy order ID".to_string())?,
            sell_order_id: Uuid::parse_str(&sell_order_id)
                .map_err(|_| "Invalid sell order ID".to_string())?,
            price: Decimal::from_str(&match_data.price).map_err(|_| "Invalid price".to_string())?,
            quantity: Decimal::from_str(&match_data.quantity)
                .map_err(|_| "Invalid quantity".to_string())?,
            meta: serde_json::json!({}),
            created_at: chrono::Utc
                .timestamp_millis_opt(match_data.matched_at)
                .single()
                .unwrap_or_else(chrono::Utc::now),
            updated_at: chrono::Utc::now(),
        })
    }
}
