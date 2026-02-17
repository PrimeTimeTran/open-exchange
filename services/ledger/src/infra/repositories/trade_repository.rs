use crate::error::Result;
use crate::proto::common::Trade;
use crate::domain::trade::TradeRepository;
use std::str::FromStr;
use rust_decimal::Decimal;
use chrono::{TimeZone, Utc};
use async_trait::async_trait;
use sqlx::{PgPool, Transaction, Postgres};

#[derive(Debug, Clone)]
pub struct PostgresTradeRepository {
    pool: PgPool,
}

impl PostgresTradeRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

use crate::domain::transaction::RepositoryTransaction;

#[async_trait]
impl TradeRepository for PostgresTradeRepository {
    async fn create(&self, trade: Trade) -> Result<Trade> {
        let created_at = Utc.timestamp_millis_opt(trade.created_at)
            .single()
            .ok_or_else(|| crate::error::AppError::ValidationError("Invalid created_at timestamp".to_string()))?;
        
        let updated_at = Utc.timestamp_millis_opt(trade.updated_at)
            .single()
            .ok_or_else(|| crate::error::AppError::ValidationError("Invalid updated_at timestamp".to_string()))?;
        
        let price = Decimal::from_str(&trade.price)
            .map_err(|_| crate::error::AppError::ValidationError("Invalid price".to_string()))?;
        
        let quantity = Decimal::from_str(&trade.quantity)
            .map_err(|_| crate::error::AppError::ValidationError("Invalid quantity".to_string()))?;

        // Note: buyOrderId/sellOrderId are not columns in Trade table in current schema.
        
        sqlx::query!(
            r#"
            INSERT INTO "Trade" (
                id, "tenantId", "instrumentId", price, quantity, meta, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
            "#,
            uuid::Uuid::parse_str(&trade.id).map_err(|_| crate::error::AppError::ValidationError("Invalid trade ID".to_string()))?,
            uuid::Uuid::parse_str(&trade.tenant_id).map_err(|_| crate::error::AppError::ValidationError("Invalid tenant ID".to_string()))?,
            uuid::Uuid::parse_str(&trade.instrument_id).map_err(|_| crate::error::AppError::ValidationError("Invalid instrument ID".to_string()))?,
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

    async fn create_with_tx(&self, tx: &mut dyn RepositoryTransaction, trade: Trade) -> Result<Trade> {
        let tx = unsafe { &mut *(tx.get_inner_ptr() as *mut Transaction<'_, Postgres>) };
        
        let created_at = Utc.timestamp_millis_opt(trade.created_at)
            .single()
            .ok_or_else(|| crate::error::AppError::ValidationError("Invalid created_at timestamp".to_string()))?;
        
        let updated_at = Utc.timestamp_millis_opt(trade.updated_at)
            .single()
            .ok_or_else(|| crate::error::AppError::ValidationError("Invalid updated_at timestamp".to_string()))?;
        
        let price = Decimal::from_str(&trade.price)
            .map_err(|_| crate::error::AppError::ValidationError("Invalid price".to_string()))?;
        
        let quantity = Decimal::from_str(&trade.quantity)
            .map_err(|_| crate::error::AppError::ValidationError("Invalid quantity".to_string()))?;

        sqlx::query!(
            r#"
            INSERT INTO "Trade" (
                id, "tenantId", "instrumentId", price, quantity, meta, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
            "#,
            uuid::Uuid::parse_str(&trade.id).map_err(|_| crate::error::AppError::ValidationError("Invalid trade ID".to_string()))?,
            uuid::Uuid::parse_str(&trade.tenant_id).map_err(|_| crate::error::AppError::ValidationError("Invalid tenant ID".to_string()))?,
            uuid::Uuid::parse_str(&trade.instrument_id).map_err(|_| crate::error::AppError::ValidationError("Invalid instrument ID".to_string()))?,
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

    async fn get(&self, id: &str) -> Result<Option<Trade>> {
        let uuid = uuid::Uuid::parse_str(id).map_err(|_| crate::error::AppError::ValidationError("Invalid trade ID".to_string()))?;
        
        let row = sqlx::query!(
            r#"SELECT * FROM "Trade" WHERE id = $1"#,
            uuid
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(crate::error::AppError::DatabaseError)?;

        match row {
            Some(r) => Ok(Some(Trade {
                id: r.id.to_string(),
                tenant_id: r.tenantId.to_string(),
                instrument_id: r.instrumentId.map(|i| i.to_string()).unwrap_or_default(),
                buy_order_id: "".to_string(),
                sell_order_id: "".to_string(),
                price: r.price.map(|p| p.to_string()).unwrap_or_default(),
                quantity: r.quantity.map(|q| q.to_string()).unwrap_or_default(),
                meta: r.meta.map(|m| m.to_string()).unwrap_or_default(),
                created_at: r.createdAt.timestamp_millis(),
                updated_at: r.updatedAt.timestamp_millis(),
            })),
            None => Ok(None),
        }
    }

    async fn get_with_tx(&self, tx: &mut dyn RepositoryTransaction, id: &str) -> Result<Option<Trade>> {
        let tx = unsafe { &mut *(tx.get_inner_ptr() as *mut Transaction<'_, Postgres>) };
        let uuid = uuid::Uuid::parse_str(id).map_err(|_| crate::error::AppError::ValidationError("Invalid trade ID".to_string()))?;
        
        let row = sqlx::query!(
            r#"SELECT * FROM "Trade" WHERE id = $1"#,
            uuid
        )
        .fetch_optional(&mut **tx)
        .await
        .map_err(crate::error::AppError::DatabaseError)?;

        match row {
            Some(r) => Ok(Some(Trade {
                id: r.id.to_string(),
                tenant_id: r.tenantId.to_string(),
                instrument_id: r.instrumentId.map(|i| i.to_string()).unwrap_or_default(),
                buy_order_id: "".to_string(),
                sell_order_id: "".to_string(),
                price: r.price.map(|p| p.to_string()).unwrap_or_default(),
                quantity: r.quantity.map(|q| q.to_string()).unwrap_or_default(),
                meta: r.meta.map(|m| m.to_string()).unwrap_or_default(),
                created_at: r.createdAt.timestamp_millis(),
                updated_at: r.updatedAt.timestamp_millis(),
            })),
            None => Ok(None),
        }
    }
}
