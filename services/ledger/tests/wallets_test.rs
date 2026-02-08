#[cfg(test)]
mod tests {
    use ledger::domain::wallets::WalletService;

    #[test]
    fn test_create_and_get_wallet() {
        let service = WalletService::new();
        let account_id = "acc-123".to_string();
        let asset_id = "USD".to_string();

        let new_wallet = service.create_new_wallet(account_id.clone(), asset_id.clone());
        
        assert_eq!(new_wallet.account_id, account_id);
        assert_eq!(new_wallet.asset_id, asset_id);
        assert_eq!(new_wallet.available, "0");

        let fetched_wallet = service.get_wallet(&new_wallet.id);
        assert!(fetched_wallet.is_some());
        assert_eq!(fetched_wallet.unwrap().id, new_wallet.id);
    }

    #[test]
    fn test_update_wallet() {
        let service = WalletService::new();
        let mut wallet = service.create_new_wallet("acc-1".to_string(), "BTC".to_string());
        
        assert_eq!(wallet.available, "0");
        
        wallet.available = "100".to_string();
        let updated = service.update_wallet(wallet.clone());
        
        assert!(updated);
        
        let fetched = service.get_wallet(&wallet.id).unwrap();
        assert_eq!(fetched.available, "100");
    }

    #[test]
    fn test_concurrent_access() {
        let service = WalletService::new();
        let service_clone = service.clone();
        
        let handle = std::thread::spawn(move || {
            service_clone.create_new_wallet("acc-thread".to_string(), "ETH".to_string());
        });
        
        service.create_new_wallet("acc-main".to_string(), "ETH".to_string());
        handle.join().unwrap();
        
        // This test relies on internal implementation details (accessing .wallets)
        // If we move tests out, we can't easily access private fields.
        // We should test public behavior instead, like list_wallets.
        
        let wallets = service.list_wallets("");
        // list_wallets filters by user_id if provided, but here we provide empty string
        // The implementation says: if user_id.is_empty() { wallets.clone() }
        // Wait, list_wallets logic:
        // if user_id.is_empty() { accounts.clone() }
        // The implementation in wallets.rs:
        // if user_id.is_empty() { wallets.clone() }
        
        // However, the created wallets have empty user_id.
        // So list_wallets("") returns all.
        
        assert_eq!(wallets.len(), 2);
    }
}
