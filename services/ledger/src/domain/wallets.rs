use crate::proto::common;
use std::sync::{Arc, Mutex};
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Default, Clone)]
pub struct WalletService {
    wallets: Arc<Mutex<Vec<common::Wallet>>>,
}

impl WalletService {
    pub fn new() -> Self {
        Self {
            wallets: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn create_new_wallet(&self, account_id: String, asset_id: String) -> common::Wallet {
        let wallet = common::Wallet {
            id: Uuid::new_v4().to_string(),
            tenant_id: "default".to_string(),
            user_id: "".to_string(), // In real app, fetch from account
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

        let mut wallets = self.wallets.lock().unwrap();
        wallets.push(wallet.clone());
        wallet
    }

    pub fn create_wallet(&self, wallet: common::Wallet) {
        let mut wallets = self.wallets.lock().unwrap();
        wallets.push(wallet);
    }

    pub fn get_wallet(&self, wallet_id: &str) -> Option<common::Wallet> {
        let wallets = self.wallets.lock().unwrap();
        wallets.iter().find(|x| x.id == wallet_id).cloned()
    }

    pub fn update_wallet(&self, wallet: common::Wallet) -> bool {
        let mut wallets = self.wallets.lock().unwrap();
        if let Some(pos) = wallets.iter().position(|x| x.id == wallet.id) {
            wallets[pos] = wallet;
            true
        } else {
            false
        }
    }

    pub fn delete_wallet(&self, wallet_id: &str) -> bool {
        let mut wallets = self.wallets.lock().unwrap();
        if let Some(pos) = wallets.iter().position(|x| x.id == wallet_id) {
            wallets.remove(pos);
            true
        } else {
            false
        }
    }

    pub fn list_wallets(&self, user_id: &str) -> Vec<common::Wallet> {
        let wallets = self.wallets.lock().unwrap();
        if user_id.is_empty() {
            wallets.clone()
        } else {
            wallets.iter().filter(|x| x.user_id == user_id).cloned().collect()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

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
        
        let wallets = service.wallets.lock().unwrap();
        assert_eq!(wallets.len(), 2);
    }
}
