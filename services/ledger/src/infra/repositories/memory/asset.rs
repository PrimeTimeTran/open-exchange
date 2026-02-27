use crate::domain::assets::model::Asset;
use crate::error::{AppError, Result};
use crate::infra::repositories::AssetRepository;
use async_trait::async_trait;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Clone, Default, Debug)]
pub struct InMemoryAssetRepository {
    assets: Arc<Mutex<Vec<Asset>>>,
}

impl InMemoryAssetRepository {
    pub fn new() -> Self {
        Self {
            assets: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn add(&self, asset: Asset) -> Result<()> {
        let mut assets = self
            .assets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        assets.push(asset);
        Ok(())
    }
}

#[async_trait]
impl AssetRepository for InMemoryAssetRepository {
    async fn create(&self, asset: Asset) -> Result<Asset> {
        let mut assets = self
            .assets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        assets.push(asset.clone());
        Ok(asset)
    }

    async fn get(&self, id: Uuid) -> Result<Option<Asset>> {
        let assets = self
            .assets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(assets.iter().find(|a| a.id == id).cloned())
    }

    async fn get_by_symbol(&self, symbol: &str) -> Result<Option<Asset>> {
        let assets = self
            .assets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(assets.iter().find(|a| a.symbol == symbol).cloned())
    }

    async fn list(&self) -> Result<Vec<Asset>> {
        let assets = self
            .assets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(assets.clone())
    }
}
