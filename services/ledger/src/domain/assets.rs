use crate::proto::common;
use std::sync::{Arc, Mutex};
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Default, Clone)]
pub struct AssetService {
    assets: Arc<Mutex<Vec<common::Asset>>>,
    instruments: Arc<Mutex<Vec<common::Instrument>>>,
}

impl AssetService {
    pub fn new() -> Self {
        Self {
            assets: Arc::new(Mutex::new(Vec::new())),
            instruments: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn create_new_asset(&self, symbol: String, asset_type: String, precision: i32) -> common::Asset {
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

        let mut assets = self.assets.lock().unwrap();
        assets.push(asset.clone());
        asset
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

        let mut instruments = self.instruments.lock().unwrap();
        instruments.push(instrument.clone());
        instrument
    }

    pub fn create_asset(&self, asset: common::Asset) {
        let mut assets = self.assets.lock().unwrap();
        assets.push(asset);
    }

    pub fn create_instrument(&self, instrument: common::Instrument) {
        let mut instruments = self.instruments.lock().unwrap();
        instruments.push(instrument);
    }
    
    // Add getters if needed
}
