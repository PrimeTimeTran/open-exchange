use crate::domain::withdrawals::model::Withdrawal;
use crate::domain::withdrawals::WithdrawalRepository;
use crate::error::{AppError, Result};
use async_trait::async_trait;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Clone, Default)]
pub struct InMemoryWithdrawalRepository {
    withdrawals: Arc<Mutex<Vec<Withdrawal>>>,
}

impl InMemoryWithdrawalRepository {
    pub fn new() -> Self {
        Self {
            withdrawals: Arc::new(Mutex::new(Vec::new())),
        }
    }
}

#[async_trait]
impl WithdrawalRepository for InMemoryWithdrawalRepository {
    async fn create(&self, withdrawal: Withdrawal) -> Result<Withdrawal> {
        let mut withdrawals = self
            .withdrawals
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock withdrawals: {}", e)))?;
        withdrawals.push(withdrawal.clone());
        Ok(withdrawal)
    }

    async fn get(&self, id: Uuid) -> Result<Option<Withdrawal>> {
        let withdrawals = self
            .withdrawals
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock withdrawals: {}", e)))?;
        Ok(withdrawals.iter().find(|w| w.id == id).cloned())
    }

    async fn update(&self, withdrawal: Withdrawal) -> Result<Withdrawal> {
        let mut withdrawals = self
            .withdrawals
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock withdrawals: {}", e)))?;
        if let Some(pos) = withdrawals.iter().position(|w| w.id == withdrawal.id) {
            withdrawals[pos] = withdrawal.clone();
            Ok(withdrawal)
        } else {
            Err(AppError::NotFound(format!(
                "Withdrawal {} not found",
                withdrawal.id
            )))
        }
    }

    async fn list_by_wallet(&self, wallet_id: Uuid) -> Result<Vec<Withdrawal>> {
        let withdrawals = self
            .withdrawals
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock withdrawals: {}", e)))?;
        Ok(withdrawals
            .iter()
            .filter(|w| w.wallet_id == wallet_id)
            .cloned()
            .collect())
    }
}
