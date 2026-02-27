use crate::domain::wallets::{Wallet, WalletRepository};
use crate::error::{AppError, Result};
use crate::infra::transaction::PostgresTransaction;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

#[derive(Debug)]
pub struct PostgresWalletRepository {
    pool: PgPool,
}

impl PostgresWalletRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(FromRow)]
struct WalletRow {
    id: Uuid,
    #[sqlx(rename = "tenantId")]
    tenant_id: Uuid,
    #[sqlx(rename = "accountId")]
    account_id: Uuid,
    #[sqlx(rename = "assetId")]
    asset_id: Uuid,
    available: Option<Decimal>,
    locked: Option<Decimal>,
    total: Option<Decimal>,
    version: Option<i32>,
    meta: Option<serde_json::Value>,
    #[sqlx(rename = "createdAt")]
    created_at: DateTime<Utc>,
    #[sqlx(rename = "updatedAt")]
    updated_at: DateTime<Utc>,
}

impl From<WalletRow> for Wallet {
    fn from(row: WalletRow) -> Self {
        Self {
            id: row.id,
            tenant_id: row.tenant_id,
            user_id: "".to_string(),
            account_id: row.account_id,
            asset_id: row.asset_id,
            available: row.available.unwrap_or_default(),
            locked: row.locked.unwrap_or_default(),
            total: row.total.unwrap_or_default(),
            version: row.version.unwrap_or(1),
            status: "active".to_string(),
            meta: row.meta.unwrap_or(serde_json::json!({})),
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

// use crate::infra::transaction::PostgresTransaction;

use crate::domain::transaction::RepositoryTransaction;

#[async_trait]
impl WalletRepository for PostgresWalletRepository {
    async fn create(&self, wallet: Wallet) -> Result<Wallet> {
        let rec: WalletRow = sqlx
            ::query_as(
                r#"
            INSERT INTO "Wallet" (id, "tenantId", "accountId", "assetId", available, locked, total, version, meta, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id, "tenantId", "accountId", "assetId", 
                      available, locked, total, 
                      version, meta, "createdAt", "updatedAt"
            "#
            )
            .bind(wallet.id)
            .bind(wallet.tenant_id)
            .bind(wallet.account_id)
            .bind(wallet.asset_id)
            .bind(wallet.available)
            .bind(wallet.locked)
            .bind(wallet.total)
            .bind(wallet.version)
            .bind(&wallet.meta)
            .bind(wallet.created_at)
            .bind(wallet.updated_at)
            .fetch_one(&self.pool).await
            .map_err(AppError::DatabaseError)?;

        Ok(rec.into())
    }

    async fn get(&self, id: Uuid) -> Result<Option<Wallet>> {
        let rec: Option<WalletRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "accountId", "assetId", 
                   available, locked, total, 
                   version, meta, "createdAt", "updatedAt"
            FROM "Wallet"
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }

    async fn get_by_account_and_asset(
        &self,
        account_id: &str,
        asset_id: &str,
    ) -> Result<Option<Wallet>> {
        let acc_uuid = Uuid::parse_str(account_id)
            .map_err(|_| AppError::ValidationError("Invalid account_id".into()))?;
        let asset_uuid = Uuid::parse_str(asset_id)
            .map_err(|_| AppError::ValidationError("Invalid asset_id".into()))?;

        let rec: Option<WalletRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "accountId", "assetId", 
                   available, locked, total, 
                   version, meta, "createdAt", "updatedAt"
            FROM "Wallet"
            WHERE "accountId" = $1 AND "assetId" = $2
            "#,
        )
        .bind(acc_uuid)
        .bind(asset_uuid)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }

    async fn get_by_account_and_asset_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        account_id: &str,
        asset_id: &str,
    ) -> Result<Option<Wallet>> {
        let tx = tx
            .as_any()
            .downcast_mut::<PostgresTransaction>()
            .ok_or_else(|| AppError::Internal("Transaction is not a PostgresTransaction".into()))?;
        let tx = &mut tx.conn;
        let acc_uuid = Uuid::parse_str(account_id)
            .map_err(|_| AppError::ValidationError("Invalid account_id".into()))?;
        let asset_uuid = Uuid::parse_str(asset_id)
            .map_err(|_| AppError::ValidationError("Invalid asset_id".into()))?;

        let rec: Option<WalletRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "accountId", "assetId", 
                   available, locked, total, 
                   version, meta, "createdAt", "updatedAt"
            FROM "Wallet"
            WHERE "accountId" = $1 AND "assetId" = $2
            "#,
        )
        .bind(acc_uuid)
        .bind(asset_uuid)
        .fetch_optional(&mut **tx)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }

    async fn get_by_account_and_asset_for_update(
        &self,
        tx: &mut dyn RepositoryTransaction,
        account_id: &str,
        asset_id: &str,
    ) -> Result<Option<Wallet>> {
        let tx = tx
            .as_any()
            .downcast_mut::<PostgresTransaction>()
            .ok_or_else(|| AppError::Internal("Transaction is not a PostgresTransaction".into()))?;
        let tx = &mut tx.conn;
        let acc_uuid = Uuid::parse_str(account_id)
            .map_err(|_| AppError::ValidationError("Invalid account_id".into()))?;
        let asset_uuid = Uuid::parse_str(asset_id)
            .map_err(|_| AppError::ValidationError("Invalid asset_id".into()))?;

        let rec: Option<WalletRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "accountId", "assetId", 
                   available, locked, total, 
                   version, meta, "createdAt", "updatedAt"
            FROM "Wallet"
            WHERE "accountId" = $1 AND "assetId" = $2
            FOR UPDATE
            "#,
        )
        .bind(acc_uuid)
        .bind(asset_uuid)
        .fetch_optional(&mut **tx)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }

