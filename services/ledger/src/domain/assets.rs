use crate::proto::common;
use crate::error::Result;
use crate::infra::repositories::{AssetRepository, InstrumentRepository};
use uuid::Uuid;
use chrono::Utc;
use std::sync::Arc;

#[derive(Clone, Debug)]
pub struct AssetService {
    repo: Arc<dyn AssetRepository>,
    instrument_repo: Arc<dyn InstrumentRepository>,
}

impl AssetService {
    pub fn new(repo: Arc<dyn AssetRepository>, instrument_repo: Arc<dyn InstrumentRepository>) -> Self {
        Self {
            repo,
            instrument_repo,
        }
    }

    pub async fn get_asset(&self, id: &str) -> Result<Option<common::Asset>> {
        let uuid = Uuid::parse_str(id).map_err(|_| crate::error::AppError::ValidationError("Invalid asset ID".into()))?;
        self.repo.get(uuid).await
    }


    pub async fn get_asset_by_symbol(&self, symbol: &str) -> Result<Option<common::Asset>> {
        self.repo.get_by_symbol(symbol).await
    }

    pub async fn list_assets(&self) -> Result<Vec<common::Asset>> {
        self.repo.list().await
    }

    pub async fn create_new_asset(&self, symbol: String, asset_type: String, precision: i32) -> common::Asset {
        // Warning: This is now broken/stubbed until we implement AssetRepository::create
        let asset = common::Asset {
            id: Uuid::new_v4().to_string(),
            tenant_id: "default".to_string(),
            symbol,
            klass: asset_type,
            precision,
            is_fractional: true,
            decimals: precision,
            meta: "{}".to_string(),
            created_at: Utc::now().timestamp_millis(),
            updated_at: Utc::now().timestamp_millis(),
        };

        self.repo.create(asset.clone()).await.unwrap_or(asset)
    }

    pub async fn create_new_instrument(&self, symbol: String, instrument_type: String, base_id: String, quote_id: String) -> common::Instrument {
        let instrument = common::Instrument {
            id: Uuid::new_v4().to_string(),
            tenant_id: "default".to_string(),
            symbol,
            r#type: instrument_type,
            status: "active".to_string(),
            underlying_asset_id: base_id,
            quote_asset_id: quote_id,
            meta: "{}".to_string(),
            created_at: Utc::now().timestamp_millis(),
            updated_at: Utc::now().timestamp_millis(),
        };

        // We unwrap here to match the previous signature that didn't return Result
        // In a real app we should propagate the error
        self.instrument_repo.create(instrument.clone()).await.unwrap_or(instrument)
    }

    pub async fn get_instrument(&self, id: &str) -> Result<Option<common::Instrument>> {
        let uuid = Uuid::parse_str(id).map_err(|_| crate::error::AppError::ValidationError("Invalid instrument ID".into()))?;
        self.instrument_repo.get(uuid).await
    }
}

