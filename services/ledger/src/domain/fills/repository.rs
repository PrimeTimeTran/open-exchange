use async_trait::async_trait;
use uuid::Uuid;
use super::model::Fill;
use crate::error::Result;
use sqlx::{Transaction, Postgres};

#[async_trait]
pub trait FillRepository: Send + Sync {
    async fn create(&self, fill: Fill) -> Result<Fill>;
    async fn create_with_tx(&self, tx: &mut Transaction<'_, Postgres>, fill: Fill) -> Result<Fill>;
    async fn list_by_order(&self, order_id: Uuid) -> Result<Vec<Fill>>;
}
