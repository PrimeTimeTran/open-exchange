use super::model::Wallet;
use super::repository::WalletRepository;
use crate::domain::ledger::model::LedgerEntry;
use crate::domain::transaction::RepositoryTransaction;
use crate::error::{AppError, Result};
use chrono::Utc;
use rust_decimal::Decimal;
use std::sync::Arc;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct WalletService {
    repo: Arc<dyn WalletRepository>,
}

impl WalletService {
    pub fn new(repo: Arc<dyn WalletRepository>) -> Self {
        Self { repo }
    }

    pub async fn create_new_wallet(&self, account_id: String, asset_id: String) -> Result<Wallet> {
        let account_uuid = Uuid::parse_str(&account_id)
            .map_err(|_| AppError::ValidationError("Invalid account_id".into()))?;
        let asset_uuid = Uuid::parse_str(&asset_id)
            .map_err(|_| AppError::ValidationError("Invalid asset_id".into()))?;

        let wallet = Wallet {
            id: Uuid::new_v4(),
            tenant_id: Uuid::nil(), // Placeholder, logic may need adjustment
            user_id: "".to_string(),
            account_id: account_uuid,
            asset_id: asset_uuid,
            available: Decimal::ZERO,
            locked: Decimal::ZERO,
            total: Decimal::ZERO,
            version: 1,
            status: "active".to_string(),
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        self.repo.create(wallet).await
    }

    pub async fn create_wallet(&self, wallet: Wallet) -> Result<Wallet> {
        self.repo.create(wallet).await
    }

    pub async fn get_wallet(&self, wallet_id: &str) -> Result<Option<Wallet>> {
        let id = Uuid::parse_str(wallet_id)
            .map_err(|_| AppError::ValidationError("Invalid wallet ID".into()))?;
        self.repo.get(id).await
    }

    pub async fn get_wallet_by_account_and_asset(
        &self,
        account_id: &str,
        asset_id: &str,
    ) -> Result<Option<Wallet>> {
        self.repo
            .get_by_account_and_asset(account_id, asset_id)
            .await
    }

    pub async fn get_wallet_by_account_and_asset_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        account_id: &str,
        asset_id: &str,
    ) -> Result<Option<Wallet>> {
        self.repo
            .get_by_account_and_asset_with_tx(tx, account_id, asset_id)
            .await
    }

    pub async fn get_wallet_by_account_and_asset_for_update(
        &self,
        tx: &mut dyn RepositoryTransaction,
        account_id: &str,
        asset_id: &str,
    ) -> Result<Option<Wallet>> {
        self.repo
            .get_by_account_and_asset_for_update(tx, account_id, asset_id)
            .await
    }

    pub async fn update_wallet(&self, wallet: Wallet) -> Result<Wallet> {
        self.repo.update(wallet).await
    }

