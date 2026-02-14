use std::sync::Arc;
use uuid::Uuid;
use rust_decimal::Decimal;
use std::str::FromStr;
use crate::error::{Result, AppError};
use super::model::Fill;
use super::repository::FillRepository;
use crate::proto::common::Trade;
use sqlx::{Transaction, Postgres};

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

    pub fn create_fill_from_trade(&self, trade: &Trade, order_id: &str, side: &str, role: &str, quantity: Decimal, fee_currency: &str) -> Result<Fill> {
        Ok(Fill {
            id: Uuid::new_v4(),
            trade_id: Uuid::parse_str(&trade.id).map_err(|_| AppError::ValidationError("Invalid trade ID".into()))?,
            order_id: Uuid::parse_str(order_id).map_err(|_| AppError::ValidationError("Invalid order ID".into()))?,
            tenant_id: Uuid::parse_str(&trade.tenant_id).map_err(|_| AppError::ValidationError("Invalid tenant ID".into()))?,
            instrument_id: Uuid::parse_str(&trade.instrument_id).map_err(|_| AppError::ValidationError("Invalid instrument ID".into()))?,
            price: Decimal::from_str(&trade.price).map_err(|_| AppError::ValidationError("Invalid trade price".into()))?,
            quantity,
            fee: Decimal::ZERO,
            fee_currency: fee_currency.to_string(),
            role: role.to_string(),
            side: side.to_string(),
            meta: serde_json::json!({}),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        })
    }

    pub async fn save_fill_with_tx(&self, tx: &mut Transaction<'_, Postgres>, fill: Fill) -> Result<Fill> {
        self.repo.create_with_tx(tx, fill).await
    }
    
    pub async fn save_fill(&self, fill: Fill) -> Result<Fill> {
        self.repo.create(fill).await
    }
}
