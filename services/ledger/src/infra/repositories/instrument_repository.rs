use crate::domain::instruments::model::Instrument;
use crate::error::{AppError, Result};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

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

impl From<InstrumentRow> for Instrument {
    fn from(row: InstrumentRow) -> Self {
        Self {
            id: row.id,
            tenant_id: row.tenant_id,
            symbol: row.symbol,
            r#type: row.r#type.unwrap_or_default(),
            status: row.status.unwrap_or_default(),
            underlying_asset_id: row.underlying_asset_id.unwrap_or_default(),
            quote_asset_id: row.quote_asset_id.unwrap_or_default(),
            meta: row.meta.unwrap_or(serde_json::json!({})),
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[async_trait]
pub trait InstrumentRepository: Send + Sync + std::fmt::Debug {
    async fn get(&self, id: Uuid) -> Result<Option<Instrument>>;
    async fn get_by_symbol(&self, symbol: &str) -> Result<Option<Instrument>>;
    async fn list(&self) -> Result<Vec<Instrument>>;
    async fn create(&self, instrument: Instrument) -> Result<Instrument>;
}

#[async_trait]
impl InstrumentRepository for PostgresInstrumentRepository {
    async fn get(&self, id: Uuid) -> Result<Option<Instrument>> {
        let rec: Option<InstrumentRow> = sqlx
            ::query_as(
                r#"
            SELECT id, "tenantId", symbol, type, status, "underlyingAssetId", "quoteAssetId", meta, "createdAt", "updatedAt"
            FROM "Instrument"
            WHERE id = $1
            "#
            )
            .bind(id)
            .fetch_optional(&self.pool).await
            .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }

    async fn get_by_symbol(&self, symbol: &str) -> Result<Option<Instrument>> {
        let rec: Option<InstrumentRow> = sqlx
            ::query_as(
                r#"
            SELECT id, "tenantId", symbol, type, status, "underlyingAssetId", "quoteAssetId", meta, "createdAt", "updatedAt"
            FROM "Instrument"
            WHERE symbol = $1
            "#
            )
            .bind(symbol)
            .fetch_optional(&self.pool).await
            .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }

    async fn list(&self) -> Result<Vec<Instrument>> {
        let recs: Vec<InstrumentRow> = sqlx
            ::query_as(
                r#"
            SELECT id, "tenantId", symbol, type, status, "underlyingAssetId", "quoteAssetId", meta, "createdAt", "updatedAt"
            FROM "Instrument"
            "#
            )
            .fetch_all(&self.pool).await
            .map_err(AppError::DatabaseError)?;

        Ok(recs.into_iter().map(|r| r.into()).collect())
    }

    async fn create(&self, instrument: Instrument) -> Result<Instrument> {
        let underlying_asset_id = if instrument.underlying_asset_id == Uuid::nil() {
            None
        } else {
            Some(instrument.underlying_asset_id)
        };
        let quote_asset_id = if instrument.quote_asset_id == Uuid::nil() {
            None
        } else {
            Some(instrument.quote_asset_id)
        };

        let rec: InstrumentRow = sqlx
            ::query_as(
                r#"
            INSERT INTO "Instrument" (id, "tenantId", symbol, type, status, "underlyingAssetId", "quoteAssetId", meta, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, "tenantId", symbol, type, status, "underlyingAssetId", "quoteAssetId", meta, "createdAt", "updatedAt"
            "#
            )
            .bind(instrument.id)
            .bind(instrument.tenant_id)
            .bind(instrument.symbol)
            .bind(instrument.r#type)
            .bind(instrument.status)
            .bind(underlying_asset_id)
            .bind(quote_asset_id)
            .bind(instrument.meta)
            .bind(instrument.created_at)
            .bind(instrument.updated_at)
            .fetch_one(&self.pool).await
            .map_err(AppError::DatabaseError)?;

        Ok(rec.into())
    }
}
