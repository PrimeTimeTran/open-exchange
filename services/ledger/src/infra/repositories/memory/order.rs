use crate::domain::orders::{Order, OrderRepository, OrderStatus};
use crate::domain::transaction::RepositoryTransaction;
use crate::error::{AppError, Result};
use async_trait::async_trait;
use rust_decimal::Decimal;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Clone, Default)]
pub struct InMemoryOrderRepository {
    orders: Arc<Mutex<Vec<Order>>>,
}

impl InMemoryOrderRepository {
    pub fn new() -> Self {
        Self {
            orders: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn add(&self, order: Order) -> Result<()> {
        let mut orders = self
            .orders
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        if let Some(pos) = orders.iter().position(|o| o.id == order.id) {
            orders[pos] = order;
        } else {
            orders.push(order);
        }
        Ok(())
    }
}

#[async_trait]
impl OrderRepository for InMemoryOrderRepository {
    async fn create(&self, order: Order) -> Result<Order> {
        let mut orders = self
            .orders
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        orders.push(order.clone());
        Ok(order)
    }

    async fn create_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        order: Order,
    ) -> Result<Order> {
        self.create(order).await
    }

    async fn get(&self, id: Uuid) -> Result<Option<Order>> {
        let orders = self
            .orders
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(orders.iter().find(|o| o.id == id).cloned())
    }

    async fn get_for_update(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        id: Uuid,
    ) -> Result<Option<Order>> {
        self.get(id).await
    }

    async fn update_status(&self, id: Uuid, status: OrderStatus) -> Result<()> {
        let mut orders = self
            .orders
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        if let Some(order) = orders.iter_mut().find(|o| o.id == id) {
            order.status = status;
            order.updated_at = chrono::Utc::now();
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Order {} not found", id)))
        }
    }

    async fn update_status_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        id: Uuid,
        status: OrderStatus,
    ) -> Result<()> {
        self.update_status(id, status).await
    }

    async fn update_filled_amount(&self, id: Uuid, filled: Decimal) -> Result<()> {
        let mut orders = self
            .orders
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        if let Some(order) = orders.iter_mut().find(|o| o.id == id) {
            order.filled_quantity = filled;
            order.updated_at = chrono::Utc::now();
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Order {} not found", id)))
        }
    }

    async fn update_filled_amount_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        id: Uuid,
        filled: Decimal,
    ) -> Result<()> {
        self.update_filled_amount(id, filled).await
    }

    async fn increment_filled_amount(&self, id: Uuid, amount: Decimal) -> Result<Order> {
        let mut orders = self
            .orders
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        if let Some(order) = orders.iter_mut().find(|o| o.id == id) {
            order.filled_quantity += amount;
            order.updated_at = chrono::Utc::now();
            Ok(order.clone())
        } else {
            Err(AppError::NotFound(format!("Order {} not found", id)))
        }
    }

    async fn increment_filled_amount_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        id: Uuid,
        amount: Decimal,
    ) -> Result<Order> {
        self.increment_filled_amount(id, amount).await
    }

    async fn list_open(&self) -> Result<Vec<Order>> {
        let orders = self
            .orders
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        // Assuming "open", "partial_fill", "new" are considered open
        Ok(orders
            .iter()
            .filter(|o| {
                o.status == OrderStatus::Open
                    || o.status == OrderStatus::PartialFill
                    || o.status == OrderStatus::New
            })
            .cloned()
            .collect())
    }
}
