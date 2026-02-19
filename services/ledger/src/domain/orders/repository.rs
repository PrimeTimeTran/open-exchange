use crate::error::Result;
use super::model::{Order, OrderStatus};
use uuid::Uuid;
use rust_decimal::Decimal;
use async_trait::async_trait;

use crate::domain::transaction::RepositoryTransaction;

#[async_trait]
pub trait OrderRepository: Send + Sync {
    async fn create(&self, order: Order) -> Result<Order>;
    async fn create_with_tx(&self, tx: &mut dyn RepositoryTransaction, order: Order) -> Result<Order>;
    async fn get(&self, id: Uuid) -> Result<Option<Order>>;
    async fn get_for_update(&self, tx: &mut dyn RepositoryTransaction, id: Uuid) -> Result<Option<Order>>;
    async fn update_status(&self, id: Uuid, status: OrderStatus) -> Result<()>;
    async fn update_status_with_tx(&self, tx: &mut dyn RepositoryTransaction, id: Uuid, status: OrderStatus) -> Result<()>;
    async fn update_filled_amount(&self, id: Uuid, filled: Decimal) -> Result<()>;
    async fn update_filled_amount_with_tx(&self, tx: &mut dyn RepositoryTransaction, id: Uuid, filled: Decimal) -> Result<()>;
    async fn increment_filled_amount(&self, id: Uuid, amount: Decimal) -> Result<Order>;
    async fn increment_filled_amount_with_tx(&self, tx: &mut dyn RepositoryTransaction, id: Uuid, amount: Decimal) -> Result<Order>;
    async fn list_open(&self) -> Result<Vec<Order>>;
}

