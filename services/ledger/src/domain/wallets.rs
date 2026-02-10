use crate::proto::common;
pub use common::Wallet;
use std::sync::Arc;
use uuid::Uuid;
use chrono::Utc;
use async_trait::async_trait;
use crate::error::Result;

use std::fmt::Debug;

#[async_trait]
pub trait WalletRepository: Send + Sync + Debug {
    async fn create(&self, wallet: Wallet) -> Result<Wallet>;
    async fn get(&self, id: Uuid) -> Result<Option<Wallet>>;
    async fn get_by_account_and_asset(&self, account_id: &str, asset_id: &str) -> Result<Option<Wallet>>;
    async fn update(&self, wallet: Wallet) -> Result<Wallet>;
    async fn delete(&self, id: Uuid) -> Result<()>;
    async fn list_by_account(&self, account_id: &str) -> Result<Vec<Wallet>>;
}

#[derive(Debug, Clone)]
pub struct WalletService {
    repo: Arc<dyn WalletRepository>,
}

impl WalletService {
    pub fn new(repo: Arc<dyn WalletRepository>) -> Self {
        Self { repo }
    }

    pub async fn create_new_wallet(&self, account_id: String, asset_id: String) -> Result<Wallet> {
        let wallet = Wallet {
            id: Uuid::new_v4().to_string(),
            tenant_id: "default".to_string(),
            user_id: "".to_string(),
            account_id,
            asset_id,
            available: "0".to_string(),
            locked: "0".to_string(),
            total: "0".to_string(),
            version: 1,
            status: "active".to_string(),
            meta: "{}".to_string(),
            created_at: Utc::now().timestamp_millis(),
            updated_at: Utc::now().timestamp_millis(),
        };

        self.repo.create(wallet).await
    }

    pub async fn create_wallet(&self, wallet: Wallet) -> Result<Wallet> {
        self.repo.create(wallet).await
    }

    pub async fn get_wallet(&self, wallet_id: &str) -> Result<Option<Wallet>> {
        let id = Uuid::parse_str(wallet_id).unwrap_or_default(); // Should handle error better
        self.repo.get(id).await
    }

    pub async fn get_wallet_by_account_and_asset(&self, account_id: &str, asset_id: &str) -> Result<Option<Wallet>> {
        self.repo.get_by_account_and_asset(account_id, asset_id).await
    }

    pub async fn update_wallet(&self, wallet: Wallet) -> Result<Wallet> {
        self.repo.update(wallet).await
    }

    pub async fn delete_wallet(&self, wallet_id: &str) -> Result<()> {
        let id = Uuid::parse_str(wallet_id).unwrap_or_default();
        self.repo.delete(id).await
    }

    pub async fn list_wallets(&self, account_id: &str) -> Result<Vec<Wallet>> {
        self.repo.list_by_account(account_id).await
    }
}
