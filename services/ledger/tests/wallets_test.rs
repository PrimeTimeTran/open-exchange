#[cfg(test)]
mod tests {
    use ledger::domain::wallets::WalletService;
    use ledger::infra::repositories::InMemoryWalletRepository;
    use rust_decimal::Decimal;
    use std::str::FromStr;
    use std::sync::Arc;
    use uuid::Uuid;

    /// Test: Create and Get Wallet
    ///
    /// Verifies that a new wallet can be created for an account/asset pair
    /// and subsequently retrieved by its ID.
    #[tokio::test]
    async fn test_create_and_get_wallet() {
        let repo = Arc::new(InMemoryWalletRepository::new());
        let service = WalletService::new(repo);
        let account_id = Uuid::new_v4().to_string();
        let asset_id = Uuid::new_v4().to_string();
        let tenant_id = Uuid::new_v4();

        let new_wallet = service
            .create_new_wallet(tenant_id, account_id.clone(), asset_id.clone())
            .await
            .unwrap();

        assert_eq!(new_wallet.account_id, Uuid::parse_str(&account_id).unwrap());
        assert_eq!(new_wallet.asset_id, Uuid::parse_str(&asset_id).unwrap());
        assert_eq!(new_wallet.available, Decimal::ZERO);

        let fetched_wallet = service
            .get_wallet(&new_wallet.id.to_string())
            .await
            .unwrap();
        assert!(fetched_wallet.is_some());
        assert_eq!(fetched_wallet.unwrap().id, new_wallet.id);
    }

    /// Test: Update Wallet Balance
    ///
    /// Verifies that changes to a wallet's balance (available, locked, etc.)
    /// are correctly persisted to the repository.
    #[tokio::test]
    async fn test_update_wallet() {
        let repo = Arc::new(InMemoryWalletRepository::new());
        let service = WalletService::new(repo);
        let account_id = Uuid::new_v4().to_string();
        let asset_id = Uuid::new_v4().to_string();
        let tenant_id = Uuid::new_v4();

        let mut wallet = service
            .create_new_wallet(tenant_id, account_id, asset_id)
            .await
            .unwrap();

        assert_eq!(wallet.available, Decimal::ZERO);

        wallet.available = Decimal::from_str("100").unwrap();
        let updated = service.update_wallet(wallet.clone()).await.unwrap();

        assert_eq!(updated.available, Decimal::from_str("100").unwrap());

        let fetched = service
            .get_wallet(&wallet.id.to_string())
            .await
            .unwrap()
            .unwrap();
        assert_eq!(fetched.available, Decimal::from_str("100").unwrap());
    }

    /// Test: Concurrent Wallet Creation
    ///
    /// Verifies that multiple wallets can be created concurrently for different accounts
    /// without interference or race conditions in the repository.
    #[tokio::test]
    async fn test_concurrent_access() {
        let repo = Arc::new(InMemoryWalletRepository::new());
        let service = WalletService::new(repo);
        let service_clone = service.clone();

        let account_thread = Uuid::new_v4().to_string();
        let asset_thread = Uuid::new_v4().to_string();

        let account_main = Uuid::new_v4().to_string();
        let asset_main = Uuid::new_v4().to_string();

        let account_thread_clone = account_thread.clone();
        let asset_thread_clone = asset_thread.clone();

        let handle = tokio::spawn(async move {
            service_clone
                .create_new_wallet(Uuid::new_v4(), account_thread_clone, asset_thread_clone)
                .await
                .unwrap();
        });

        service
            .create_new_wallet(Uuid::new_v4(), account_main.clone(), asset_main.clone())
            .await
            .unwrap();
        handle.await.unwrap();

        // Check that both wallets were created
        let wallets_thread = service.list_wallets(&account_thread).await.unwrap();
        assert_eq!(wallets_thread.len(), 1);

        let wallets_main = service.list_wallets(&account_main).await.unwrap();
        assert_eq!(wallets_main.len(), 1);
    }
}
