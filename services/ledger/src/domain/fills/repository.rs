use async_trait::async_trait;
use uuid::Uuid;
use super::model::Fill;
use crate::error::Result;
use crate::domain::transaction::RepositoryTransaction;

#[async_trait]
pub trait FillRepository: Send + Sync {
    async fn create(&self, fill: Fill) -> Result<Fill>;
    async fn create_with_tx(&self, tx: &mut dyn RepositoryTransaction, fill: Fill) -> Result<Fill>;
    async fn list_by_order(&self, order_id: Uuid) -> Result<Vec<Fill>>;
    async fn list_by_instrument_and_time(
        &self,
        instrument_id: Uuid,
        start_time: chrono::DateTime<chrono::Utc>,
        end_time: chrono::DateTime<chrono::Utc>,
    ) -> Result<Vec<Fill>>;
}
