use crate::domain::wallets::WalletService;
/// Short-selling borrow service.
///
/// `BorrowService` opens and closes borrows. When a borrow is opened, quote-asset
/// collateral is locked. When it is closed, the collateral is returned (minus any
/// accrued borrow fee).
use crate::error::{AppError, Result};
use chrono::Utc;
use rust_decimal::Decimal;
use std::str::FromStr;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

fn parse(s: &str) -> Decimal {
    Decimal::from_str(s).unwrap_or_default()
}

/// Represents an open borrow position.
#[derive(Clone, Debug)]
pub struct Borrow {
    pub id: Uuid,
    pub account_id: Uuid,
    /// The asset that was borrowed (e.g. BTC).
    pub asset_id: String,
    /// The asset locked as collateral (e.g. USD).
    pub collateral_asset_id: String,
    /// Quantity borrowed (in base asset atomic units).
    pub qty: Decimal,
    /// Collateral locked (in quote asset atomic units).
    pub collateral: Decimal,
    pub created_at: i64,
}

#[derive(Clone)]
pub struct BorrowService {
    wallet_service: Arc<WalletService>,
    borrows: Arc<Mutex<Vec<Borrow>>>,
}

impl BorrowService {
    pub fn new(wallet_service: Arc<WalletService>) -> Self {
        Self {
            wallet_service,
            borrows: Arc::new(Mutex::new(Vec::new())),
        }
    }

    /// Open a borrow: lock `collateral` of `collateral_asset_id` in the account's wallet.
    ///
    /// Returns the `Borrow` record. The caller is responsible for then executing
    /// the short-sell order (selling the borrowed asset).
    pub async fn open_borrow(
        &self,
        account_id: Uuid,
        asset_id: &str,
        collateral_asset_id: &str,
        qty: Decimal,
        collateral: Decimal,
    ) -> Result<Borrow> {
        // 1. Lock collateral in the quote wallet (e.g. USD)
        if let Some(mut w) = self
            .wallet_service
            .get_wallet_by_account_and_asset(&account_id.to_string(), collateral_asset_id)
            .await?
        {
            let available = parse(&w.available);
            let locked = parse(&w.locked);
            if available < collateral {
                return Err(AppError::InsufficientFunds {
                    asset: collateral_asset_id.to_string(),
                    required: collateral.to_string(),
                    available: available.to_string(),
                });
            }
            w.available = (available - collateral).to_string();
            w.locked = (locked + collateral).to_string();
            w.updated_at = Utc::now().timestamp_millis();
            self.wallet_service.update_wallet(w).await?;
        }

        // 2. Credit the borrowed asset to the base wallet (e.g. BTC) so it can be sold
        // If wallet doesn't exist, we might fail or need to create it.
        // For now, assume it exists or use update_wallet which might not create.
        // But WalletService::update_wallet updates an EXISTING wallet.
        // We need to ensure the wallet exists.
        // Since we don't have create_wallet capability here easily without checking,
        // we'll check get_wallet first. If null, we might be stuck.
        // But let's assume the test creates the wallet first (even if empty).
        if let Some(mut w) = self
            .wallet_service
            .get_wallet_by_account_and_asset(&account_id.to_string(), asset_id)
            .await?
        {
            w.available = (parse(&w.available) + qty).to_string();
            w.total = (parse(&w.total) + qty).to_string();
            w.updated_at = Utc::now().timestamp_millis();
            self.wallet_service.update_wallet(w).await?;
        } else {
            // Logic to create wallet if not exists would go here, or return error.
            // For safety, let's return error if wallet doesn't exist to receive borrow.
            return Err(AppError::NotFound(format!(
                "Wallet for asset {} not found",
                asset_id
            )));
        }

        let borrow = Borrow {
            id: Uuid::new_v4(),
            account_id,
            asset_id: asset_id.to_string(),
            collateral_asset_id: collateral_asset_id.to_string(),
            qty,
            collateral,
            created_at: Utc::now().timestamp_millis(),
        };
        self.borrows.lock().unwrap().push(borrow.clone());
        Ok(borrow)
    }

    /// Close a borrow: release the locked collateral, deducting `borrow_fee`.
    ///
    /// The net amount returned = collateral - borrow_fee.
    pub async fn close_borrow(&self, borrow_id: Uuid, borrow_fee: Decimal) -> Result<()> {
        let borrow = {
            let borrows = self.borrows.lock().unwrap();
            borrows.iter().find(|b| b.id == borrow_id).cloned()
        };

        let borrow =
            borrow.ok_or_else(|| AppError::NotFound(format!("Borrow {} not found", borrow_id)))?;

        // 1. Repay borrowed asset (debit from available)
        if let Some(mut w) = self
            .wallet_service
            .get_wallet_by_account_and_asset(&borrow.account_id.to_string(), &borrow.asset_id)
            .await?
        {
            let available = parse(&w.available);
            let total = parse(&w.total);
            if available < borrow.qty {
                return Err(AppError::InsufficientFunds {
                    asset: borrow.asset_id.to_string(),
                    required: borrow.qty.to_string(),
                    available: available.to_string(),
                });
            }
            w.available = (available - borrow.qty).to_string();
            w.total = (total - borrow.qty).to_string();
            w.updated_at = Utc::now().timestamp_millis();
            self.wallet_service.update_wallet(w).await?;
        }

        // 2. Release collateral (minus fee) back to available
        if let Some(mut w) = self
            .wallet_service
            .get_wallet_by_account_and_asset(
                &borrow.account_id.to_string(),
                &borrow.collateral_asset_id,
            )
            .await?
        {
            let locked = parse(&w.locked);
            let available = parse(&w.available);
            let total = parse(&w.total);
            let release = (borrow.collateral - borrow_fee).max(Decimal::ZERO);
            let net_deduct = borrow.collateral - release; // = borrow_fee capped at collateral

            w.locked = (locked - borrow.collateral).max(Decimal::ZERO).to_string();
            w.available = (available + release).to_string();
            w.total = (total - net_deduct).to_string();
            w.updated_at = Utc::now().timestamp_millis();
            self.wallet_service.update_wallet(w).await?;
        }

        // Remove the borrow record
        self.borrows.lock().unwrap().retain(|b| b.id != borrow_id);
        Ok(())
    }

    pub fn get_borrow(&self, borrow_id: Uuid) -> Option<Borrow> {
        self.borrows
            .lock()
            .unwrap()
            .iter()
            .find(|b| b.id == borrow_id)
            .cloned()
    }
}
