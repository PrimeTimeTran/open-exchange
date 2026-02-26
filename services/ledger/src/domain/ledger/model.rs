use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LedgerEntry {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub event_id: Uuid,
    pub account_id: Uuid,
    pub amount: Decimal,
    pub meta: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LedgerEvent {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub r#type: String,     // "deposit", "trade", "fee"
    pub reference_id: Uuid, // ID of the object causing the event (order_id, deposit_id)
    pub reference_type: String,
    pub status: String,
    pub description: Option<String>,
    pub meta: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
