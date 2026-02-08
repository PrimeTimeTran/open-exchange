use async_trait::async_trait;
use uuid::Uuid;
use super::model::Account;
use crate::error::Result;

#[async_trait]
pub trait AccountRepository: Send + Sync {
    async fn create(&self, account: Account) -> Result<Account>;
    async fn get(&self, id: Uuid) -> Result<Option<Account>>;
    async fn update(&self, account: Account) -> Result<Account>;
    async fn delete(&self, id: Uuid) -> Result<()>;
    async fn list_by_user(&self, user_id: &str) -> Result<Vec<Account>>;
}
