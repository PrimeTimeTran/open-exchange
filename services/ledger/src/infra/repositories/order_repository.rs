use crate::domain::orders::{Order, OrderRepository, OrderSide, OrderStatus, OrderType};
use crate::error::{AppError, Result};
use crate::infra::transaction::PostgresTransaction;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use sqlx::{FromRow, PgPool};
use std::str::FromStr;
use uuid::Uuid;

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
            side: OrderSide::from_str(&row.side).unwrap_or(OrderSide::Buy), // TODO: Handle error better
            r#type: OrderType::from_str(&row.r#type.unwrap_or_else(|| "limit".to_string()))
                .unwrap_or(OrderType::Limit),
            quantity: row.quantity,
            price: row.price,
            status: OrderStatus::from_str(&row.status).unwrap_or(OrderStatus::New),
            filled_quantity: row.filled_quantity,
            average_fill_price: Decimal::ZERO,
            meta: row.meta.unwrap_or(serde_json::json!({})),
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

use crate::domain::transaction::RepositoryTransaction;

#[async_trait]
impl OrderRepository for PostgresOrderRepository {
    async fn create(&self, order: Order) -> Result<Order> {
        let (created_at, updated_at): (DateTime<Utc>, DateTime<Utc>) = sqlx
            ::query_as(
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
            .bind(order.side.to_string())
            .bind(order.r#type.to_string())
            .bind(order.quantity)
            .bind(order.price)
            .bind(order.status.to_string())
            .bind(order.filled_quantity)
            .bind(&order.meta)
            .bind(order.created_at)
            .bind(order.updated_at)
            .fetch_one(&self.pool).await
            .map_err(AppError::DatabaseError)?;

        let mut created_order = order;
        created_order.created_at = created_at;
        created_order.updated_at = updated_at;

        Ok(created_order)
    }

    async fn create_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        order: Order,
    ) -> Result<Order> {
        let tx = tx
            .as_any()
            .downcast_mut::<PostgresTransaction>()
            .ok_or_else(|| AppError::Internal("Transaction is not a PostgresTransaction".into()))?;
        let tx = &mut tx.conn;
        let (created_at, updated_at): (DateTime<Utc>, DateTime<Utc>) = sqlx
            ::query_as(
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
            .bind(order.side.to_string())
            .bind(order.r#type.to_string())
            .bind(order.quantity)
            .bind(order.price)
            .bind(order.status.to_string())
            .bind(order.filled_quantity)
            .bind(&order.meta)
            .bind(order.created_at)
            .bind(order.updated_at)
            .fetch_one(&mut **tx).await
            .map_err(AppError::DatabaseError)?;

        let mut created_order = order;
        created_order.created_at = created_at;
        created_order.updated_at = updated_at;

        Ok(created_order)
    }

    async fn get(&self, id: Uuid) -> Result<Option<Order>> {
        let rec: Option<OrderRow> = sqlx
            ::query_as(
                r#"
            SELECT id, "tenantId", "accountId", "instrumentId", side, type as "type", quantity, price, status, "quantityFilled", meta, "createdAt", "updatedAt"
            FROM "Order"
            WHERE id = $1
            "#
            )
            .bind(id)
            .fetch_optional(&self.pool).await
            .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }

    async fn get_for_update(
        &self,
        tx: &mut dyn RepositoryTransaction,
        id: Uuid,
    ) -> Result<Option<Order>> {
        let tx = tx
            .as_any()
            .downcast_mut::<PostgresTransaction>()
            .ok_or_else(|| AppError::Internal("Transaction is not a PostgresTransaction".into()))?;
        let tx = &mut tx.conn;

        let rec: Option<OrderRow> = sqlx
            ::query_as(
                r#"
            SELECT id, "tenantId", "accountId", "instrumentId", side, type as "type", quantity, price, status, "quantityFilled", meta, "createdAt", "updatedAt"
            FROM "Order"
            WHERE id = $1
            FOR UPDATE
            "#
            )
            .bind(id)
            .fetch_optional(&mut **tx).await
            .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }

    async fn update_status(&self, id: Uuid, status: OrderStatus) -> Result<()> {
        let result =
            sqlx::query(r#"UPDATE "Order" SET status = $2, "updatedAt" = $3 WHERE id = $1"#)
                .bind(id)
                .bind(status.to_string())
                .bind(chrono::Utc::now())
                .execute(&self.pool)
                .await
                .map_err(AppError::DatabaseError)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(format!("Order {} not found", id)));
        }

        Ok(())
    }

    async fn update_status_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        id: Uuid,
        status: OrderStatus,
    ) -> Result<()> {
        let tx = tx
            .as_any()
            .downcast_mut::<PostgresTransaction>()
            .ok_or_else(|| AppError::Internal("Transaction is not a PostgresTransaction".into()))?;
        let tx = &mut tx.conn;
        let result =
            sqlx::query(r#"UPDATE "Order" SET status = $2, "updatedAt" = $3 WHERE id = $1"#)
                .bind(id)
                .bind(status.to_string())
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
            "#,
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

    async fn update_filled_amount_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        id: Uuid,
        filled: Decimal,
    ) -> Result<()> {
        let tx = tx
            .as_any()
            .downcast_mut::<PostgresTransaction>()
            .ok_or_else(|| AppError::Internal("Transaction is not a PostgresTransaction".into()))?;
        let tx = &mut tx.conn;
        let result = sqlx::query(
            r#"
            UPDATE "Order" 
            SET "quantityFilled" = $2,
                "updatedAt" = $3
            WHERE id = $1
            "#,
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

    async fn increment_filled_amount(&self, id: Uuid, amount: Decimal) -> Result<Order> {
        let row: OrderRow = sqlx
            ::query_as(
                r#"
            UPDATE "Order" 
            SET "quantityFilled" = "quantityFilled" + $2, "updatedAt" = $3 
            WHERE id = $1 
            RETURNING id, "tenantId", "accountId", "instrumentId", side, type as "type", quantity, price, status, "quantityFilled", meta, "createdAt", "updatedAt"
            "#
            )
            .bind(id)
            .bind(amount)
            .bind(chrono::Utc::now())
            .fetch_one(&self.pool).await
            .map_err(AppError::DatabaseError)?;

        Ok(row.into())
    }

    async fn increment_filled_amount_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        id: Uuid,
        amount: Decimal,
    ) -> Result<Order> {
        let tx = tx
            .as_any()
            .downcast_mut::<PostgresTransaction>()
            .ok_or_else(|| AppError::Internal("Transaction is not a PostgresTransaction".into()))?;
        let tx = &mut tx.conn;
        let row: OrderRow = sqlx
            ::query_as(
                r#"
            UPDATE "Order" 
            SET "quantityFilled" = "quantityFilled" + $2, "updatedAt" = $3 
            WHERE id = $1 
            RETURNING id, "tenantId", "accountId", "instrumentId", side, type as "type", quantity, price, status, "quantityFilled", meta, "createdAt", "updatedAt"
            "#
            )
            .bind(id)
            .bind(amount)
            .bind(chrono::Utc::now())
            .fetch_one(&mut **tx).await
            .map_err(AppError::DatabaseError)?;

        Ok(row.into())
    }

    async fn list_open(&self) -> Result<Vec<Order>> {
        let recs: Vec<OrderRow> = sqlx
            ::query_as(
                r#"
            SELECT id, "tenantId", "accountId", "instrumentId", side, type as "type", quantity, price, status, "quantityFilled", meta, "createdAt", "updatedAt"
            FROM "Order"
            WHERE status = 'new' OR status = 'partial_fill' OR status = 'open'
            "#
            )
            .fetch_all(&self.pool).await
            .map_err(AppError::DatabaseError)?;

        Ok(recs.into_iter().map(|r| r.into()).collect())
    }
}
