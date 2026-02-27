use crate::domain::trade::model::Trade;
use crate::domain::trade::TradeRepository;
use crate::domain::transaction::RepositoryTransaction;
use crate::error::{AppError, Result};
use async_trait::async_trait;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Clone, Default, Debug)]
pub struct InMemoryTradeRepository {
    trades: Arc<Mutex<Vec<Trade>>>,
}

impl InMemoryTradeRepository {
    pub fn new() -> Self {
        Self {
            trades: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn get_trades(&self) -> Result<Vec<Trade>> {
        let trades = self
            .trades
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(trades.clone())
    }
}

#[async_trait]
impl TradeRepository for InMemoryTradeRepository {
    async fn create(&self, trade: Trade) -> Result<Trade> {
        self.trades
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?
            .push(trade.clone());
        Ok(trade)
    }

    async fn create_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        trade: Trade,
    ) -> Result<Trade> {
        self.create(trade).await
    }

    async fn get(&self, id: Uuid) -> Result<Option<Trade>> {
        let trades = self
            .trades
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(trades.iter().find(|t| t.id == id).cloned())
    }

    async fn get_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        id: Uuid,
    ) -> Result<Option<Trade>> {
        self.get(id).await
    }
}
