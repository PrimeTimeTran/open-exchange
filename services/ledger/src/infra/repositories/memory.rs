use async_trait::async_trait;
use std::sync::{Arc, Mutex};
use uuid::Uuid;
use crate::domain::accounts::{Account, AccountRepository};
use crate::domain::orders::{Order, OrderRepository};
use crate::error::{AppError, Result};

// --- InMemoryAccountRepository ---

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
}

#[async_trait]
impl AccountRepository for InMemoryAccountRepository {
    async fn create(&self, account: Account) -> Result<Account> {
        let mut accounts = self.accounts.lock().unwrap();
        accounts.push(account.clone());
        Ok(account)
    }

    async fn get(&self, id: Uuid) -> Result<Option<Account>> {
        let accounts = self.accounts.lock().unwrap();
        Ok(accounts.iter().find(|a| a.id == id).cloned())
    }

    async fn update(&self, account: Account) -> Result<Account> {
        let mut accounts = self.accounts.lock().unwrap();
        if let Some(pos) = accounts.iter().position(|a| a.id == account.id) {
            accounts[pos] = account.clone();
            Ok(account)
        } else {
            Err(AppError::NotFound(format!("Account {} not found", account.id)))
        }
    }

    async fn delete(&self, id: Uuid) -> Result<()> {
        let mut accounts = self.accounts.lock().unwrap();
        if let Some(pos) = accounts.iter().position(|a| a.id == id) {
            accounts.remove(pos);
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Account {} not found", id)))
        }
    }

    async fn list_by_user(&self, user_id: &str) -> Result<Vec<Account>> {
        let accounts = self.accounts.lock().unwrap();
        Ok(accounts.iter().filter(|a| a.user_id == user_id).cloned().collect())
    }
}

// --- InMemoryOrderRepository ---

#[derive(Clone, Default)]
pub struct InMemoryOrderRepository {
    orders: Arc<Mutex<Vec<Order>>>,
}

impl InMemoryOrderRepository {
    pub fn new() -> Self {
        Self {
            orders: Arc::new(Mutex::new(Vec::new())),
        }
    }
}

#[async_trait]
impl OrderRepository for InMemoryOrderRepository {
    async fn create(&self, order: Order) -> Result<Order> {
        let mut orders = self.orders.lock().unwrap();
        orders.push(order.clone());
        Ok(order)
    }

    async fn get(&self, id: Uuid) -> Result<Option<Order>> {
        let orders = self.orders.lock().unwrap();
        Ok(orders.iter().find(|o| o.id == id).cloned())
    }

    async fn update_status(&self, id: Uuid, status: String) -> Result<()> {
        let mut orders = self.orders.lock().unwrap();
        if let Some(order) = orders.iter_mut().find(|o| o.id == id) {
            order.status = status;
            order.updated_at = chrono::Utc::now();
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Order {} not found", id)))
        }
    }

    async fn list_open(&self) -> Result<Vec<Order>> {
        let orders = self.orders.lock().unwrap();
        // Assuming "open", "partial", "new" are considered open
        Ok(orders.iter()
            .filter(|o| o.status == "open" || o.status == "partial" || o.status == "new")
            .cloned()
            .collect())
    }
}
