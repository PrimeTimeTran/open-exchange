use async_trait::async_trait;
use sqlx::{PgPool, Transaction, Postgres};
use uuid::Uuid;
use crate::error::Result;
use crate::domain::fills::{Fill, FillRepository};

#[derive(Debug, Clone)]
pub struct PostgresFillRepository {
    #[allow(dead_code)]
    pool: PgPool,
}

impl PostgresFillRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl FillRepository for PostgresFillRepository {
    async fn create(&self, fill: Fill) -> Result<Fill> {
        sqlx::query_as!(
            Fill,
            r#"
            INSERT INTO "Fill" (
                id, "tradeId", "orderId", "tenantId", "instrumentId",
                price, quantity, fee, "feeCurrency", role, side, meta, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING
                id, "tradeId" as "trade_id!", "orderId" as "order_id!", "tenantId" as "tenant_id!",
                "instrumentId" as "instrument_id!", price, quantity, fee as "fee!",
                "feeCurrency" as "fee_currency!", role, side, meta, "createdAt" as created_at,
                "updatedAt" as updated_at
            "#,
            fill.id,
            fill.trade_id,
            fill.order_id,
            fill.tenant_id,
            fill.instrument_id,
            fill.price,
            fill.quantity,
            fill.fee,
            fill.fee_currency,
            fill.role,
            fill.side,
            fill.meta,
            fill.created_at,
            fill.updated_at
        )
        .fetch_one(&self.pool)
        .await
        .map_err(crate::error::AppError::DatabaseError)
    }

    async fn create_with_tx(&self, tx: &mut Transaction<'_, Postgres>, fill: Fill) -> Result<Fill> {
        sqlx::query_as!(
            Fill,
            r#"
            INSERT INTO "Fill" (
                id, "tradeId", "orderId", "tenantId", "instrumentId",
                price, quantity, fee, "feeCurrency", role, side, meta, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING
                id, "tradeId" as "trade_id!", "orderId" as "order_id!", "tenantId" as "tenant_id!",
                "instrumentId" as "instrument_id!", price, quantity, fee as "fee!",
                "feeCurrency" as "fee_currency!", role, side, meta, "createdAt" as created_at,
                "updatedAt" as updated_at
            "#,
            fill.id,
            fill.trade_id,
            fill.order_id,
            fill.tenant_id,
            fill.instrument_id,
            fill.price,
            fill.quantity,
            fill.fee,
            fill.fee_currency,
            fill.role,
            fill.side,
            fill.meta,
            fill.created_at,
            fill.updated_at
        )
        .fetch_one(&mut **tx)
        .await
        .map_err(crate::error::AppError::DatabaseError)
    }

    async fn list_by_order(&self, order_id: Uuid) -> Result<Vec<Fill>> {
        sqlx::query_as!(
            Fill,
            r#"
            SELECT 
                id, "tradeId" as "trade_id!", "orderId" as "order_id!", "tenantId" as "tenant_id!",
                "instrumentId" as "instrument_id!", price, quantity, fee as "fee!",
                "feeCurrency" as "fee_currency!", role, side, meta, "createdAt" as created_at,
                "updatedAt" as updated_at
            FROM "Fill" 
            WHERE "orderId" = $1
            "#,
            order_id
        )
        .fetch_all(&self.pool)
        .await
        .map_err(crate::error::AppError::DatabaseError)
    }

    async fn list_by_instrument_and_time(
        &self,
        instrument_id: Uuid,
        start_time: chrono::DateTime<chrono::Utc>,
        end_time: chrono::DateTime<chrono::Utc>,
    ) -> Result<Vec<Fill>> {
        sqlx::query_as!(
            Fill,
            r#"
            SELECT 
                id, "tradeId" as "trade_id!", "orderId" as "order_id!", "tenantId" as "tenant_id!",
                "instrumentId" as "instrument_id!", price, quantity, fee as "fee!",
                "feeCurrency" as "fee_currency!", role, side, meta, "createdAt" as created_at,
                "updatedAt" as updated_at
            FROM "Fill" 
            WHERE "instrumentId" = $1 
            AND "createdAt" >= $2 
            AND "createdAt" <= $3
            ORDER BY "createdAt" ASC
            "#,
            instrument_id,
            start_time,
            end_time
        )
        .fetch_all(&self.pool)
        .await
        .map_err(crate::error::AppError::DatabaseError)
    }
}
