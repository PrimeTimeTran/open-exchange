use async_trait::async_trait;
use crate::error::Result;
use crate::proto::common::Trade;
use sqlx::{Transaction, Postgres};

#[async_trait]
pub trait TradeRepository: Send + Sync {
    async fn create(&self, trade: Trade) -> Result<Trade>;
    async fn create_with_tx(&self, tx: &mut Transaction<'_, Postgres>, trade: Trade) -> Result<Trade>;
}
