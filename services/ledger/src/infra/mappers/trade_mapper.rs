use crate::domain::fills::model::Fill;
use crate::proto::common;

pub struct TradeMapper;

impl TradeMapper {
    pub fn to_proto(fill: Fill) -> common::Trade {
        common::Trade {
            id: fill.trade_id.to_string(),
            tenant_id: fill.tenant_id.to_string(),
            instrument_id: fill.instrument_id.to_string(),
            // For public market data derived from fills, individual order IDs are often redacted or not relevant
            // unless we are looking at a user's specific fill history.
            // Since this mapper handles "Trades" (public execution), we keep them empty as per current logic.
            buy_order_id: "".to_string(),
            sell_order_id: "".to_string(),
            price: fill.price.to_string(),
            quantity: fill.quantity.to_string(),
            meta: fill.meta.to_string(),
            created_at: fill.created_at.timestamp_millis(),
            updated_at: fill.created_at.timestamp_millis(),
        }
    }
}
