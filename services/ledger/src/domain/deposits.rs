use crate::proto::common;
use std::sync::{Arc, Mutex};
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Default, Clone)]
pub struct DepositService {
    deposits: Arc<Mutex<Vec<common::Deposit>>>,
}

impl DepositService {
    pub fn new() -> Self {
        Self {
            deposits: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn create_new_deposit(&self, wallet_id: String, amount: String, tx_ref: String) -> common::Deposit {
        let deposit = common::Deposit {
            id: Uuid::new_v4().to_string(),
            tenant_id: "default".to_string(),
            account_id: "".to_string(),
            asset_id: "".to_string(),
            wallet_id,
            amount,
            status: "pending".to_string(),
            chain: "internal".to_string(),
            tx_hash: tx_ref,
            from_address: "".to_string(),
            confirmations: 0,
            required_confirmations: 1,
            detected_at: Utc::now().timestamp_millis(),
            confirmed_at: 0,
            credited_at: 0,
            meta: "{}".to_string(),
            created_at: Utc::now().timestamp_millis(),
            updated_at: Utc::now().timestamp_millis(),
        };

        let mut deposits = self.deposits.lock().unwrap();
        deposits.push(deposit.clone());
        deposit
    }

    pub fn create_deposit(&self, deposit: common::Deposit) {
        let mut deposits = self.deposits.lock().unwrap();
        deposits.push(deposit);
    }

    pub fn get_deposit(&self, deposit_id: &str) -> Option<common::Deposit> {
        let deposits = self.deposits.lock().unwrap();
        deposits.iter().find(|x| x.id == deposit_id).cloned()
    }

    pub fn update_deposit(&self, deposit: common::Deposit) -> bool {
        let mut deposits = self.deposits.lock().unwrap();
        if let Some(pos) = deposits.iter().position(|x| x.id == deposit.id) {
            deposits[pos] = deposit;
            true
        } else {
            false
        }
    }

    pub fn cancel_deposit(&self, deposit_id: &str) -> bool {
        let mut deposits = self.deposits.lock().unwrap();
        if let Some(pos) = deposits.iter().position(|x| x.id == deposit_id) {
             // In a real system, we might mark as cancelled instead of removing
             // But for consistency with other services in MVP:
            deposits.remove(pos); 
            true
        } else {
            false
        }
    }

    pub fn list_deposits(&self, wallet_id: &str) -> Vec<common::Deposit> {
        let deposits = self.deposits.lock().unwrap();
        if wallet_id.is_empty() {
            deposits.clone()
        } else {
            deposits.iter().filter(|x| x.wallet_id == wallet_id).cloned().collect()
        }
    }
}
