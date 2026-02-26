use crate::domain::trade::TradeRepository;
use crate::error::Result;
use crate::infra::transaction::PostgresTransaction;
use crate::proto::common::Trade;
use async_trait::async_trait;
use chrono::{DateTime, TimeZone, Utc};
use rust_decimal::Decimal;
use sqlx::{FromRow, PgPool};
use std::str::FromStr;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct PostgresTradeRepository {
    pool: PgPool,
}

impl PostgresTradeRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(FromRow)]
struct TradeRow {
    id: Uuid,
    #[sqlx(rename = "tenantId")]
    tenant_id: Uuid,
    #[sqlx(rename = "instrumentId")]
    instrument_id: Option<Uuid>,
    price: Option<Decimal>,
    quantity: Option<Decimal>,
    meta: Option<serde_json::Value>,
    #[sqlx(rename = "createdAt")]
    created_at: DateTime<Utc>,
    #[sqlx(rename = "updatedAt")]
    updated_at: DateTime<Utc>,
}

impl From<TradeRow> for Trade {
    fn from(row: TradeRow) -> Self {
        Self {
            id: row.id.to_string(),
            tenant_id: row.tenant_id.to_string(),
            instrument_id: row.instrument_id.map(|i| i.to_string()).unwrap_or_default(),
            buy_order_id: "".to_string(),
            sell_order_id: "".to_string(),
            price: row.price.map(|p| p.to_string()).unwrap_or_default(),
            quantity: row.quantity.map(|q| q.to_string()).unwrap_or_default(),
            meta: row.meta.map(|m| m.to_string()).unwrap_or_default(),
            created_at: row.created_at.timestamp_millis(),
            updated_at: row.updated_at.timestamp_millis(),
        }
    }
}

use crate::domain::transaction::RepositoryTransaction;

#[async_trait]
impl TradeRepository for PostgresTradeRepository {
    async fn create(&self, trade: Trade) -> Result<Trade> {
        let created_at = Utc
            .timestamp_millis_opt(trade.created_at)
            .single()
            .ok_or_else(|| {
                crate::error::AppError::ValidationError("Invalid created_at timestamp".to_string())
            })?;

        let updated_at = Utc
            .timestamp_millis_opt(trade.updated_at)
            .single()
            .ok_or_else(|| {
                crate::error::AppError::ValidationError("Invalid updated_at timestamp".to_string())
            })?;

        let price = Decimal::from_str(&trade.price)
            .map_err(|_| crate::error::AppError::ValidationError("Invalid price".to_string()))?;

        let quantity = Decimal::from_str(&trade.quantity)
            .map_err(|_| crate::error::AppError::ValidationError("Invalid quantity".to_string()))?;

        // Note: buyOrderId/sellOrderId are not columns in Trade table in current schema.

        sqlx::query(
            r#"
            INSERT INTO "Trade" (
                id, "tenantId", "instrumentId", price, quantity, meta, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
            "#,
        )
        .bind(
            uuid::Uuid::parse_str(&trade.id).map_err(|_| {
                crate::error::AppError::ValidationError("Invalid trade ID".to_string())
            })?,
        )
        .bind(uuid::Uuid::parse_str(&trade.tenant_id).map_err(|_| {
            crate::error::AppError::ValidationError("Invalid tenant ID".to_string())
        })?)
        .bind(uuid::Uuid::parse_str(&trade.instrument_id).map_err(|_| {
            crate::error::AppError::ValidationError("Invalid instrument ID".to_string())
        })?)
        .bind(price)
        .bind(quantity)
        .bind(
            serde_json::from_str::<serde_json::Value>(&trade.meta).unwrap_or(serde_json::json!({})),
        )
        .bind(created_at)
        .bind(updated_at)
        .execute(&self.pool)
        .await
        .map_err(crate::error::AppError::DatabaseError)?;

        Ok(trade)
    }

    async fn create_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        trade: Trade,
    ) -> Result<Trade> {
        let tx = tx
            .as_any()
            .downcast_mut::<PostgresTransaction>()
            .ok_or_else(|| {
                crate::error::AppError::Internal("Transaction is not a PostgresTransaction".into())
            })?;
        let tx = &mut tx.conn;

        let created_at = Utc
            .timestamp_millis_opt(trade.created_at)
            .single()
            .ok_or_else(|| {
                crate::error::AppError::ValidationError("Invalid created_at timestamp".to_string())
            })?;

        let updated_at = Utc
            .timestamp_millis_opt(trade.updated_at)
            .single()
            .ok_or_else(|| {
                crate::error::AppError::ValidationError("Invalid updated_at timestamp".to_string())
            })?;

        let price = Decimal::from_str(&trade.price)
            .map_err(|_| crate::error::AppError::ValidationError("Invalid price".to_string()))?;

        let quantity = Decimal::from_str(&trade.quantity)
            .map_err(|_| crate::error::AppError::ValidationError("Invalid quantity".to_string()))?;

        sqlx::query(
            r#"
            INSERT INTO "Trade" (
                id, "tenantId", "instrumentId", price, quantity, meta, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
            "#,
        )
        .bind(
            uuid::Uuid::parse_str(&trade.id).map_err(|_| {
                crate::error::AppError::ValidationError("Invalid trade ID".to_string())
            })?,
        )
        .bind(uuid::Uuid::parse_str(&trade.tenant_id).map_err(|_| {
            crate::error::AppError::ValidationError("Invalid tenant ID".to_string())
        })?)
        .bind(uuid::Uuid::parse_str(&trade.instrument_id).map_err(|_| {
            crate::error::AppError::ValidationError("Invalid instrument ID".to_string())
        })?)
        .bind(price)
        .bind(quantity)
        .bind(
            serde_json::from_str::<serde_json::Value>(&trade.meta).unwrap_or(serde_json::json!({})),
        )
        .bind(created_at)
        .bind(updated_at)
        .execute(&mut **tx)
        .await
        .map_err(crate::error::AppError::DatabaseError)?;

        Ok(trade)
    }

    async fn get(&self, id: &str) -> Result<Option<Trade>> {
        let uuid = uuid::Uuid::parse_str(id)
            .map_err(|_| crate::error::AppError::ValidationError("Invalid trade ID".to_string()))?;

        let row = sqlx::query_as::<_, TradeRow>(r#"SELECT * FROM "Trade" WHERE id = $1"#)
            .bind(uuid)
            .fetch_optional(&self.pool)
            .await
            .map_err(crate::error::AppError::DatabaseError)?;

        Ok(row.map(Trade::from))
    }

    async fn get_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        id: &str,
    ) -> Result<Option<Trade>> {
        let tx = tx
            .as_any()
            .downcast_mut::<PostgresTransaction>()
            .ok_or_else(|| {
                crate::error::AppError::Internal("Transaction is not a PostgresTransaction".into())
            })?;
        let tx = &mut tx.conn;
        let uuid = uuid::Uuid::parse_str(id)
            .map_err(|_| crate::error::AppError::ValidationError("Invalid trade ID".to_string()))?;

        let row = sqlx::query_as::<_, TradeRow>(r#"SELECT * FROM "Trade" WHERE id = $1"#)
            .bind(uuid)
            .fetch_optional(&mut **tx)
            .await
            .map_err(crate::error::AppError::DatabaseError)?;

        Ok(row.map(Trade::from))
    }
}
