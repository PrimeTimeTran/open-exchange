use crate::domain::transaction::RepositoryTransaction;
use crate::domain::wallets::{Wallet, WalletRepository};
use crate::error::{AppError, Result};
use async_trait::async_trait;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Clone, Default, Debug)]
pub struct InMemoryWalletRepository {
    wallets: Arc<Mutex<Vec<Wallet>>>,
}

impl InMemoryWalletRepository {
    pub fn new() -> Self {
        Self {
            wallets: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn add(&self, wallet: Wallet) -> Result<()> {
        let mut wallets = self
            .wallets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        wallets.push(wallet);
        Ok(())
    }
}

#[async_trait]
impl WalletRepository for InMemoryWalletRepository {
    async fn create(&self, wallet: Wallet) -> Result<Wallet> {
        let mut wallets = self
            .wallets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;

        // Check for duplicate
        if wallets
            .iter()
            .any(|w| w.account_id == wallet.account_id && w.asset_id == wallet.asset_id)
        {
            return Err(AppError::ValidationError(
                "Wallet already exists for this account and asset".into(),
            ));
        }

        wallets.push(wallet.clone());
        Ok(wallet)
    }

    async fn get(&self, id: Uuid) -> Result<Option<Wallet>> {
        let wallets = self
            .wallets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(wallets.iter().find(|w| w.id == id).cloned())
    }

    async fn get_by_account_and_asset(
        &self,
        account_id: &str,
        asset_id: &str,
    ) -> Result<Option<Wallet>> {
        let acc_uuid = Uuid::parse_str(account_id).map_err(|_| {
            AppError::ValidationError(format!("Invalid account ID: {}", account_id))
        })?;
        let asset_uuid = Uuid::parse_str(asset_id)
            .map_err(|_| AppError::ValidationError(format!("Invalid asset ID: {}", asset_id)))?;

        let wallets = self
            .wallets
            .lock()
            .map_err(|_| AppError::Internal("Failed to lock wallets".into()))?;
        Ok(wallets
            .iter()
            .find(|w| w.account_id == acc_uuid && w.asset_id == asset_uuid)
            .cloned())
    }

    async fn get_by_account_and_asset_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        account_id: &str,
        asset_id: &str,
    ) -> Result<Option<Wallet>> {
        self.get_by_account_and_asset(account_id, asset_id).await
    }

    async fn get_by_account_and_asset_for_update(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        account_id: &str,
        asset_id: &str,
    ) -> Result<Option<Wallet>> {
        self.get_by_account_and_asset(account_id, asset_id).await
    }

    async fn update(&self, mut wallet: Wallet) -> Result<Wallet> {
        let mut wallets = self
            .wallets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        if let Some(pos) = wallets.iter().position(|w| w.id == wallet.id) {
            let existing = &wallets[pos];
            if existing.version != wallet.version {
                return Err(AppError::OptimisticLockingError(format!(
                    "Wallet {} version mismatch (expected {}, found {})",
                    wallet.id, wallet.version, existing.version
                )));
            }
            wallet.version += 1;
            wallet.updated_at = chrono::Utc::now();
            wallets[pos] = wallet.clone();
            Ok(wallet)
        } else {
            Err(AppError::NotFound(format!(
                "Wallet {} not found",
                wallet.id
            )))
        }
    }

    async fn update_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        wallet: Wallet,
    ) -> Result<Wallet> {
        self.update(wallet).await
    }

    async fn delete(&self, id: Uuid) -> Result<()> {
        let mut wallets = self
            .wallets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        if let Some(pos) = wallets.iter().position(|w| w.id == id) {
            wallets.remove(pos);
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Wallet {} not found", id)))
        }
    }

    async fn list_by_account(&self, account_id: &str) -> Result<Vec<Wallet>> {
        let acc_uuid = Uuid::parse_str(account_id).map_err(|_| {
            AppError::ValidationError(format!("Invalid account ID: {}", account_id))
        })?;
        let wallets = self
            .wallets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(wallets
            .iter()
            .filter(|w| w.account_id == acc_uuid)
            .cloned()
            .collect())
    }

    async fn list_by_asset(&self, asset_id: &str) -> Result<Vec<Wallet>> {
        let asset_uuid = Uuid::parse_str(asset_id)
            .map_err(|_| AppError::ValidationError(format!("Invalid asset ID: {}", asset_id)))?;
        let wallets = self
            .wallets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(wallets
            .iter()
            .filter(|w| w.asset_id == asset_uuid)
            .cloned()
            .collect())
    }
}
