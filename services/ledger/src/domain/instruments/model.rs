use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Instrument {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub symbol: String,
    pub r#type: String,
    pub status: String,
    pub underlying_asset_id: Uuid,
    pub quote_asset_id: Uuid,
    pub meta: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
