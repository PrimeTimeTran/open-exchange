use crate::error::Result;
use crate::proto::common::Trade;
use crate::domain::transaction::RepositoryTransaction;
use async_trait::async_trait;

#[async_trait]
pub trait TradeRepository: Send + Sync {
    async fn create(&self, trade: Trade) -> Result<Trade>;
    async fn create_with_tx(&self, tx: &mut dyn RepositoryTransaction, trade: Trade) -> Result<Trade>;
    async fn get(&self, id: &str) -> Result<Option<Trade>>;
    async fn get_with_tx(&self, tx: &mut dyn RepositoryTransaction, id: &str) -> Result<Option<Trade>>;
}
