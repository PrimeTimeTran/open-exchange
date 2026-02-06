use crate::proto::common;
use std::sync::{Arc, Mutex};
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Default, Clone)]
pub struct WithdrawalService {
    withdrawals: Arc<Mutex<Vec<common::Withdrawal>>>,
}

impl WithdrawalService {
    pub fn new() -> Self {
        Self {
            withdrawals: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn create_new_withdrawal(&self, wallet_id: String, amount: String, address: String) -> common::Withdrawal {
        let withdrawal = common::Withdrawal {
            id: Uuid::new_v4().to_string(),
            tenant_id: "default".to_string(),
            account_id: "".to_string(),
            asset_id: "".to_string(),
            wallet_id,
            amount,
            fee: "0".to_string(),
            status: "pending".to_string(),
            destination_address: address,
            destination_tag: "".to_string(),
            chain: "internal".to_string(),
            tx_hash: "".to_string(),
            failure_reason: "".to_string(),
            requested_by: "api".to_string(),
            approved_by: "".to_string(),
            requested_at: Utc::now().timestamp_millis(),
            approved_at: 0,
            broadcast_at: 0,
            confirmed_at: 0,
            confirmations: 0,
            meta: "{}".to_string(),
            created_at: Utc::now().timestamp_millis(),
            updated_at: Utc::now().timestamp_millis(),
        };

        let mut withdrawals = self.withdrawals.lock().unwrap();
        withdrawals.push(withdrawal.clone());
        withdrawal
    }

    pub fn create_withdrawal(&self, withdrawal: common::Withdrawal) {
        let mut withdrawals = self.withdrawals.lock().unwrap();
        withdrawals.push(withdrawal);
    }

    pub fn get_withdrawal(&self, withdrawal_id: &str) -> Option<common::Withdrawal> {
        let withdrawals = self.withdrawals.lock().unwrap();
        withdrawals.iter().find(|x| x.id == withdrawal_id).cloned()
    }

    pub fn update_withdrawal(&self, withdrawal: common::Withdrawal) -> bool {
        let mut withdrawals = self.withdrawals.lock().unwrap();
        if let Some(pos) = withdrawals.iter().position(|x| x.id == withdrawal.id) {
            withdrawals[pos] = withdrawal;
            true
        } else {
            false
        }
    }

    pub fn cancel_withdrawal(&self, withdrawal_id: &str) -> bool {
        let mut withdrawals = self.withdrawals.lock().unwrap();
        if let Some(pos) = withdrawals.iter().position(|x| x.id == withdrawal_id) {
            withdrawals.remove(pos);
            true
        } else {
            false
        }
    }

    pub fn list_withdrawals(&self, wallet_id: &str) -> Vec<common::Withdrawal> {
        let withdrawals = self.withdrawals.lock().unwrap();
        if wallet_id.is_empty() {
            withdrawals.clone()
        } else {
            withdrawals.iter().filter(|x| x.wallet_id == wallet_id).cloned().collect()
        }
    }
}
