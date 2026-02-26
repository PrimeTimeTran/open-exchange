use crate::domain::trade::model::Trade;
use crate::domain::trade::TradeRepository;
use crate::domain::transaction::RepositoryTransaction;
use crate::error::{AppError, Result};
use crate::infra::transaction::PostgresTransaction;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use sqlx::{FromRow, PgPool};
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
            id: row.id,
            tenant_id: row.tenant_id,
            instrument_id: row.instrument_id.unwrap_or_default(),
            buy_order_id: Uuid::nil(),
            sell_order_id: Uuid::nil(),
            price: row.price.unwrap_or_default(),
            quantity: row.quantity.unwrap_or_default(),
            meta: row.meta.unwrap_or_default(),
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[async_trait]
impl TradeRepository for PostgresTradeRepository {
    async fn create(&self, trade: Trade) -> Result<Trade> {
        sqlx::query(
            r#"
            INSERT INTO "Trade" (
                id, "tenantId", "instrumentId", price, quantity, meta, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
            "#,
        )
        .bind(trade.id)
        .bind(trade.tenant_id)
        .bind(trade.instrument_id)
        .bind(trade.price)
        .bind(trade.quantity)
        .bind(trade.meta.clone())
        .bind(trade.created_at)
        .bind(trade.updated_at)
        .execute(&self.pool)
        .await?;

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
            .ok_or_else(|| AppError::Internal("Transaction is not a PostgresTransaction".into()))?;

        sqlx::query(
            r#"
            INSERT INTO "Trade" (
                id, "tenantId", "instrumentId", price, quantity, meta, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
            "#,
        )
        .bind(trade.id)
        .bind(trade.tenant_id)
        .bind(trade.instrument_id)
        .bind(trade.price)
        .bind(trade.quantity)
        .bind(trade.meta.clone())
        .bind(trade.created_at)
        .bind(trade.updated_at)
        .execute(&mut *tx.conn)
        .await?;

        Ok(trade)
    }

    async fn get(&self, id: Uuid) -> Result<Option<Trade>> {
        let row = sqlx::query_as::<_, TradeRow>(
            r#"
            SELECT id, "tenantId", "instrumentId", price, quantity, meta, "createdAt", "updatedAt"
            FROM "Trade"
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(|r| r.into()))
    }

    async fn get_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        id: Uuid,
    ) -> Result<Option<Trade>> {
        let tx = tx
            .as_any()
            .downcast_mut::<PostgresTransaction>()
            .ok_or_else(|| AppError::Internal("Transaction is not a PostgresTransaction".into()))?;

        let row = sqlx::query_as::<_, TradeRow>(
            r#"
            SELECT id, "tenantId", "instrumentId", price, quantity, meta, "createdAt", "updatedAt"
            FROM "Trade"
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&mut *tx.conn)
        .await?;

        Ok(row.map(|r| r.into()))
    }
}
