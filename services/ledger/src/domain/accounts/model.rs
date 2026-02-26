use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Account {
    pub id: Uuid,
    pub tenant_id: String,
    pub user_id: String,
    pub name: String,
    pub r#type: String, // Use raw identifier for type
    pub status: String,
    pub meta: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Account {
    pub fn new(tenant_id: String, user_id: String, name: String, account_type: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            tenant_id,
            user_id,
            name,
            r#type: account_type,
            status: "active".to_string(),
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }
}
