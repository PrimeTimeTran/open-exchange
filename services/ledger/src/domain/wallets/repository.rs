use super::model::Wallet;
use crate::domain::transaction::RepositoryTransaction;
use crate::error::Result;
use async_trait::async_trait;
use std::fmt::Debug;
use uuid::Uuid;

#[async_trait]
pub trait WalletRepository: Send + Sync + Debug {
    async fn create(&self, wallet: Wallet) -> Result<Wallet>;
    async fn get(&self, id: Uuid) -> Result<Option<Wallet>>;
    async fn get_by_account_and_asset(
        &self,
        account_id: &str,
        asset_id: &str,
    ) -> Result<Option<Wallet>>;
    async fn get_by_account_and_asset_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        account_id: &str,
        asset_id: &str,
    ) -> Result<Option<Wallet>>;
    async fn get_by_account_and_asset_for_update(
        &self,
        tx: &mut dyn RepositoryTransaction,
        account_id: &str,
        asset_id: &str,
    ) -> Result<Option<Wallet>>;
    async fn update(&self, wallet: Wallet) -> Result<Wallet>;
    async fn update_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        wallet: Wallet,
    ) -> Result<Wallet>;
    async fn delete(&self, id: Uuid) -> Result<()>;
    async fn list_by_account(&self, account_id: &str) -> Result<Vec<Wallet>>;
    /// List all wallets that hold a given asset (across all accounts). Used by
    /// CorporateActionService for dividends and splits.
    async fn list_by_asset(&self, asset_id: &str) -> Result<Vec<Wallet>>;
}
