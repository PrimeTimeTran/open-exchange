use std::sync::Arc;
use uuid::Uuid;
use super::model::Order;
use super::repository::OrderRepository;
use crate::error::Result;

use std::fmt;

#[derive(Clone)]
pub struct OrderService {
    repo: Arc<dyn OrderRepository>,
}

impl fmt::Debug for OrderService {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "OrderService")
    }
}

impl OrderService {
    pub fn new(repo: Arc<dyn OrderRepository>) -> Self {
        Self { repo }
    }

    pub async fn create_order(&self, order: Order) -> Result<Order> {
        self.repo.create(order).await
    }

    pub async fn get_order(&self, id: Uuid) -> Result<Option<Order>> {
        self.repo.get(id).await
    }

    pub async fn cancel_order(&self, id: Uuid) -> Result<()> {
        self.repo.update_status(id, "cancelled".to_string()).await
    }

    pub async fn list_open_orders(&self) -> Result<Vec<Order>> {
        self.repo.list_open().await
    }
}

