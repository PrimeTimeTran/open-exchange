use crate::domain::fills::{Fill, FillRepository};
use crate::domain::transaction::RepositoryTransaction;
use crate::error::{AppError, Result};
use async_trait::async_trait;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Clone, Default)]
pub struct InMemoryFillRepository {
    fills: Arc<Mutex<Vec<Fill>>>,
}

impl InMemoryFillRepository {
    pub fn new() -> Self {
        Self {
            fills: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn add(&self, fill: Fill) -> Result<()> {
        let mut fills = self
            .fills
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        fills.push(fill);
        Ok(())
    }
}

#[async_trait]
impl FillRepository for InMemoryFillRepository {
    async fn create(&self, fill: Fill) -> Result<Fill> {
        let mut fills = self
            .fills
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        fills.push(fill.clone());
        Ok(fill)
    }

    async fn create_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        fill: Fill,
    ) -> Result<Fill> {
        self.create(fill).await
    }

    async fn list_by_order(&self, order_id: Uuid) -> Result<Vec<Fill>> {
        let fills = self
            .fills
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(fills
            .iter()
            .filter(|f| f.order_id == order_id)
            .cloned()
            .collect())
    }

    async fn list_by_instrument_and_time(
        &self,
        instrument_id: Uuid,
        start_time: chrono::DateTime<chrono::Utc>,
        end_time: chrono::DateTime<chrono::Utc>,
    ) -> Result<Vec<Fill>> {
        let fills = self
            .fills
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(fills
            .iter()
            .filter(|f| {
                f.instrument_id == instrument_id
                    && f.created_at >= start_time
                    && f.created_at <= end_time
            })
            .cloned()
            .collect())
    }
}
