use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Asset {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub symbol: String,
    pub decimals: i32,
    pub r#type: String, // crypto, fiat
    pub meta: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
