use async_trait::async_trait;
use sqlx::{PgPool, Transaction, Postgres};
use crate::error::Result;
use crate::proto::common::{LedgerEvent, LedgerEntry, Trade};
use crate::domain::ledger::repository::LedgerRepository;

#[derive(Debug, Clone)]
pub struct PostgresLedgerRepository {
    #[allow(dead_code)]
    pool: PgPool,
}

impl PostgresLedgerRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl LedgerRepository for PostgresLedgerRepository {
    async fn save_event(&self, event: LedgerEvent) -> Result<LedgerEvent> {
        // TODO: Implement actual DB persistence
        println!("PERSIST: Ledger Event created {:?}", event);
        Ok(event)
    }

    async fn save_event_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, event: LedgerEvent) -> Result<LedgerEvent> {
        // TODO: Implement actual DB persistence
        println!("PERSIST (TX): Ledger Event created {:?}", event);
        Ok(event)
    }

    async fn save_entries(&self, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>> {
        // TODO: Implement actual DB persistence
        println!("PERSIST: {} Ledger Entries created", entries.len());
        Ok(entries)
    }

    async fn save_entries_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>> {
        // TODO: Implement actual DB persistence
        println!("PERSIST (TX): {} Ledger Entries created", entries.len());
        Ok(entries)
    }

    async fn save_trade_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, trade: Trade) -> Result<Trade> {
        // TODO: Implement actual DB persistence
        println!("PERSIST (TX): Trade created {:?}", trade);
        Ok(trade)
    }

    async fn save_trade(&self, trade: Trade) -> Result<Trade> {
        // TODO: Implement actual DB persistence
        println!("PERSIST: Trade created {:?}", trade);
        Ok(trade)
    }
}
