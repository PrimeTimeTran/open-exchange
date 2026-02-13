use async_trait::async_trait;
use sqlx::{PgPool, FromRow, Transaction, Postgres};
use uuid::Uuid;
use crate::domain::orders::{Order, OrderRepository};
use crate::error::{AppError, Result};
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;

pub struct PostgresOrderRepository {
    pool: PgPool,
}

impl PostgresOrderRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(FromRow)]
struct OrderRow {
    id: Uuid,
    #[sqlx(rename = "tenantId")]
    tenant_id: Uuid,
    #[sqlx(rename = "accountId")]
    account_id: Uuid,
    #[sqlx(rename = "instrumentId")]
    instrument_id: Uuid,
    side: String,
    r#type: Option<String>,
    quantity: Decimal,
    price: Decimal,
    status: String,
    #[sqlx(rename = "quantityFilled")]
    filled_quantity: Decimal,
    meta: Option<serde_json::Value>,
    #[sqlx(rename = "createdAt")]
    created_at: DateTime<Utc>,
    #[sqlx(rename = "updatedAt")]
    updated_at: DateTime<Utc>,
}

impl From<OrderRow> for Order {
    fn from(row: OrderRow) -> Self {
        Self {
            id: row.id,
            tenant_id: row.tenant_id,
            account_id: row.account_id,
            instrument_id: row.instrument_id,
            side: row.side,
            r#type: row.r#type.unwrap_or_else(|| "limit".to_string()),
            quantity: row.quantity,
            price: row.price,
            status: row.status,
            filled_quantity: row.filled_quantity,
            average_fill_price: Decimal::ZERO,
            meta: row.meta.unwrap_or(serde_json::json!({})),
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[async_trait]
impl OrderRepository for PostgresOrderRepository {
    async fn create(&self, order: Order) -> Result<Order> {
        let (created_at, updated_at): (DateTime<Utc>, DateTime<Utc>) = sqlx::query_as(
            r#"
            INSERT INTO "Order" (id, "tenantId", "accountId", "instrumentId", side, type, quantity, price, status, "quantityFilled", meta, "createdAt", "updatedAt", "createdByUserId", "updatedByUserId", "createdByMembershipId", "updatedByMembershipId")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NULL, NULL, NULL, NULL)
            RETURNING "createdAt", "updatedAt"
            "#
        )
        .bind(order.id)
        .bind(order.tenant_id)
        .bind(order.account_id)
        .bind(order.instrument_id)
        .bind(&order.side)
        .bind(&order.r#type)
        .bind(order.quantity)
        .bind(order.price)
        .bind(&order.status)
        .bind(order.filled_quantity)
        .bind(&order.meta)
        .bind(order.created_at)
        .bind(order.updated_at)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        let mut created_order = order;
        created_order.created_at = created_at;
        created_order.updated_at = updated_at;

        Ok(created_order)
    }

    async fn get(&self, id: Uuid) -> Result<Option<Order>> {
        let rec: Option<OrderRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "accountId", "instrumentId", side, type as "type", quantity, price, status, "quantityFilled", meta, "createdAt", "updatedAt"
            FROM "Order"
            WHERE id = $1
            "#
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }

    async fn update_status(&self, id: Uuid, status: String) -> Result<()> {
        let result = sqlx::query(
            r#"UPDATE "Order" SET status = $2, "updatedAt" = $3 WHERE id = $1"#
        )
        .bind(id)
        .bind(status)
        .bind(chrono::Utc::now())
        .execute(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(format!("Order {} not found", id)));
        }

        Ok(())
    }

    async fn update_status_with_tx(&self, tx: &mut Transaction<'_, Postgres>, id: Uuid, status: String) -> Result<()> {
        let result = sqlx::query(
            r#"UPDATE "Order" SET status = $2, "updatedAt" = $3 WHERE id = $1"#
        )
        .bind(id)
        .bind(status)
        .bind(chrono::Utc::now())
        .execute(&mut **tx)
        .await
        .map_err(AppError::DatabaseError)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(format!("Order {} not found", id)));
        }

        Ok(())
    }

    async fn update_filled_amount(&self, id: Uuid, filled: Decimal) -> Result<()> {
        let result = sqlx::query(
            r#"
            UPDATE "Order" 
            SET "quantityFilled" = $2,
                "updatedAt" = $3
            WHERE id = $1
            "#
        )
        .bind(id)
        .bind(filled)
        .bind(chrono::Utc::now())
        .execute(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        if result.rows_affected() == 0 {
             return Err(AppError::NotFound(format!("Order {} not found", id)));
        }
        Ok(())
    }

    async fn update_filled_amount_with_tx(&self, tx: &mut Transaction<'_, Postgres>, id: Uuid, filled: Decimal) -> Result<()> {
        let result = sqlx::query(
            r#"
            UPDATE "Order" 
            SET "quantityFilled" = $2,
                "updatedAt" = $3
            WHERE id = $1
            "#
        )
        .bind(id)
        .bind(filled)
        .bind(chrono::Utc::now())
        .execute(&mut **tx)
        .await
        .map_err(AppError::DatabaseError)?;

        if result.rows_affected() == 0 {
             return Err(AppError::NotFound(format!("Order {} not found", id)));
        }
        Ok(())
    }

    async fn list_open(&self) -> Result<Vec<Order>> {
        let recs: Vec<OrderRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "accountId", "instrumentId", side, type as "type", quantity, price, status, "quantityFilled", meta, "createdAt", "updatedAt"
            FROM "Order"
            WHERE status = 'new' OR status = 'partial_fill' OR status = 'open'
            "#
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(recs.into_iter().map(|r| r.into()).collect())
    }
}