    pub async fn update_wallet_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        wallet: Wallet,
    ) -> Result<Wallet> {
        self.repo.update_with_tx(tx, wallet).await
    }

    pub async fn delete_wallet(&self, wallet_id: &str) -> Result<()> {
        let id = Uuid::parse_str(wallet_id)
            .map_err(|_| AppError::ValidationError("Invalid wallet ID".into()))?;
        self.repo.delete(id).await
    }

    pub async fn list_wallets(&self, account_id: &str) -> Result<Vec<Wallet>> {
        self.repo.list_by_account(account_id).await
    }

    pub async fn list_wallets_by_asset(&self, asset_id: &str) -> Result<Vec<Wallet>> {
        self.repo.list_by_asset(asset_id).await
    }

    pub async fn process_ledger_entry(&self, entry: LedgerEntry) -> Result<()> {
        let meta = &entry.meta;
        let asset = meta["asset"].as_str().ok_or(AppError::ValidationError(
            "Missing asset in ledger entry metadata".into(),
        ))?;

        if let Some(mut wallet) = self
            .get_wallet_by_account_and_asset(&entry.account_id.to_string(), asset)
            .await?
        {
            Self::update_wallet_from_entry(&mut wallet, &entry)?;
            self.update_wallet(wallet).await?;
        } else {
            tracing::warn!(account_id = %entry.account_id, asset = %asset, "Wallet not found");
        }
        Ok(())
    }

    pub async fn process_ledger_entry_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        entry: LedgerEntry,
    ) -> Result<()> {
        let meta = &entry.meta;
        let asset = meta["asset"].as_str().ok_or(AppError::ValidationError(
            "Missing asset in ledger entry metadata".into(),
        ))?;

        if let Some(mut wallet) = self
            .repo
            .get_by_account_and_asset_for_update(tx, &entry.account_id.to_string(), asset)
            .await?
        {
            Self::update_wallet_from_entry(&mut wallet, &entry)?;
            self.repo.update_with_tx(tx, wallet).await?;
        } else {
            tracing::warn!(account_id = %entry.account_id, asset = %asset, "Wallet not found");
        }
        Ok(())
    }

    fn update_wallet_from_entry(wallet: &mut Wallet, entry: &LedgerEntry) -> Result<()> {
        let meta = &entry.meta;
        let entry_type = meta["type"].as_str().ok_or(AppError::ValidationError(
            "Missing type in ledger entry metadata".into(),
        ))?;
        let entry_amount = entry.amount;

        match entry_type {
            "available" => {
                wallet.available += entry_amount;
                wallet.total += entry_amount;
            }
            "locked" => {
                wallet.locked += entry_amount;
                wallet.total += entry_amount;
            }
            "fee" | "credit" | "revenue" => {
                wallet.available += entry_amount;
                wallet.total += entry_amount;
            }
            "debit" => {
                wallet.locked += entry_amount;
                wallet.total += entry_amount;
            }
            _ => {
                // Legacy/Default Fallback
                if entry_amount < Decimal::ZERO {
                    // Default to debiting locked
                    wallet.locked += entry_amount;
                    wallet.total += entry_amount;
                } else {
                    // Default to crediting available
                    wallet.available += entry_amount;
                    wallet.total += entry_amount;
                }
            }
        }
        wallet.updated_at = Utc::now();
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::infra::repositories::InMemoryWalletRepository;
    use std::str::FromStr;

    #[tokio::test]
    async fn test_create_new_wallet() {
        let repo = Arc::new(InMemoryWalletRepository::new());
        let service = WalletService::new(repo);

        let wallet = service
            .create_new_wallet(Uuid::new_v4().to_string(), Uuid::new_v4().to_string())
            .await
            .expect("Failed to create new wallet");
        // Since we refactored, wallet types are Decimal and Uuid
        assert_eq!(wallet.available, Decimal::ZERO);
        assert_eq!(wallet.locked, Decimal::ZERO);
        assert_eq!(wallet.total, Decimal::ZERO);
    }

    #[tokio::test]
    async fn test_process_ledger_entry_credit() {
        let repo = Arc::new(InMemoryWalletRepository::new());
        let service = WalletService::new(repo);

        let account_id = Uuid::new_v4();
        let asset_id = Uuid::new_v4();
        let wallet = service
            .create_new_wallet(account_id.to_string(), asset_id.to_string())
            .await
            .expect("Failed to create wallet");

        let entry = LedgerEntry {
            id: Uuid::new_v4(),
            tenant_id: Uuid::new_v4(),
            event_id: Uuid::new_v4(),
            account_id,
            amount: Decimal::from_str("1.5").expect("Invalid decimal"),
            meta: serde_json::json!({"asset": asset_id.to_string(), "type": "credit"}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        service
            .process_ledger_entry(entry)
            .await
            .expect("Failed to process ledger entry");

        let updated = service
            .get_wallet(&wallet.id.to_string())
            .await
            .expect("Failed to get wallet")
            .expect("Wallet not found");
        assert_eq!(
            updated.available,
            Decimal::from_str("1.5").expect("Invalid decimal")
        );
        assert_eq!(
            updated.total,
            Decimal::from_str("1.5").expect("Invalid decimal")
        );
        assert_eq!(updated.locked, Decimal::ZERO);
    }

    #[tokio::test]
    async fn test_process_ledger_entry_debit_locked() {
        let repo = Arc::new(InMemoryWalletRepository::new());
        let service = WalletService::new(repo);

        let account_id = Uuid::new_v4();
        let asset_id = Uuid::new_v4();
        let mut wallet = service
            .create_new_wallet(account_id.to_string(), asset_id.to_string())
            .await
            .expect("Failed to create wallet");
        wallet.available = Decimal::from_str("10.0").expect("Invalid decimal");
        wallet.locked = Decimal::from_str("5.0").expect("Invalid decimal");
        wallet.total = Decimal::from_str("15.0").expect("Invalid decimal");
        service
            .update_wallet(wallet.clone())
            .await
            .expect("Failed to update wallet");

        let entry = LedgerEntry {
            id: Uuid::new_v4(),
            tenant_id: Uuid::new_v4(),
            event_id: Uuid::new_v4(),
            account_id,
            amount: Decimal::from_str("-2.0").expect("Invalid decimal"),
            meta: serde_json::json!({"asset": asset_id.to_string(), "type": "debit"}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        service
            .process_ledger_entry(entry)
            .await
            .expect("Failed to process ledger entry");

        let updated = service
            .get_wallet(&wallet.id.to_string())
            .await
            .expect("Failed to get wallet")
            .expect("Wallet not found");
        assert_eq!(
            updated.available,
            Decimal::from_str("10.0").expect("Invalid decimal")
        ); // Unchanged
        assert_eq!(
            updated.locked,
            Decimal::from_str("3.0").expect("Invalid decimal")
        ); // 5.0 - 2.0
        assert_eq!(
            updated.total,
            Decimal::from_str("13.0").expect("Invalid decimal")
        ); // 15.0 - 2.0
    }

    #[tokio::test]
    async fn test_optimistic_locking() {
        let repo = Arc::new(InMemoryWalletRepository::new());
        let service = WalletService::new(repo);

        let wallet = service
            .create_new_wallet(Uuid::new_v4().to_string(), Uuid::new_v4().to_string())
            .await
            .expect("Failed to create wallet");

        let mut w1 = service
            .get_wallet(&wallet.id.to_string())
            .await
            .expect("Failed to get wallet")
            .expect("Wallet not found");
        let mut w2 = service
            .get_wallet(&wallet.id.to_string())
            .await
            .expect("Failed to get wallet")
            .expect("Wallet not found");

        w1.available = Decimal::from_str("10.0").expect("Invalid decimal");
        service
            .update_wallet(w1)
            .await
            .expect("Failed to update wallet");

        w2.available = Decimal::from_str("20.0").expect("Invalid decimal");
        let result = service.update_wallet(w2).await;

        match result {
            Err(AppError::OptimisticLockingError(_)) => assert!(true),
            _ => panic!("Expected OptimisticLockingError, got {:?}", result),
        }
    }
}
