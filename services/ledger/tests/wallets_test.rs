#[cfg(test)]
mod tests {
    use ledger::domain::wallets::WalletService;
    use ledger::infra::repositories::InMemoryWalletRepository;
    use std::sync::Arc;

    #[tokio::test]
    async fn test_create_and_get_wallet() {
        let repo = Arc::new(InMemoryWalletRepository::new());
        let service = WalletService::new(repo);
        let account_id = "acc-123".to_string();
        let asset_id = "USD".to_string();

        let new_wallet = service.create_new_wallet(account_id.clone(), asset_id.clone()).await.unwrap();
        
        assert_eq!(new_wallet.account_id, account_id);
        assert_eq!(new_wallet.asset_id, asset_id);
        assert_eq!(new_wallet.available, "0");

        let fetched_wallet = service.get_wallet(&new_wallet.id).await.unwrap();
        assert!(fetched_wallet.is_some());
        assert_eq!(fetched_wallet.unwrap().id, new_wallet.id);
    }

    #[tokio::test]
    async fn test_update_wallet() {
        let repo = Arc::new(InMemoryWalletRepository::new());
        let service = WalletService::new(repo);
        let mut wallet = service.create_new_wallet("acc-1".to_string(), "BTC".to_string()).await.unwrap();
        
        assert_eq!(wallet.available, "0");
        
        wallet.available = "100".to_string();
        let updated = service.update_wallet(wallet.clone()).await.unwrap();
        
        assert_eq!(updated.available, "100");
        
        let fetched = service.get_wallet(&wallet.id).await.unwrap().unwrap();
        assert_eq!(fetched.available, "100");
    }

    #[tokio::test]
    async fn test_concurrent_access() {
        let repo = Arc::new(InMemoryWalletRepository::new());
        let service = WalletService::new(repo);
        let service_clone = service.clone();
        
        let handle = tokio::spawn(async move {
            service_clone.create_new_wallet("acc-thread".to_string(), "ETH".to_string()).await.unwrap();
        });
        
        service.create_new_wallet("acc-main".to_string(), "ETH".to_string()).await.unwrap();
        handle.await.unwrap();
        
        // Check that both wallets were created
        let wallets_thread = service.list_wallets("acc-thread").await.unwrap();
        assert_eq!(wallets_thread.len(), 1);

        let wallets_main = service.list_wallets("acc-main").await.unwrap();
        assert_eq!(wallets_main.len(), 1);
    }
}
