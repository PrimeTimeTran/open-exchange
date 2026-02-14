use std::fmt;
use std::sync::Arc;
use uuid::Uuid;
use super::model::Account;
use super::repository::AccountRepository;
use crate::error::Result;

#[derive(Clone)]
pub struct AccountService {
    repo: Arc<dyn AccountRepository>,
}

impl fmt::Debug for AccountService {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "AccountService")
    }
}

impl AccountService {
    pub fn new(repo: Arc<dyn AccountRepository>) -> Self {
        Self { repo }
    }

    pub async fn create_new_account(&self, user_id: String, name: String, account_type: String) -> Result<Account> {
        let account = Account::new("default".to_string(), user_id, name, account_type);
        self.repo.create(account).await
    }

    pub async fn get_account(&self, account_id: Uuid) -> Result<Option<Account>> {
        self.repo.get(account_id).await
    }

    pub async fn update_account(&self, account: Account) -> Result<Account> {
        self.repo.update(account).await
    }

    pub async fn delete_account(&self, account_id: Uuid) -> Result<()> {
        self.repo.delete(account_id).await
    }

    pub async fn list_accounts(&self, user_id: &str) -> Result<Vec<Account>> {
        self.repo.list_by_user(user_id).await
    }
}
