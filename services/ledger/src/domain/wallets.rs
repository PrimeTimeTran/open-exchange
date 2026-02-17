pub use common::Wallet;
use common::LedgerEntry;
use crate::proto::common;
use crate::error::{Result, AppError};
use crate::domain::transaction::RepositoryTransaction;
use uuid::Uuid;
use chrono::Utc;
use std::sync::Arc;
use std::fmt::Debug;
use serde_json::Value;
use std::str::FromStr;
use rust_decimal::Decimal;
use async_trait::async_trait;
// use sqlx::{Transaction, Postgres}; // Removed to decouple from sqlx


#[async_trait]
pub trait WalletRepository: Send + Sync + Debug {
    async fn create(&self, wallet: Wallet) -> Result<Wallet>;
    async fn get(&self, id: Uuid) -> Result<Option<Wallet>>;
    async fn get_by_account_and_asset(&self, account_id: &str, asset_id: &str) -> Result<Option<Wallet>>;
    async fn get_by_account_and_asset_with_tx(&self, tx: &mut dyn RepositoryTransaction, account_id: &str, asset_id: &str) -> Result<Option<Wallet>>;
    async fn get_by_account_and_asset_for_update(&self, tx: &mut dyn RepositoryTransaction, account_id: &str, asset_id: &str) -> Result<Option<Wallet>>;
    async fn update(&self, wallet: Wallet) -> Result<Wallet>;
    async fn update_with_tx(&self, tx: &mut dyn RepositoryTransaction, wallet: Wallet) -> Result<Wallet>;
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
        let id = Uuid::parse_str(wallet_id).map_err(|_| AppError::ValidationError("Invalid wallet ID".into()))?;
        self.repo.get(id).await
    }

    pub async fn get_wallet_by_account_and_asset(&self, account_id: &str, asset_id: &str) -> Result<Option<Wallet>> {
        self.repo.get_by_account_and_asset(account_id, asset_id).await
    }

    pub async fn get_wallet_by_account_and_asset_with_tx(&self, tx: &mut dyn RepositoryTransaction, account_id: &str, asset_id: &str) -> Result<Option<Wallet>> {
        self.repo.get_by_account_and_asset_with_tx(tx, account_id, asset_id).await
    }

    pub async fn get_wallet_by_account_and_asset_for_update(&self, tx: &mut dyn RepositoryTransaction, account_id: &str, asset_id: &str) -> Result<Option<Wallet>> {
        self.repo.get_by_account_and_asset_for_update(tx, account_id, asset_id).await
    }

    pub async fn update_wallet(&self, wallet: Wallet) -> Result<Wallet> {
        self.repo.update(wallet).await
    }

    pub async fn update_wallet_with_tx(&self, tx: &mut dyn RepositoryTransaction, wallet: Wallet) -> Result<Wallet> {
        self.repo.update_with_tx(tx, wallet).await
    }

    pub async fn delete_wallet(&self, wallet_id: &str) -> Result<()> {
        let id = Uuid::parse_str(wallet_id).map_err(|_| AppError::ValidationError("Invalid wallet ID".into()))?;
        self.repo.delete(id).await
    }

    pub async fn list_wallets(&self, account_id: &str) -> Result<Vec<Wallet>> {
        self.repo.list_by_account(account_id).await
    }

    pub async fn process_ledger_entry(&self, entry: LedgerEntry) -> Result<()> {
        let meta: Value = serde_json::from_str(&entry.meta).map_err(|e| AppError::Internal(format!("Failed to parse ledger entry meta: {}", e)))?;
        let asset = meta["asset"].as_str().ok_or(AppError::ValidationError("Missing asset in ledger entry metadata".into()))?;

        if let Some(mut wallet) = self.get_wallet_by_account_and_asset(&entry.account_id, asset).await? {
            Self::update_wallet_from_entry(&mut wallet, &entry)?;
            self.update_wallet(wallet).await?;
        } else {
            tracing::warn!(account_id = %entry.account_id, asset = %asset, "Wallet not found");
        }
        Ok(())
    }