    async fn update(&self, wallet: Wallet) -> Result<Wallet> {
        let rec = sqlx::query_as::<_, WalletRow>(
            r#"
            UPDATE "Wallet"
            SET available = $2, locked = $3, total = $4, "updatedAt" = $5, version = version + 1
            WHERE id = $1 AND version = $6
            RETURNING id, "tenantId", "accountId", "assetId", 
                      available, locked, total, 
                      version, meta, "createdAt", "updatedAt"
            "#,
        )
        .bind(wallet.id)
        .bind(wallet.available)
        .bind(wallet.locked)
        .bind(wallet.total)
        .bind(chrono::Utc::now())
        .bind(wallet.version)
        .fetch_one(&self.pool)
        .await;

        match rec {
            Ok(row) => Ok(row.into()),
            Err(sqlx::Error::RowNotFound) => Err(AppError::OptimisticLockingError(format!(
                "Wallet {} version mismatch (expected {})",
                wallet.id, wallet.version
            ))),
            Err(e) => Err(AppError::DatabaseError(e)),
        }
    }

    async fn update_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        wallet: Wallet,
    ) -> Result<Wallet> {
        let tx = tx
            .as_any()
            .downcast_mut::<PostgresTransaction>()
            .ok_or_else(|| AppError::Internal("Transaction is not a PostgresTransaction".into()))?;
        let tx = &mut tx.conn;

        let rec = sqlx::query_as::<_, WalletRow>(
            r#"
            UPDATE "Wallet"
            SET available = $2, locked = $3, total = $4, "updatedAt" = $5, version = version + 1
            WHERE id = $1 AND version = $6
            RETURNING id, "tenantId", "accountId", "assetId", 
                      available, locked, total, 
                      version, meta, "createdAt", "updatedAt"
            "#,
        )
        .bind(wallet.id)
        .bind(wallet.available)
        .bind(wallet.locked)
        .bind(wallet.total)
        .bind(chrono::Utc::now())
        .bind(wallet.version)
        .fetch_one(&mut **tx)
        .await;

        match rec {
            Ok(row) => Ok(row.into()),
            Err(sqlx::Error::RowNotFound) => Err(AppError::OptimisticLockingError(format!(
                "Wallet {} version mismatch (expected {})",
                wallet.id, wallet.version
            ))),
            Err(e) => Err(AppError::DatabaseError(e)),
        }
    }

    async fn delete(&self, id: Uuid) -> Result<()> {
        let result = sqlx::query(r#"DELETE FROM "Wallet" WHERE id = $1"#)
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(AppError::DatabaseError)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(format!("Wallet {} not found", id)));
        }
        Ok(())
    }

    async fn list_by_account(&self, account_id: &str) -> Result<Vec<Wallet>> {
        let acc_uuid = Uuid::parse_str(account_id)
            .map_err(|_| AppError::ValidationError("Invalid account_id".into()))?;

        let recs: Vec<WalletRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "accountId", "assetId",
                   available, locked, total,
                   version, meta, "createdAt", "updatedAt"
            FROM "Wallet"
            WHERE "accountId" = $1
            "#,
        )
        .bind(acc_uuid)
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(recs.into_iter().map(|r| r.into()).collect())
    }

    async fn list_by_asset(&self, asset_id: &str) -> Result<Vec<Wallet>> {
        let asset_uuid = Uuid::parse_str(asset_id)
            .map_err(|_| AppError::ValidationError("Invalid asset_id".into()))?;

        let recs: Vec<WalletRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "accountId", "assetId",
                   available, locked, total,
                   version, meta, "createdAt", "updatedAt"
            FROM "Wallet"
            WHERE "assetId" = $1
            "#,
        )
        .bind(asset_uuid)
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(recs.into_iter().map(|r| r.into()).collect())
    }
}
