use async_trait::async_trait;
use sqlx::{PgPool, FromRow};
use uuid::Uuid;
use crate::domain::wallets::{Wallet, WalletRepository};
use crate::error::{AppError, Result};
use chrono::{DateTime, Utc};

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
    available: Option<f64>,
    locked: Option<f64>,
    total: Option<f64>,
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
            id: row.id.to_string(),
            tenant_id: row.tenant_id.to_string(),
            user_id: "".to_string(),
            account_id: row.account_id.to_string(),
            asset_id: row.asset_id.to_string(),
            available: row.available.unwrap_or(0.0).to_string(),
            locked: row.locked.unwrap_or(0.0).to_string(),
            total: row.total.unwrap_or(0.0).to_string(),
            version: row.version.unwrap_or(1),
            status: "active".to_string(),
            meta: row.meta.unwrap_or(serde_json::json!({})).to_string(),
            created_at: row.created_at.timestamp_millis(),
            updated_at: row.updated_at.timestamp_millis(),
        }
    }
}

#[async_trait]
impl WalletRepository for PostgresWalletRepository {
    async fn create(&self, wallet: Wallet) -> Result<Wallet> {
        let account_id = Uuid::parse_str(&wallet.account_id).map_err(|_| AppError::ValidationError("Invalid account_id".into()))?;
        let asset_id = Uuid::parse_str(&wallet.asset_id).map_err(|_| AppError::ValidationError("Invalid asset_id".into()))?;
        let tenant_id = Uuid::parse_str(&wallet.tenant_id).unwrap_or_default();
        
        let rec: WalletRow = sqlx::query_as(
            r#"
            INSERT INTO "Wallet" (id, "tenantId", "accountId", "assetId", available, locked, total, version, meta, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id, "tenantId", "accountId", "assetId", 
                      CAST(available AS FLOAT8), CAST(locked AS FLOAT8), CAST(total AS FLOAT8), 
                      version, meta, "createdAt", "updatedAt"
            "#
        )
        .bind(Uuid::parse_str(&wallet.id).unwrap_or(Uuid::new_v4()))
        .bind(tenant_id)
        .bind(account_id)
        .bind(asset_id)
        .bind(wallet.available.parse::<f64>().unwrap_or(0.0))
        .bind(wallet.locked.parse::<f64>().unwrap_or(0.0))
        .bind(wallet.total.parse::<f64>().unwrap_or(0.0))
        .bind(wallet.version)
        .bind(serde_json::from_str::<serde_json::Value>(&wallet.meta).unwrap_or(serde_json::json!({})))
        .bind(chrono::Utc::now())
        .bind(chrono::Utc::now())
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.into())
    }

    async fn get(&self, id: Uuid) -> Result<Option<Wallet>> {
        let rec: Option<WalletRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "accountId", "assetId", 
                   CAST(available AS FLOAT8), CAST(locked AS FLOAT8), CAST(total AS FLOAT8), 
                   version, meta, "createdAt", "updatedAt"
            FROM "Wallet"
            WHERE id = $1
            "#
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }

    async fn get_by_account_and_asset(&self, account_id: &str, asset_id: &str) -> Result<Option<Wallet>> {
        let acc_uuid = Uuid::parse_str(account_id).map_err(|_| AppError::ValidationError("Invalid account_id".into()))?;
        let asset_uuid = Uuid::parse_str(asset_id).map_err(|_| AppError::ValidationError("Invalid asset_id".into()))?;

        let rec: Option<WalletRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "accountId", "assetId", 
                   CAST(available AS FLOAT8), CAST(locked AS FLOAT8), CAST(total AS FLOAT8), 
                   version, meta, "createdAt", "updatedAt"
            FROM "Wallet"
            WHERE "accountId" = $1 AND "assetId" = $2
            "#
        )
        .bind(acc_uuid)
        .bind(asset_uuid)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }

    async fn update(&self, wallet: Wallet) -> Result<Wallet> {
        let id = Uuid::parse_str(&wallet.id).map_err(|_| AppError::ValidationError("Invalid wallet id".into()))?;
        
        let rec: WalletRow = sqlx::query_as(
            r#"
            UPDATE "Wallet"
            SET available = $2, locked = $3, total = $4, "updatedAt" = $5
            WHERE id = $1
            RETURNING id, "tenantId", "accountId", "assetId", 
                      CAST(available AS FLOAT8), CAST(locked AS FLOAT8), CAST(total AS FLOAT8), 
                      version, meta, "createdAt", "updatedAt"
            "#
        )
        .bind(id)
        .bind(wallet.available.parse::<f64>().unwrap_or(0.0))
        .bind(wallet.locked.parse::<f64>().unwrap_or(0.0))
        .bind(wallet.total.parse::<f64>().unwrap_or(0.0))
        .bind(chrono::Utc::now())
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.into())
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
        let acc_uuid = Uuid::parse_str(account_id).map_err(|_| AppError::ValidationError("Invalid account_id".into()))?;

        let recs: Vec<WalletRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "accountId", "assetId", 
                   CAST(available AS FLOAT8), CAST(locked AS FLOAT8), CAST(total AS FLOAT8), 
                   version, meta, "createdAt", "updatedAt"
            FROM "Wallet"
            WHERE "accountId" = $1
            "#
        )
        .bind(acc_uuid)
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(recs.into_iter().map(|r| r.into()).collect())
    }
}
