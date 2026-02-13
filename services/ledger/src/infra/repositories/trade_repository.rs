use async_trait::async_trait;
use sqlx::{PgPool, Transaction, Postgres};
use crate::error::Result;
use crate::domain::trade::TradeRepository;
use crate::proto::common::Trade;
use rust_decimal::Decimal;
use std::str::FromStr;
use chrono::{TimeZone, Utc};

#[derive(Debug, Clone)]
pub struct PostgresTradeRepository {
    pool: PgPool,
}

impl PostgresTradeRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl TradeRepository for PostgresTradeRepository {
    async fn create(&self, trade: Trade) -> Result<Trade> {
        let created_at = Utc.timestamp_millis_opt(trade.created_at).unwrap();
        let updated_at = Utc.timestamp_millis_opt(trade.updated_at).unwrap();
        let price = Decimal::from_str(&trade.price).unwrap_or_default();
        let quantity = Decimal::from_str(&trade.quantity).unwrap_or_default();

        // Note: buyOrderId/sellOrderId are not columns in Trade table in current schema.
        
        sqlx::query!(
            r#"
            INSERT INTO "Trade" (
                id, "tenantId", "instrumentId", price, quantity, meta, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
            "#,
            uuid::Uuid::parse_str(&trade.id).unwrap(),
            uuid::Uuid::parse_str(&trade.tenant_id).unwrap(),
            uuid::Uuid::parse_str(&trade.instrument_id).unwrap(),
            price,
            quantity,
            serde_json::from_str::<serde_json::Value>(&trade.meta).unwrap_or(serde_json::json!({})),
            created_at,
            updated_at
        )
        .execute(&self.pool)
        .await
        .map_err(crate::error::AppError::DatabaseError)?;

        Ok(trade)
    }

    async fn create_with_tx(&self, tx: &mut Transaction<'_, Postgres>, trade: Trade) -> Result<Trade> {
        let created_at = Utc.timestamp_millis_opt(trade.created_at).unwrap();
        let updated_at = Utc.timestamp_millis_opt(trade.updated_at).unwrap();
        let price = Decimal::from_str(&trade.price).unwrap_or_default();
        let quantity = Decimal::from_str(&trade.quantity).unwrap_or_default();

        sqlx::query!(
            r#"
            INSERT INTO "Trade" (
                id, "tenantId", "instrumentId", price, quantity, meta, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
            "#,
            uuid::Uuid::parse_str(&trade.id).unwrap(),
            uuid::Uuid::parse_str(&trade.tenant_id).unwrap(),
            uuid::Uuid::parse_str(&trade.instrument_id).unwrap(),
            price,
            quantity,
            serde_json::from_str::<serde_json::Value>(&trade.meta).unwrap_or(serde_json::json!({})),
            created_at,
            updated_at
        )
        .execute(&mut **tx)
        .await
        .map_err(crate::error::AppError::DatabaseError)?;

        Ok(trade)
    }
}
