use crate::domain::accounts::{Account, AccountRepository};

use crate::error::{AppError, Result};
use async_trait::async_trait;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Clone, Default)]
pub struct InMemoryAccountRepository {
    accounts: Arc<Mutex<Vec<Account>>>,
}

impl InMemoryAccountRepository {
    pub fn new() -> Self {
        Self {
            accounts: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn add(&self, account: Account) -> Result<()> {
        let mut accounts = self
            .accounts
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock accounts: {}", e)))?;
        accounts.push(account);
        Ok(())
    }

    pub fn get_accounts(&self) -> Result<Vec<Account>> {
        let accounts = self
            .accounts
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock accounts: {}", e)))?;
        Ok(accounts.clone())
    }
}

#[async_trait]
impl AccountRepository for InMemoryAccountRepository {
    async fn create(&self, account: Account) -> Result<Account> {
        let mut accounts = self
            .accounts
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock accounts: {}", e)))?;
        accounts.push(account.clone());
        Ok(account)
    }

    async fn get(&self, id: Uuid) -> Result<Option<Account>> {
        let accounts = self
            .accounts
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock accounts: {}", e)))?;
        Ok(accounts.iter().find(|a| a.id == id).cloned())
    }

    async fn update(&self, account: Account) -> Result<Account> {
        let mut accounts = self
            .accounts
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock accounts: {}", e)))?;
        if let Some(pos) = accounts.iter().position(|a| a.id == account.id) {
            accounts[pos] = account.clone();
            Ok(account)
        } else {
            Err(AppError::NotFound(format!(
                "Account {} not found",
                account.id
            )))
        }
    }

    async fn delete(&self, id: Uuid) -> Result<()> {
        let mut accounts = self
            .accounts
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock accounts: {}", e)))?;
        if let Some(pos) = accounts.iter().position(|a| a.id == id) {
            accounts.remove(pos);
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Account {} not found", id)))
        }
    }

    async fn list_by_user(&self, user_id: &str) -> Result<Vec<Account>> {
        let accounts = self
            .accounts
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock accounts: {}", e)))?;
        Ok(accounts
            .iter()
            .filter(|a| a.user_id == user_id)
            .cloned()
            .collect())
    }

    async fn get_by_name(&self, name: &str) -> Result<Option<Account>> {
        let accounts = self
            .accounts
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock accounts: {}", e)))?;
        Ok(accounts.iter().find(|a| a.name == name).cloned())
    }

    async fn list_all(&self) -> Result<Vec<Account>> {
        let accounts = self
            .accounts
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock accounts: {}", e)))?;
        Ok(accounts.clone())
    }
}
