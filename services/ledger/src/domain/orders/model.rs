use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use rust_decimal::Decimal;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Order {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub account_id: Uuid,
    pub instrument_id: Uuid,
    pub side: String, // "buy" or "sell"
    pub quantity: Decimal,
    pub price: Decimal,
    pub status: String,
    pub filled_quantity: Decimal,
    pub average_fill_price: Decimal,
    pub meta: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Order {
    pub fn new(
        tenant_id: Uuid,
        account_id: Uuid,
        instrument_id: Uuid,
        side: String,
        quantity: Decimal,
        price: Decimal,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            tenant_id,
            account_id,
            instrument_id,
            side,
            quantity,
            price,
            status: "new".to_string(),
            filled_quantity: Decimal::ZERO,
            average_fill_price: Decimal::ZERO,
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }
}
