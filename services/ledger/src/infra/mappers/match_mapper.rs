use crate::proto::ledger::Match;
use crate::proto::common::{Trade, OrderSide};
use uuid::Uuid;

pub struct MatchMapper;

impl MatchMapper {
    pub fn to_trade(match_data: Match, tenant_id: &str) -> Result<Trade, String> {
        let taker_side_enum = OrderSide::try_from(match_data.taker_side)
            .map_err(|_| format!("Invalid Taker Side value: {}", match_data.taker_side))?;

        let (buy_order_id, sell_order_id) = match taker_side_enum {
            OrderSide::Buy => (match_data.taker_order_id.clone(), match_data.maker_order_id.clone()),
            OrderSide::Sell => (match_data.maker_order_id.clone(), match_data.taker_order_id.clone()),
            _ => return Err(format!("Invalid Taker Side for match {}: {:?}", match_data.match_id, taker_side_enum)),
        };

        Ok(Trade {
            id: Uuid::new_v4().to_string(),
            tenant_id: tenant_id.to_string(),
            instrument_id: match_data.instrument_id,
            buy_order_id,
            sell_order_id,
            price: match_data.price,
            quantity: match_data.quantity,
            meta: "{}".to_string(), // Default empty meta
            created_at: match_data.matched_at,
            updated_at: chrono::Utc::now().timestamp_millis(),
        })
    }
}
