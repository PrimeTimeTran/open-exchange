use crate::domain::utils::parse;
use crate::domain::wallets::WalletService;
/// Margin trading services.
///
/// - `MarginService`        – creates leveraged orders (locking only initial margin).
/// - `CrossMarginService`   – calculates net equity across all positions in an account.
/// - `IsolatedMarginService`– applies mark-to-market losses to an isolated margin position.
use crate::error::{AppError, Result};
use rust_decimal::Decimal;
use std::sync::Arc;
use uuid::Uuid;

// ─── MarginStatus ─────────────────────────────────────────────────────────────

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MarginStatus {
    Safe,
    MaintenanceBreached,
    LiquidationRequired,
}

// ─── MarginService ────────────────────────────────────────────────────────────

/// Service for leveraged order management.
#[derive(Clone)]
pub struct MarginService {
    wallet_service: Arc<WalletService>,
}

impl MarginService {
    pub fn new(wallet_service: Arc<WalletService>) -> Self {
        Self { wallet_service }
    }

    /// Create a leveraged buy: lock only `notional / leverage` as initial margin.
    ///
    /// # Arguments
    /// * `account_id`  – the trading account
    /// * `asset_id`    – quote asset (USD) to lock as margin
    /// * `notional`    – full trade notional in quote atomic units
    /// * `leverage`    – leverage multiplier (e.g. 2 = 50% margin)
    pub async fn create_leveraged_buy(
        &self,
        account_id: Uuid,
        asset_id: &str,
        notional: Decimal,
        leverage: u32,
    ) -> Result<()> {
        let initial_margin = (notional / Decimal::from(leverage)).floor();
        self.lock_margin(&account_id.to_string(), asset_id, initial_margin)
            .await
    }

    /// Check whether an account's equity satisfies the maintenance threshold.
    pub async fn check_margin(
        &self,
        account_id: Uuid,
        asset_id: &str,
        maintenance_threshold: Decimal,
    ) -> Result<MarginStatus> {
        let equity = match self
            .wallet_service
            .get_wallet_by_account_and_asset(&account_id.to_string(), asset_id)
            .await?
        {
            Some(w) => parse(&w.total)?,
            None => Decimal::ZERO,
        };

        if equity < maintenance_threshold {
            Ok(MarginStatus::LiquidationRequired)
        } else if equity == maintenance_threshold {
            Ok(MarginStatus::MaintenanceBreached)
        } else {
            Ok(MarginStatus::Safe)
        }
    }

    async fn lock_margin(&self, account: &str, asset: &str, amount: Decimal) -> Result<()> {
        if let Some(mut w) = self
            .wallet_service
            .get_wallet_by_account_and_asset(account, asset)
            .await?
        {
            let available = parse(&w.available)?;
            let locked = parse(&w.locked)?;
            if available < amount {
                return Err(AppError::InsufficientFunds {
                    asset: asset.to_string(),
                    required: amount.to_string(),
                    available: available.to_string(),
                });
            }
            w.available = (available - amount).to_string();
            w.locked = (locked + amount).to_string();
            w.updated_at = chrono::Utc::now().timestamp_millis();
            self.wallet_service.update_wallet(w).await?;
        }
        Ok(())
    }
}

// ─── CrossMarginService ───────────────────────────────────────────────────────

/// Calculates net equity for cross-margin accounts where all positions share
/// the same margin pool.
#[derive(Clone)]
pub struct CrossMarginService {
    wallet_service: Arc<WalletService>,
}

impl CrossMarginService {
    pub fn new(wallet_service: Arc<WalletService>) -> Self {
        Self { wallet_service }
    }

    /// Sum of all wallet totals for the account as a rough equity estimate.
    ///
    /// In a real system this would mark every position to market and net the PnL.
    /// For the in-memory test context, the total wallet balances are used directly
    /// because PnL has already been applied to the wallets by `MarkToMarketService`.
    pub async fn calculate_equity(&self, account_id: Uuid, base_asset_id: &str) -> Result<Decimal> {
        let wallets = self
            .wallet_service
            .list_wallets(&account_id.to_string())
            .await?;
        let equity: Decimal = wallets
            .iter()
            .filter(|w| w.asset_id == base_asset_id)
            .map(|w| parse(&w.total))
            .sum::<Result<Decimal>>()?;
        Ok(equity)
    }
}

// ─── IsolatedMarginService ────────────────────────────────────────────────────

/// Applies mark-to-market losses to a single isolated margin position.
///
/// Losses are deducted from the account's available balance first; once the
/// position hits zero the loss is capped (the account cannot go negative).
#[derive(Clone)]
pub struct IsolatedMarginService {
    wallet_service: Arc<WalletService>,
}

impl IsolatedMarginService {
    pub fn new(wallet_service: Arc<WalletService>) -> Self {
        Self { wallet_service }
    }

    /// Apply `loss` to an isolated position wallet (available + total reduced).
    pub async fn apply_loss(&self, account_id: Uuid, asset_id: &str, loss: Decimal) -> Result<()> {
        if let Some(mut w) = self
            .wallet_service
            .get_wallet_by_account_and_asset(&account_id.to_string(), asset_id)
            .await?
        {
            let available = parse(&w.available)?;
            let total = parse(&w.total)?;
            // Cap loss at current total (position cannot go negative)
            let actual_loss = loss.min(total);
            w.available = (available - actual_loss).max(Decimal::ZERO).to_string();
            w.total = (total - actual_loss).max(Decimal::ZERO).to_string();
            w.updated_at = chrono::Utc::now().timestamp_millis();
            self.wallet_service.update_wallet(w).await?;
        }
        Ok(())
    }
}
