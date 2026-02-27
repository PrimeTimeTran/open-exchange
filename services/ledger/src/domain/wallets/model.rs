use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Wallet {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub user_id: String,
    pub account_id: Uuid,
    pub asset_id: Uuid,
    pub available: Decimal,
    pub locked: Decimal,
    pub total: Decimal,
    pub version: i32,
    pub status: String,
    pub meta: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
