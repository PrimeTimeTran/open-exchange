use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Order {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub account_id: Uuid,
    pub instrument_id: Uuid,
    pub side: String, // "buy" or "sell"
    pub quantity: f64,
    pub price: f64,
    pub status: String,
    pub filled_quantity: f64,
    pub average_fill_price: f64,
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
        quantity: f64,
        price: f64,
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
            filled_quantity: 0.0,
            average_fill_price: 0.0,
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }
}
