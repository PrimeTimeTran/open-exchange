use async_trait::async_trait;
use sqlx::{PgPool, FromRow};
use uuid::Uuid;
use crate::proto::common;
use crate::error::{AppError, Result};
use chrono::{DateTime, Utc};

#[derive(Debug)]
pub struct PostgresAssetRepository {
    pool: PgPool,
}

impl PostgresAssetRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(FromRow)]
struct AssetRow {
    id: Uuid,
    #[sqlx(rename = "tenantId")]
    tenant_id: Uuid,
    symbol: String,
    klass: Option<String>,
    precision: Option<i32>,
    #[sqlx(rename = "isFractional")]
    is_fractional: bool,
    decimals: Option<i32>,
    meta: Option<serde_json::Value>,
    #[sqlx(rename = "createdAt")]
    created_at: DateTime<Utc>,
    #[sqlx(rename = "updatedAt")]
    updated_at: DateTime<Utc>,
}

impl From<AssetRow> for common::Asset {
    fn from(row: AssetRow) -> Self {
        Self {
            id: row.id.to_string(),
            tenant_id: row.tenant_id.to_string(),
            symbol: row.symbol,
            klass: row.klass.unwrap_or_default(),
            precision: row.precision.unwrap_or(0),
            is_fractional: row.is_fractional,
            decimals: row.decimals.unwrap_or(0),
            meta: row.meta.unwrap_or(serde_json::json!({})).to_string(),
            created_at: row.created_at.timestamp_millis(),
            updated_at: row.updated_at.timestamp_millis(),
        }
    }
}

#[async_trait]
pub trait AssetRepository: Send + Sync + std::fmt::Debug {
    async fn get(&self, id: Uuid) -> Result<Option<common::Asset>>;
    async fn get_by_symbol(&self, symbol: &str) -> Result<Option<common::Asset>>;
    async fn list(&self) -> Result<Vec<common::Asset>>;
}

#[async_trait]
impl AssetRepository for PostgresAssetRepository {
    async fn get(&self, id: Uuid) -> Result<Option<common::Asset>> {
        let rec: Option<AssetRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", symbol, klass, precision, "isFractional", decimals, meta, "createdAt", "updatedAt"
            FROM "Asset"
            WHERE id = $1
            "#
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }

    async fn get_by_symbol(&self, symbol: &str) -> Result<Option<common::Asset>> {
        let rec: Option<AssetRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", symbol, klass, precision, "isFractional", decimals, meta, "createdAt", "updatedAt"
            FROM "Asset"
            WHERE symbol = $1
            "#
        )
        .bind(symbol)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }

    async fn list(&self) -> Result<Vec<common::Asset>> {
        let recs: Vec<AssetRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", symbol, klass, precision, "isFractional", decimals, meta, "createdAt", "updatedAt"
            FROM "Asset"
            "#
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(recs.into_iter().map(|r| r.into()).collect())
    }
}
