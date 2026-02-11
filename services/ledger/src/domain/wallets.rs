use crate::proto::common;
pub use common::Wallet;
use common::LedgerEntry;
use std::sync::Arc;
use uuid::Uuid;
use chrono::Utc;
use async_trait::async_trait;
use crate::error::Result;
use serde_json::Value;
use rust_decimal::Decimal;
use std::str::FromStr;
use sqlx::{Transaction, Postgres};
use crate::error::AppError;

use std::fmt::Debug;

#[async_trait]
pub trait WalletRepository: Send + Sync + Debug {
    async fn create(&self, wallet: Wallet) -> Result<Wallet>;
    async fn get(&self, id: Uuid) -> Result<Option<Wallet>>;
    async fn get_by_account_and_asset(&self, account_id: &str, asset_id: &str) -> Result<Option<Wallet>>;
    async fn get_by_account_and_asset_with_tx(&self, tx: &mut Transaction<'_, Postgres>, account_id: &str, asset_id: &str) -> Result<Option<Wallet>>;
    async fn update(&self, wallet: Wallet) -> Result<Wallet>;
    async fn update_with_tx(&self, tx: &mut Transaction<'_, Postgres>, wallet: Wallet) -> Result<Wallet>;
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

    pub async fn process_ledger_entry(&self, entry: LedgerEntry) -> Result<()> {
        let meta: Value = serde_json::from_str(&entry.meta).unwrap_or(serde_json::json!({}));
        let asset = meta["asset"].as_str().unwrap_or("USD");
        let entry_type = meta["type"].as_str().unwrap_or("unknown");

        if let Some(mut wallet) = self.get_wallet_by_account_and_asset(&entry.account_id, asset).await? {
            let entry_amount = Decimal::from_str(&entry.amount).map_err(|_| AppError::ValidationError("Invalid ledger entry amount".into()))?;
            let current_available = Decimal::from_str(&wallet.available).unwrap_or(Decimal::ZERO);
            let current_locked = Decimal::from_str(&wallet.locked).unwrap_or(Decimal::ZERO);
            let current_total = Decimal::from_str(&wallet.total).unwrap_or(Decimal::ZERO);

            match entry_type {
                "available" => {
                    wallet.available = (current_available + entry_amount).to_string();
                    wallet.total = (current_total + entry_amount).to_string();
                },
                "locked" => {
                    wallet.locked = (current_locked + entry_amount).to_string();
                    wallet.total = (current_total + entry_amount).to_string();
                },
                "fee" => {
                    wallet.available = (current_available + entry_amount).to_string();
                    wallet.total = (current_total + entry_amount).to_string();
                },
                "credit" | "revenue" => {
                    wallet.available = (current_available + entry_amount).to_string();
                    wallet.total = (current_total + entry_amount).to_string();
                },
                "debit" => {
                    wallet.locked = (current_locked + entry_amount).to_string();
                    wallet.total = (current_total + entry_amount).to_string();
                },
                _ => {
                     // Legacy/Default Fallback
                    if entry_amount < Decimal::ZERO {
                         // Default to debiting locked
                         wallet.locked = (current_locked + entry_amount).to_string();
                         wallet.total = (current_total + entry_amount).to_string();
                    } else {
                         // Default to crediting available
                         wallet.available = (current_available + entry_amount).to_string();
                         wallet.total = (current_total + entry_amount).to_string();
                    }
                }
            }

            self.update_wallet(wallet).await?;
        } else {
            log::warn!("Wallet not found for account {} asset {}", entry.account_id, asset);
        }
        Ok(())
    }
}
