use crate::domain::wallets::WalletService;
/// Perpetual futures funding-rate and mark-to-market settlement services.
///
/// - `FundingRateService`     – transfers periodic funding payments between long/short holders.
/// - `MarkToMarketService`    – settles daily unrealised PnL between long and short accounts.
/// - `FuturesSettlementService` – expires a dated futures contract at the settlement price and
///                               releases locked margin.
use crate::error::{AppError, Result};
use rust_decimal::Decimal;
use std::sync::Arc;
use uuid::Uuid;

// ─── helpers shared across all three services ─────────────────────────────────

async fn credit(ws: &WalletService, account: &str, asset: &str, amount: Decimal) -> Result<()> {
    if let Some(mut w) = ws.get_wallet_by_account_and_asset(account, asset).await? {
        w.available += amount;
        w.total += amount;
        w.updated_at = chrono::Utc::now();
        ws.update_wallet(w).await?;
    }
    Ok(())
}

async fn debit_available(
    ws: &WalletService,
    account: &str,
    asset: &str,
    amount: Decimal,
) -> Result<()> {
    if let Some(mut w) = ws.get_wallet_by_account_and_asset(account, asset).await? {
        let available = w.available;
        if available < amount {
            return Err(AppError::InsufficientFunds {
                asset: asset.to_string(),
                required: amount.to_string(),
                available: available.to_string(),
            });
        }
        w.available = available - amount;
        w.total -= amount;
        w.updated_at = chrono::Utc::now();
        ws.update_wallet(w).await?;
    }
    Ok(())
}

async fn release_all_locked(ws: &WalletService, account: &str, asset: &str) -> Result<()> {
    if let Some(mut w) = ws.get_wallet_by_account_and_asset(account, asset).await? {
        let locked = w.locked;
        if locked > Decimal::ZERO {
            w.available += locked;
            w.locked = Decimal::ZERO;
            w.updated_at = chrono::Utc::now();
            ws.update_wallet(w).await?;
        }
    }
    Ok(())
}

// ─── FundingRateService ───────────────────────────────────────────────────────

/// Collects a periodic funding payment for a perpetual futures position.
///
/// Positive `rate`  → long pays short.
/// Negative `rate`  → short pays long.
#[derive(Clone)]
pub struct FundingRateService {
    wallet_service: Arc<WalletService>,
}

impl FundingRateService {
    pub fn new(wallet_service: Arc<WalletService>) -> Self {
        Self { wallet_service }
    }

    /// Transfer the funding payment between the two position holders.
    ///
    /// # Arguments
    /// * `asset_id`          – quote asset (e.g. USD) in which payment is made
    /// * `position_notional` – total notional value of the position in quote atomic units
    /// * `rate`              – funding rate (+ = long pays short; - = short pays long)
    /// * `long_account`      – account that holds the long position
    /// * `short_account`     – account that holds the short position
    pub async fn collect(
        &self,
        asset_id: &str,
        position_notional: Decimal,
        rate: Decimal,
        long_account: Uuid,
        short_account: Uuid,
    ) -> Result<()> {
        let payment = (position_notional * rate.abs()).floor();
        if payment <= Decimal::ZERO {
            return Ok(());
        }
        let (payer, receiver) = if rate >= Decimal::ZERO {
            (long_account, short_account) // positive: long pays
        } else {
            (short_account, long_account) // negative: short pays
        };
        debit_available(&self.wallet_service, &payer.to_string(), asset_id, payment).await?;
        credit(
            &self.wallet_service,
            &receiver.to_string(),
            asset_id,
            payment,
        )
        .await
    }
}

// ─── MarkToMarketService ──────────────────────────────────────────────────────

/// Settles unrealised PnL between a long and short holder based on mark price.
///
/// The profitable side is credited; the losing side is debited.
#[derive(Clone)]
pub struct MarkToMarketService {
    wallet_service: Arc<WalletService>,
}

impl MarkToMarketService {
    pub fn new(wallet_service: Arc<WalletService>) -> Self {
        Self { wallet_service }
    }

    /// Settle PnL for one futures pair.
    ///
    /// `pnl = mark_price - entry_price` from the long's perspective.
    /// Positive pnl → long profits (credited), short loses (debited).
    pub async fn settle(
        &self,
        asset_id: &str,
        entry_price: Decimal,
        mark_price: Decimal,
        long_account: Uuid,
        short_account: Uuid,
    ) -> Result<()> {
        let pnl = mark_price - entry_price;
        if pnl == Decimal::ZERO {
            return Ok(());
        }
        let (loser, winner, amount) = if pnl > Decimal::ZERO {
            (short_account, long_account, pnl)
        } else {
            (long_account, short_account, pnl.abs())
        };
        debit_available(&self.wallet_service, &loser.to_string(), asset_id, amount).await?;
        credit(&self.wallet_service, &winner.to_string(), asset_id, amount).await
    }
}

// ─── FuturesSettlementService ─────────────────────────────────────────────────

/// Expires a dated futures contract at the settlement price and releases margin.
#[derive(Clone)]
pub struct FuturesSettlementService {
    wallet_service: Arc<WalletService>,
}

impl FuturesSettlementService {
    pub fn new(wallet_service: Arc<WalletService>) -> Self {
        Self { wallet_service }
    }

    /// Force-settle all open positions at `settlement_price` and release locked margin.
    pub async fn expire(
        &self,
        asset_id: &str,
        entry_price: Decimal,
        settlement_price: Decimal,
        long_account: Uuid,
        short_account: Uuid,
    ) -> Result<()> {
        // Transfer final PnL
        let pnl = settlement_price - entry_price;
        if pnl > Decimal::ZERO {
            debit_available(
                &self.wallet_service,
                &short_account.to_string(),
                asset_id,
                pnl,
            )
            .await?;
            credit(
                &self.wallet_service,
                &long_account.to_string(),
                asset_id,
                pnl,
            )
            .await?;
        } else if pnl < Decimal::ZERO {
            debit_available(
                &self.wallet_service,
                &long_account.to_string(),
                asset_id,
                pnl.abs(),
            )
            .await?;
            credit(
                &self.wallet_service,
                &short_account.to_string(),
                asset_id,
                pnl.abs(),
            )
            .await?;
        }
        // Release all locked margin on both sides
        release_all_locked(&self.wallet_service, &long_account.to_string(), asset_id).await?;
        release_all_locked(&self.wallet_service, &short_account.to_string(), asset_id).await
    }

    /// Close a single position: release all locked margin back to available.
    pub async fn close_position(&self, account_id: Uuid, asset_id: &str) -> Result<()> {
        release_all_locked(&self.wallet_service, &account_id.to_string(), asset_id).await
    }
}
