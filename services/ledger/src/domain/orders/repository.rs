use async_trait::async_trait;
use uuid::Uuid;
use super::model::Order;
use crate::error::Result;

#[async_trait]
pub trait OrderRepository: Send + Sync {
    async fn create(&self, order: Order) -> Result<Order>;
    async fn get(&self, id: Uuid) -> Result<Option<Order>>;
    async fn update_status(&self, id: Uuid, status: String) -> Result<()>;
    async fn update_filled_amount(&self, id: Uuid, filled: f64) -> Result<()>;
    async fn list_open(&self) -> Result<Vec<Order>>;
}

