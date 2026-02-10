use crate::proto::common;
use std::sync::{Arc, Mutex};
use uuid::Uuid;
use chrono::Utc;
use crate::infra::repositories::AssetRepository;
use crate::error::Result;

#[derive(Clone, Debug)]
pub struct AssetService {
    repo: Arc<dyn AssetRepository>,
    instruments: Arc<Mutex<Vec<common::Instrument>>>,
}

impl AssetService {
    pub fn new(repo: Arc<dyn AssetRepository>) -> Self {
        Self {
            repo,
            instruments: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub async fn get_asset(&self, id: &str) -> Result<Option<common::Asset>> {
        let uuid = Uuid::parse_str(id).unwrap_or_default(); // TODO: handle error
        self.repo.get(uuid).await
    }

    pub async fn get_asset_by_symbol(&self, symbol: &str) -> Result<Option<common::Asset>> {
        self.repo.get_by_symbol(symbol).await
    }

    pub async fn list_assets(&self) -> Result<Vec<common::Asset>> {
        self.repo.list().await
    }

    pub fn create_new_asset(&self, symbol: String, asset_type: String, precision: i32) -> common::Asset {
        // Warning: This is now broken/stubbed until we implement AssetRepository::create
        common::Asset {
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
        }
    }

    pub fn create_new_instrument(&self, symbol: String, instrument_type: String, base_id: String, quote_id: String) -> common::Instrument {
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

        self.instruments.lock().unwrap().push(instrument.clone());
        instrument
    }

    pub fn get_instrument(&self, id: &str) -> Option<common::Instrument> {
        let instruments = self.instruments.lock().unwrap();
        instruments.iter().find(|i| i.id == id).cloned()
    }
}

