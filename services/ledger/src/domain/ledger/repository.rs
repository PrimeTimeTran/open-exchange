use crate::error::Result;
use crate::domain::transaction::RepositoryTransaction;
use super::super::super::proto::common::{LedgerEvent, LedgerEntry, Trade};
use async_trait::async_trait;

#[async_trait]
pub trait LedgerRepository: Send + Sync {
    async fn save_event(&self, event: LedgerEvent) -> Result<LedgerEvent>;
    async fn save_event_with_tx(&self, tx: &mut dyn RepositoryTransaction, event: LedgerEvent) -> Result<LedgerEvent>;
    async fn save_entries(&self, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>>;
    async fn save_entries_with_tx(&self, tx: &mut dyn RepositoryTransaction, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>>;
    async fn save_trade_with_tx(&self, tx: &mut dyn RepositoryTransaction, trade: Trade) -> Result<Trade>;
    async fn save_trade(&self, trade: Trade) -> Result<Trade>;
    
    // Testing/Admin methods
    async fn list_events(&self) -> Result<Vec<LedgerEvent>>;
    async fn list_entries(&self) -> Result<Vec<LedgerEntry>>;
}
