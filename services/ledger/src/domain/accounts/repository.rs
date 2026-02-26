use super::model::Account;
use crate::error::Result;
use async_trait::async_trait;
use uuid::Uuid;

#[async_trait]
pub trait AccountRepository: Send + Sync {
    async fn create(&self, account: Account) -> Result<Account>;
    async fn get(&self, id: Uuid) -> Result<Option<Account>>;
    async fn update(&self, account: Account) -> Result<Account>;
    async fn delete(&self, id: Uuid) -> Result<()>;
    async fn list_by_user(&self, user_id: &str) -> Result<Vec<Account>>;
    async fn get_by_name(&self, name: &str) -> Result<Option<Account>>;
    async fn list_all(&self) -> Result<Vec<Account>>;
}
