use crate::proto::common;
use std::sync::{Arc, Mutex};
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Default, Clone)]
pub struct AccountService {
    accounts: Arc<Mutex<Vec<common::Account>>>,
}

impl AccountService {
    pub fn new() -> Self {
        Self {
            accounts: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn create_new_account(&self, user_id: String, account_type: String) -> common::Account {
        let account = common::Account {
            id: Uuid::new_v4().to_string(),
            tenant_id: "default".to_string(),
            user_id,
            r#type: account_type,
            status: "active".to_string(),
            meta: "{}".to_string(),
            created_at: Utc::now().timestamp_millis(),
            updated_at: Utc::now().timestamp_millis(),
        };

        let mut accounts = self.accounts.lock().unwrap();
        accounts.push(account.clone());
        account
    }

    pub fn create_account(&self, account: common::Account) {
        let mut accounts = self.accounts.lock().unwrap();
        accounts.push(account);
    }

    pub fn get_account(&self, account_id: &str) -> Option<common::Account> {
        let accounts = self.accounts.lock().unwrap();
        accounts.iter().find(|x| x.id == account_id).cloned()
    }

    pub fn update_account(&self, account: common::Account) -> bool {
        let mut accounts = self.accounts.lock().unwrap();
        if let Some(pos) = accounts.iter().position(|x| x.id == account.id) {
            accounts[pos] = account;
            true
        } else {
            false
        }
    }

    pub fn delete_account(&self, account_id: &str) -> bool {
        let mut accounts = self.accounts.lock().unwrap();
        if let Some(pos) = accounts.iter().position(|x| x.id == account_id) {
            accounts.remove(pos);
            true
        } else {
            false
        }
    }

    pub fn list_accounts(&self, user_id: &str) -> Vec<common::Account> {
        let accounts = self.accounts.lock().unwrap();
        if user_id.is_empty() {
            accounts.clone()
        } else {
            accounts.iter().filter(|x| x.user_id == user_id).cloned().collect()
        }
    }
}
