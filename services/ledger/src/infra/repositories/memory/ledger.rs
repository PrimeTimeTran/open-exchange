use crate::domain::ledger::model::{LedgerEntry, LedgerEvent};
use crate::domain::ledger::repository::LedgerRepository;
use crate::domain::trade::model::Trade;
use crate::domain::transaction::RepositoryTransaction;
use crate::error::{AppError, Result};
use async_trait::async_trait;
use std::sync::{Arc, Mutex};

#[derive(Clone, Default, Debug)]
pub struct InMemoryLedgerRepository {
    events: Arc<Mutex<Vec<LedgerEvent>>>,
    entries: Arc<Mutex<Vec<LedgerEntry>>>,
}

impl InMemoryLedgerRepository {
    pub fn new() -> Self {
        Self {
            events: Arc::new(Mutex::new(Vec::new())),
            entries: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn get_events(&self) -> Result<Vec<LedgerEvent>> {
        let events = self
            .events
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(events.clone())
    }

    pub fn get_entries(&self) -> Result<Vec<LedgerEntry>> {
        let entries = self
            .entries
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(entries.clone())
    }
}

#[async_trait]
impl LedgerRepository for InMemoryLedgerRepository {
    async fn save_event(&self, event: LedgerEvent) -> Result<LedgerEvent> {
        self.events
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?
            .push(event.clone());
        Ok(event)
    }

    async fn save_event_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        event: LedgerEvent,
    ) -> Result<LedgerEvent> {
        self.save_event(event).await
    }

    async fn save_entries(&self, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>> {
        let mut store = self
            .entries
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        store.extend(entries.clone());
        Ok(entries)
    }

    async fn save_entries_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        entries: Vec<LedgerEntry>,
    ) -> Result<Vec<LedgerEntry>> {
        self.save_entries(entries).await
    }

    async fn save_trade_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        trade: Trade,
    ) -> Result<Trade> {
        Ok(trade)
    }

    async fn save_trade(&self, trade: Trade) -> Result<Trade> {
        Ok(trade)
    }

    async fn list_events(&self) -> Result<Vec<LedgerEvent>> {
        Ok(self
            .events
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?
            .clone())
    }

    async fn list_entries(&self) -> Result<Vec<LedgerEntry>> {
        Ok(self
            .entries
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?
            .clone())
    }
}
