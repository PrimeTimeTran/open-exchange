pub mod model;

use crate::domain::deposits::model::Deposit;
use crate::error::{AppError, Result};
use chrono::Utc;
use rust_decimal::Decimal;
use std::str::FromStr;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

pub trait DepositRepository: Send + Sync + std::fmt::Debug {
    fn create(&self, deposit: Deposit) -> Result<()>;
    fn get(&self, deposit_id: Uuid) -> Result<Option<Deposit>>;
    fn update(&self, deposit: Deposit) -> Result<bool>;
    fn delete(&self, deposit_id: Uuid) -> Result<bool>;
    fn list_by_wallet(&self, wallet_id: Uuid) -> Result<Vec<Deposit>>;
}

#[derive(Debug, Default)]
pub struct InMemoryDepositRepository {
    deposits: Mutex<Vec<Deposit>>,
}

impl InMemoryDepositRepository {
    pub fn new() -> Self {
        Self {
            deposits: Mutex::new(Vec::new()),
        }
    }
}

impl DepositRepository for InMemoryDepositRepository {
    fn create(&self, deposit: Deposit) -> Result<()> {
        let mut deposits = self
            .deposits
            .lock()
            .map_err(|e| AppError::Internal(format!("Deposit mutex poisoned: {}", e)))?;
        deposits.push(deposit);
        Ok(())
    }

    fn get(&self, deposit_id: Uuid) -> Result<Option<Deposit>> {
        let deposits = self
            .deposits
            .lock()
            .map_err(|e| AppError::Internal(format!("Deposit mutex poisoned: {}", e)))?;
        Ok(deposits.iter().find(|x| x.id == deposit_id).cloned())
    }

    fn update(&self, deposit: Deposit) -> Result<bool> {
        let mut deposits = self
            .deposits
            .lock()
            .map_err(|e| AppError::Internal(format!("Deposit mutex poisoned: {}", e)))?;
        if let Some(pos) = deposits.iter().position(|x| x.id == deposit.id) {
            deposits[pos] = deposit;
            Ok(true)
        } else {
            Ok(false)
        }
    }

    fn delete(&self, deposit_id: Uuid) -> Result<bool> {
        let mut deposits = self
            .deposits
            .lock()
            .map_err(|e| AppError::Internal(format!("Deposit mutex poisoned: {}", e)))?;
        if let Some(pos) = deposits.iter().position(|x| x.id == deposit_id) {
            deposits.remove(pos);
            Ok(true)
        } else {
            Ok(false)
        }
    }

    fn list_by_wallet(&self, wallet_id: Uuid) -> Result<Vec<Deposit>> {
        let deposits = self
            .deposits
            .lock()
            .map_err(|e| AppError::Internal(format!("Deposit mutex poisoned: {}", e)))?;
        Ok(deposits
            .iter()
            .filter(|x| x.wallet_id == wallet_id)
            .cloned()
            .collect())
    }
}

#[derive(Clone, Debug)]
pub struct DepositService {
    repo: Arc<dyn DepositRepository>,
}

impl DepositService {
    pub fn new(repo: Arc<dyn DepositRepository>) -> Self {
        Self { repo }
    }

    pub fn create_new_deposit(
        &self,
        wallet_id: String,
        amount: String,
        tx_ref: String,
    ) -> Result<Deposit> {
        let amount_decimal = Decimal::from_str(&amount)
            .map_err(|_| AppError::ValidationError("Invalid amount".into()))?;
        let wallet_uuid = Uuid::parse_str(&wallet_id)
            .map_err(|_| AppError::ValidationError("Invalid wallet ID".into()))?;

        let deposit = Deposit {
            id: Uuid::new_v4(),
            tenant_id: Uuid::nil(),   // Placeholder, should be passed in
            account_id: Uuid::nil(),  // Placeholder
            asset_id: "".to_string(), // Placeholder
            wallet_id: wallet_uuid,
            amount: amount_decimal,
            fee: Decimal::ZERO,
            status: "pending".to_string(),
            transaction_ref: tx_ref,
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        self.repo.create(deposit.clone())?;
        Ok(deposit)
    }

    pub fn create_deposit(&self, deposit: Deposit) -> Result<()> {
        self.repo.create(deposit)
    }

    pub fn get_deposit(&self, deposit_id: Uuid) -> Result<Option<Deposit>> {
        self.repo.get(deposit_id)
    }

    pub fn update_deposit(&self, deposit: Deposit) -> Result<bool> {
        self.repo.update(deposit)
    }

    pub fn cancel_deposit(&self, deposit_id: Uuid) -> Result<bool> {
        self.repo.delete(deposit_id)
    }

    pub fn list_deposits(&self, wallet_id: Uuid) -> Result<Vec<Deposit>> {
        self.repo.list_by_wallet(wallet_id)
    }
}
