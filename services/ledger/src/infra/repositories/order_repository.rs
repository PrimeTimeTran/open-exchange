use async_trait::async_trait;
use sqlx::{PgPool, FromRow};
use uuid::Uuid;
use crate::domain::orders::{Order, OrderRepository};
use crate::error::{AppError, Result};
use chrono::{DateTime, Utc};

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
    quantity: f64,
    price: f64,
    status: String,
    #[sqlx(rename = "filledQuantity")]
    filled_quantity: f64,
    #[sqlx(rename = "averageFillPrice")]
    average_fill_price: f64,
    meta: serde_json::Value,
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
            quantity: row.quantity,
            price: row.price,
            status: row.status,
            filled_quantity: row.filled_quantity,
            average_fill_price: row.average_fill_price,
            meta: row.meta,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[async_trait]
impl OrderRepository for PostgresOrderRepository {
    async fn create(&self, order: Order) -> Result<Order> {
        let rec: OrderRow = sqlx::query_as(
            r#"
            INSERT INTO "Order" (id, "tenantId", "accountId", "instrumentId", side, quantity, price, status, "filledQuantity", "averageFillPrice", meta, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id, "tenantId", "accountId", "instrumentId", side, quantity, price, status, "filledQuantity", "averageFillPrice", meta, "createdAt", "updatedAt"
            "#
        )
        .bind(order.id)
        .bind(order.tenant_id)
        .bind(order.account_id)
        .bind(order.instrument_id)
        .bind(order.side)
        .bind(order.quantity)
        .bind(order.price)
        .bind(order.status)
        .bind(order.filled_quantity)
        .bind(order.average_fill_price)
        .bind(order.meta)
        .bind(order.created_at)
        .bind(order.updated_at)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.into())
    }

    async fn get(&self, id: Uuid) -> Result<Option<Order>> {
        let rec: Option<OrderRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "accountId", "instrumentId", side, quantity, price, status, "filledQuantity", "averageFillPrice", meta, "createdAt", "updatedAt"
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

    async fn list_open(&self) -> Result<Vec<Order>> {
        let recs: Vec<OrderRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "accountId", "instrumentId", side, quantity, price, status, "filledQuantity", "averageFillPrice", meta, "createdAt", "updatedAt"
            FROM "Order"
            WHERE status = 'new' OR status = 'partial' OR status = 'open'
            "#
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(recs.into_iter().map(|r| r.into()).collect())
    }
}


