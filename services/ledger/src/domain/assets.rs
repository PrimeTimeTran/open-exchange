pub mod model;

use crate::domain::assets::model::Asset;
use crate::domain::instruments::model::Instrument;
use crate::error::Result;
use crate::infra::repositories::{AssetRepository, InstrumentRepository};
use chrono::Utc;
use std::sync::Arc;
use uuid::Uuid;

#[derive(Clone, Debug)]
pub struct AssetService {
    repo: Arc<dyn AssetRepository>,
    instrument_repo: Arc<dyn InstrumentRepository>,
}

impl AssetService {
    pub fn new(
        repo: Arc<dyn AssetRepository>,
        instrument_repo: Arc<dyn InstrumentRepository>,
    ) -> Self {
        Self {
            repo,
            instrument_repo,
        }
    }

    pub async fn get_asset(&self, id: Uuid) -> Result<Option<Asset>> {
        self.repo.get(id).await
    }

    pub async fn get_asset_by_symbol(&self, symbol: &str) -> Result<Option<Asset>> {
        self.repo.get_by_symbol(symbol).await
    }

    pub async fn list_assets(&self) -> Result<Vec<Asset>> {
        self.repo.list().await
    }

    pub async fn create_new_asset(
        &self,
        symbol: String,
        asset_type: String,
        precision: i32,
    ) -> Result<Asset> {
        let asset = Asset {
            id: Uuid::new_v4(),
            tenant_id: Uuid::nil(),
            symbol,
            r#type: asset_type,
            decimals: precision,
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        self.repo.create(asset.clone()).await?;
        Ok(asset)
    }

    pub async fn create_new_instrument(
        &self,
        symbol: String,
        instrument_type: String,
        base_id: String,
        quote_id: String,
    ) -> Result<Instrument> {
        let instrument = Instrument {
            id: Uuid::new_v4(),
            tenant_id: Uuid::nil(),
            symbol,
            r#type: instrument_type,
            status: "active".to_string(),
            underlying_asset_id: Uuid::parse_str(&base_id).map_err(|_| {
                crate::error::AppError::ValidationError("Invalid instrument ID".into())
            })?,
            quote_asset_id: Uuid::parse_str(&quote_id).map_err(|_| {
                crate::error::AppError::ValidationError("Invalid instrument ID".into())
            })?,
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        self.instrument_repo.create(instrument).await
    }

    pub async fn get_instrument(&self, id: &str) -> Result<Option<Instrument>> {
        let uuid = Uuid::parse_str(id)
            .map_err(|_| crate::error::AppError::ValidationError("Invalid instrument ID".into()))?;
        self.instrument_repo.get(uuid).await
    }
}