// ...

    pub async fn process_ledger_entry_with_tx(&self, tx: &mut dyn RepositoryTransaction, entry: LedgerEntry) -> Result<()> {
        let meta: Value = serde_json::from_str(&entry.meta).map_err(|e| AppError::Internal(format!("Failed to parse ledger entry meta: {}", e)))?;
        let asset = meta["asset"].as_str().ok_or(AppError::ValidationError("Missing asset in ledger entry metadata".into()))?;

        if let Some(mut wallet) = self.repo.get_by_account_and_asset_for_update(tx, &entry.account_id, asset).await? {
            Self::update_wallet_from_entry(&mut wallet, &entry)?;
            self.repo.update_with_tx(tx, wallet).await?;
        } else {
            tracing::warn!(account_id = %entry.account_id, asset = %asset, "Wallet not found");
        }
        Ok(())
    }

    fn update_wallet_from_entry(wallet: &mut Wallet, entry: &LedgerEntry) -> Result<()> {
        let meta: Value = serde_json::from_str(&entry.meta).map_err(|e| AppError::Internal(format!("Failed to parse ledger entry meta: {}", e)))?;
        let entry_type = meta["type"].as_str().ok_or(AppError::ValidationError("Missing type in ledger entry metadata".into()))?;
        let entry_amount = Decimal::from_str(&entry.amount).map_err(|_| AppError::ValidationError("Invalid ledger entry amount".into()))?;

        let current_available = Decimal::from_str(&wallet.available).map_err(|_| AppError::Internal("Invalid available balance in wallet".into()))?;
        let current_locked = Decimal::from_str(&wallet.locked).map_err(|_| AppError::Internal("Invalid locked balance in wallet".into()))?;
        let current_total = Decimal::from_str(&wallet.total).map_err(|_| AppError::Internal("Invalid total balance in wallet".into()))?;

        match entry_type {
            "available" => {
                wallet.available = (current_available + entry_amount).to_string();
                wallet.total = (current_total + entry_amount).to_string();
            },
            "locked" => {
                wallet.locked = (current_locked + entry_amount).to_string();
                wallet.total = (current_total + entry_amount).to_string();
            },
            "fee" | "credit" | "revenue" => {
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
        wallet.updated_at = Utc::now().timestamp_millis();
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::infra::repositories::InMemoryWalletRepository;

    #[tokio::test]
    async fn test_create_new_wallet() {
        let repo = Arc::new(InMemoryWalletRepository::new());
        let service = WalletService::new(repo);

        let wallet = service.create_new_wallet("acc-123".to_string(), "BTC".to_string()).await.unwrap();
        assert_eq!(wallet.account_id, "acc-123");
        assert_eq!(wallet.asset_id, "BTC");
        assert_eq!(wallet.available, "0");
        assert_eq!(wallet.locked, "0");
        assert_eq!(wallet.total, "0");
    }

    #[tokio::test]
    async fn test_process_ledger_entry_credit() {
        let repo = Arc::new(InMemoryWalletRepository::new());
        let service = WalletService::new(repo);

        let wallet = service.create_new_wallet("acc-123".to_string(), "BTC".to_string()).await.unwrap();
        
        let entry = LedgerEntry {
            account_id: "acc-123".to_string(),
            amount: "1.5".to_string(),
            meta: serde_json::json!({"asset": "BTC", "type": "credit"}).to_string(),
            ..Default::default()
        };

        service.process_ledger_entry(entry).await.unwrap();

        let updated = service.get_wallet(&wallet.id).await.unwrap().unwrap();
        assert_eq!(updated.available, "1.5");
        assert_eq!(updated.total, "1.5");
        assert_eq!(updated.locked, "0");
    }

    #[tokio::test]
    async fn test_process_ledger_entry_debit_locked() {
        let repo = Arc::new(InMemoryWalletRepository::new());
        let service = WalletService::new(repo);

        let mut wallet = service.create_new_wallet("acc-123".to_string(), "BTC".to_string()).await.unwrap();
        wallet.available = "10.0".to_string();
        wallet.locked = "5.0".to_string();
        wallet.total = "15.0".to_string();
        service.update_wallet(wallet.clone()).await.unwrap();

        let entry = LedgerEntry {
            account_id: "acc-123".to_string(),
            amount: "-2.0".to_string(),
            meta: serde_json::json!({"asset": "BTC", "type": "debit"}).to_string(),
            ..Default::default()
        };

        service.process_ledger_entry(entry).await.unwrap();

        let updated = service.get_wallet(&wallet.id).await.unwrap().unwrap();
        assert_eq!(updated.available, "10.0"); // Unchanged
        assert_eq!(updated.locked, "3.0"); // 5.0 - 2.0
        assert_eq!(updated.total, "13.0"); // 15.0 - 2.0
    }
    
    #[tokio::test]
    async fn test_optimistic_locking() {
        let repo = Arc::new(InMemoryWalletRepository::new());
        let service = WalletService::new(repo);

        let wallet = service.create_new_wallet("acc-concurrent".to_string(), "BTC".to_string()).await.unwrap();
        
        let mut w1 = service.get_wallet(&wallet.id).await.unwrap().unwrap();
        let mut w2 = service.get_wallet(&wallet.id).await.unwrap().unwrap();

        w1.available = "10.0".to_string();
        service.update_wallet(w1).await.unwrap();

        w2.available = "20.0".to_string();
        let result = service.update_wallet(w2).await;
        
        match result {
            Err(AppError::OptimisticLockingError(_)) => assert!(true),
            _ => panic!("Expected OptimisticLockingError, got {:?}", result),
        }
    }
}
