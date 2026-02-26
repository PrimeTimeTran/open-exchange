use crate::domain::fills::{Fill, FillRepository};
use crate::domain::transaction::RepositoryTransaction;
use crate::error::Result;
use crate::infra::transaction::PostgresTransaction;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct PostgresFillRepository {
    pool: PgPool,
}

impl PostgresFillRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(FromRow)]
struct FillRow {
    id: Uuid,
    #[sqlx(rename = "tradeId")]
    trade_id: Uuid,
    #[sqlx(rename = "orderId")]
    order_id: Uuid,
    #[sqlx(rename = "tenantId")]
    tenant_id: Uuid,
    #[sqlx(rename = "instrumentId")]
    instrument_id: Uuid,
    price: Decimal,
    quantity: Decimal,
    fee: Decimal,
    #[sqlx(rename = "feeCurrency")]
    fee_currency: String,
    role: String,
    side: String,
    meta: serde_json::Value,
    #[sqlx(rename = "createdAt")]
    created_at: DateTime<Utc>,
    #[sqlx(rename = "updatedAt")]
    updated_at: DateTime<Utc>,
}

impl From<FillRow> for Fill {
    fn from(row: FillRow) -> Self {
        Self {
            id: row.id,
            trade_id: row.trade_id,
            order_id: row.order_id,
            tenant_id: row.tenant_id,
            instrument_id: row.instrument_id,
            price: row.price,
            quantity: row.quantity,
            fee: row.fee,
            fee_currency: row.fee_currency,
            role: row.role,
            side: row.side,
            meta: row.meta,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[async_trait]
impl FillRepository for PostgresFillRepository {
    async fn create(&self, fill: Fill) -> Result<Fill> {
        let row = sqlx::query_as::<_, FillRow>(
            r#"
            INSERT INTO "Fill" (
                id, "tradeId", "orderId", "tenantId", "instrumentId",
                price, quantity, fee, "feeCurrency", role, side, meta, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING
                id, "tradeId", "orderId", "tenantId", "instrumentId",
                price, quantity, fee, "feeCurrency", role, side, meta, "createdAt", "updatedAt"
            "#,
        )
        .bind(fill.id)
        .bind(fill.trade_id)
        .bind(fill.order_id)
        .bind(fill.tenant_id)
        .bind(fill.instrument_id)
        .bind(fill.price)
        .bind(fill.quantity)
        .bind(fill.fee)
        .bind(fill.fee_currency)
        .bind(fill.role)
        .bind(fill.side)
        .bind(fill.meta)
        .bind(fill.created_at)
        .bind(fill.updated_at)
        .fetch_one(&self.pool)
        .await
        .map_err(crate::error::AppError::DatabaseError)?;

        Ok(row.into())
    }

    async fn create_with_tx(&self, tx: &mut dyn RepositoryTransaction, fill: Fill) -> Result<Fill> {
        let tx = tx
            .as_any()
            .downcast_mut::<PostgresTransaction>()
            .ok_or_else(|| {
                crate::error::AppError::Internal("Transaction is not a PostgresTransaction".into())
            })?;
        let tx = &mut tx.conn;

        let row = sqlx::query_as::<_, FillRow>(
            r#"
            INSERT INTO "Fill" (
                id, "tradeId", "orderId", "tenantId", "instrumentId",
                price, quantity, fee, "feeCurrency", role, side, meta, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING
                id, "tradeId", "orderId", "tenantId", "instrumentId",
                price, quantity, fee, "feeCurrency", role, side, meta, "createdAt", "updatedAt"
            "#,
        )
        .bind(fill.id)
        .bind(fill.trade_id)
        .bind(fill.order_id)
        .bind(fill.tenant_id)
        .bind(fill.instrument_id)
        .bind(fill.price)
        .bind(fill.quantity)
        .bind(fill.fee)
        .bind(fill.fee_currency)
        .bind(fill.role)
        .bind(fill.side)
        .bind(fill.meta)
        .bind(fill.created_at)
        .bind(fill.updated_at)
        .fetch_one(&mut **tx)
        .await
        .map_err(crate::error::AppError::DatabaseError)?;

        Ok(row.into())
    }

    async fn list_by_order(&self, order_id: Uuid) -> Result<Vec<Fill>> {
        let rows = sqlx::query_as::<_, FillRow>(
            r#"
            SELECT 
                id, "tradeId", "orderId", "tenantId", "instrumentId",
                price, quantity, fee, "feeCurrency", role, side, meta, "createdAt", "updatedAt"
            FROM "Fill" 
            WHERE "orderId" = $1
            "#,
        )
        .bind(order_id)
        .fetch_all(&self.pool)
        .await
        .map_err(crate::error::AppError::DatabaseError)?;

        Ok(rows.into_iter().map(Fill::from).collect())
    }

    async fn list_by_instrument_and_time(
        &self,
        instrument_id: Uuid,
        start_time: chrono::DateTime<chrono::Utc>,
        end_time: chrono::DateTime<chrono::Utc>,
    ) -> Result<Vec<Fill>> {
        let rows = sqlx::query_as::<_, FillRow>(
            r#"
            SELECT 
                id, "tradeId", "orderId", "tenantId", "instrumentId",
                price, quantity, fee, "feeCurrency", role, side, meta, "createdAt", "updatedAt"
            FROM "Fill" 
            WHERE "instrumentId" = $1 
            AND "createdAt" >= $2 
            AND "createdAt" <= $3
            ORDER BY "createdAt" ASC
            "#,
        )
        .bind(instrument_id)
        .bind(start_time)
        .bind(end_time)
        .fetch_all(&self.pool)
        .await
        .map_err(crate::error::AppError::DatabaseError)?;

        Ok(rows.into_iter().map(Fill::from).collect())
    }
}
