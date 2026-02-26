use crate::domain::trade::model::Trade;
use crate::domain::transaction::RepositoryTransaction;
use crate::error::Result;
use async_trait::async_trait;
use uuid::Uuid;

#[async_trait]
pub trait TradeRepository: Send + Sync {
    async fn create(&self, trade: Trade) -> Result<Trade>;
    async fn create_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        trade: Trade,
    ) -> Result<Trade>;
    async fn get(&self, id: Uuid) -> Result<Option<Trade>>;
    async fn get_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        id: Uuid,
    ) -> Result<Option<Trade>>;
}
