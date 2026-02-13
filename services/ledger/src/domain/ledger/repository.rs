use async_trait::async_trait;
use super::super::super::proto::common::{LedgerEvent, LedgerEntry, Trade};
use crate::error::Result;
use sqlx::{Transaction, Postgres};

#[async_trait]
pub trait LedgerRepository: Send + Sync {
    async fn save_event(&self, event: LedgerEvent) -> Result<LedgerEvent>;
    async fn save_event_with_tx(&self, tx: &mut Transaction<'_, Postgres>, event: LedgerEvent) -> Result<LedgerEvent>;
    async fn save_entries(&self, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>>;
    async fn save_entries_with_tx(&self, tx: &mut Transaction<'_, Postgres>, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>>;
    async fn save_trade_with_tx(&self, tx: &mut Transaction<'_, Postgres>, trade: Trade) -> Result<Trade>;
    async fn save_trade(&self, trade: Trade) -> Result<Trade>;
}
