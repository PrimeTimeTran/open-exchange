use async_trait::async_trait;
use sqlx::{PgPool, FromRow};
use uuid::Uuid;
use crate::proto::common;
use crate::error::{AppError, Result};
use chrono::{DateTime, Utc};

#[derive(Debug)]
pub struct PostgresInstrumentRepository {
    pool: PgPool,
}

impl PostgresInstrumentRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(FromRow)]
struct InstrumentRow {
    id: Uuid,
    #[sqlx(rename = "tenantId")]
    tenant_id: Uuid,
    symbol: String,
    #[sqlx(rename = "type")]
    r#type: Option<String>,
    status: Option<String>,
    #[sqlx(rename = "underlyingAssetId")]
    underlying_asset_id: Option<Uuid>,
    #[sqlx(rename = "quoteAssetId")]
    quote_asset_id: Option<Uuid>,
    meta: Option<serde_json::Value>,
    #[sqlx(rename = "createdAt")]
    created_at: DateTime<Utc>,
    #[sqlx(rename = "updatedAt")]
    updated_at: DateTime<Utc>,
}

impl From<InstrumentRow> for common::Instrument {
    fn from(row: InstrumentRow) -> Self {
        Self {
            id: row.id.to_string(),
            tenant_id: row.tenant_id.to_string(),
            symbol: row.symbol,
            r#type: row.r#type.unwrap_or_default(),
            status: row.status.unwrap_or_default(),
            underlying_asset_id: row.underlying_asset_id.map(|u| u.to_string()).unwrap_or_default(),
            quote_asset_id: row.quote_asset_id.map(|u| u.to_string()).unwrap_or_default(),
            meta: row.meta.unwrap_or(serde_json::json!({})).to_string(),
            created_at: row.created_at.timestamp_millis(),
            updated_at: row.updated_at.timestamp_millis(),
        }
    }
}

#[async_trait]
pub trait InstrumentRepository: Send + Sync + std::fmt::Debug {
    async fn get(&self, id: Uuid) -> Result<Option<common::Instrument>>;
    async fn get_by_symbol(&self, symbol: &str) -> Result<Option<common::Instrument>>;
    async fn list(&self) -> Result<Vec<common::Instrument>>;
    async fn create(&self, instrument: common::Instrument) -> Result<common::Instrument>;
}

#[async_trait]
impl InstrumentRepository for PostgresInstrumentRepository {
    async fn get(&self, id: Uuid) -> Result<Option<common::Instrument>> {
        let rec: Option<InstrumentRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", symbol, type, status, "underlyingAssetId", "quoteAssetId", meta, "createdAt", "updatedAt"
            FROM "Instrument"
            WHERE id = $1
            "#
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }

    async fn get_by_symbol(&self, symbol: &str) -> Result<Option<common::Instrument>> {
        let rec: Option<InstrumentRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", symbol, type, status, "underlyingAssetId", "quoteAssetId", meta, "createdAt", "updatedAt"
            FROM "Instrument"
            WHERE symbol = $1
            "#
        )
        .bind(symbol)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }

    async fn list(&self) -> Result<Vec<common::Instrument>> {
        let recs: Vec<InstrumentRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", symbol, type, status, "underlyingAssetId", "quoteAssetId", meta, "createdAt", "updatedAt"
            FROM "Instrument"
            "#
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(recs.into_iter().map(|r| r.into()).collect())
    }

    async fn create(&self, instrument: common::Instrument) -> Result<common::Instrument> {
        let id = Uuid::parse_str(&instrument.id).unwrap_or(Uuid::new_v4());
        let tenant_id = if instrument.tenant_id.is_empty() {
             Uuid::new_v4() // This might be wrong if we need specific tenant
        } else {
             Uuid::parse_str(&instrument.tenant_id).unwrap_or(Uuid::new_v4())
        };
        let underlying_asset_id = if instrument.underlying_asset_id.is_empty() {
            None
        } else {
            Some(Uuid::parse_str(&instrument.underlying_asset_id).unwrap_or_default())
        };
        let quote_asset_id = if instrument.quote_asset_id.is_empty() {
            None
        } else {
            Some(Uuid::parse_str(&instrument.quote_asset_id).unwrap_or_default())
        };

        let rec: InstrumentRow = sqlx::query_as(
            r#"
            INSERT INTO "Instrument" (id, "tenantId", symbol, type, status, "underlyingAssetId", "quoteAssetId", meta, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, "tenantId", symbol, type, status, "underlyingAssetId", "quoteAssetId", meta, "createdAt", "updatedAt"
            "#
        )
        .bind(id)
        .bind(tenant_id)
        .bind(instrument.symbol)
        .bind(instrument.r#type)
        .bind(instrument.status)
        .bind(underlying_asset_id)
        .bind(quote_asset_id)
        .bind(serde_json::from_str::<serde_json::Value>(&instrument.meta).unwrap_or(serde_json::json!({})))
        .bind(DateTime::from_timestamp_millis(instrument.created_at).unwrap_or(Utc::now()))
        .bind(DateTime::from_timestamp_millis(instrument.updated_at).unwrap_or(Utc::now()))
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.into())
    }
}
