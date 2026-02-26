use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Deposit {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub account_id: Uuid,
    pub asset_id: String,
    pub wallet_id: Uuid,
    pub amount: Decimal,
    pub fee: Decimal,
    pub status: String,
    pub transaction_ref: String, // tx_hash
    pub meta: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
