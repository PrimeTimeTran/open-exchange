use super::model::Fill;
use super::repository::FillRepository;
use crate::domain::trade::model::Trade;
use crate::domain::transaction::RepositoryTransaction;
use crate::error::Result;
use rust_decimal::Decimal;
use std::sync::Arc;
use uuid::Uuid;

#[derive(Clone)]
pub struct FillService {
    repo: Arc<dyn FillRepository>,
}

impl FillService {
    pub fn new(repo: Arc<dyn FillRepository>) -> Self {
        Self { repo }
    }

    pub fn repo(&self) -> &Arc<dyn FillRepository> {
        &self.repo
    }

    pub fn create_fill_from_trade(
        &self,
        trade: &Trade,
        order_id: Uuid,
        side: &str,
        role: &str,
        quantity: Decimal,
        fee: Decimal,
        fee_currency: &str,
    ) -> Result<Fill> {
        Ok(Fill {
            id: Uuid::new_v4(),
            trade_id: trade.id,
            order_id,
            tenant_id: trade.tenant_id,
            instrument_id: trade.instrument_id,
            price: trade.price,
            quantity,
            fee,
            fee_currency: fee_currency.to_string(),
            role: role.to_string(),
            side: side.to_string(),
            meta: serde_json::json!({}),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        })
    }

    pub async fn save_fill(&self, fill: Fill) -> Result<Fill> {
        self.repo.create(fill).await
    }

    pub async fn save_fill_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        fill: Fill,
    ) -> Result<Fill> {
        self.repo.create_with_tx(tx, fill).await
    }

    pub async fn get_trades_by_instrument(
        &self,
        instrument_id: Uuid,
        start_time: chrono::DateTime<chrono::Utc>,
        end_time: chrono::DateTime<chrono::Utc>,
    ) -> Result<Vec<Fill>> {
        self.repo
            .list_by_instrument_and_time(instrument_id, start_time, end_time)
            .await
    }
}
