/// Options contract lifecycle service.
///
/// Handles premium collection, collateral locking, exercise (call & put),
/// expiry of OTM options, and assignment of a writer on exercise.
use crate::error::{AppError, Result};
use crate::domain::wallets::WalletService;
use rust_decimal::{Decimal, MathematicalOps};
use std::str::FromStr;
use std::sync::Arc;
use uuid::Uuid;

fn parse(s: &str) -> Decimal {
    Decimal::from_str(s).unwrap_or_default()
}

/// Service for options contract lifecycle management.
#[derive(Clone)]
pub struct ExerciseService {
    wallet_service: Arc<WalletService>,
}

impl ExerciseService {
    pub fn new(wallet_service: Arc<WalletService>) -> Self {
        Self { wallet_service }
    }

    // ── Buying / Writing ─────────────────────────────────────────────────────

    /// Deduct the option premium from the buyer's available (or locked) balance.
    pub async fn buy_option(
        &self,
        buyer: Uuid,
        quote_asset_id: &str,
        premium: Decimal,
    ) -> Result<()> {
        self.debit_locked(&buyer.to_string(), quote_asset_id, premium).await
    }

    /// Credit the option premium to the writer and lock the base asset as collateral.
    pub async fn write_call(
        &self,
        writer: Uuid,
        base_asset_id: &str,
        quote_asset_id: &str,
        qty: Decimal,
        premium: Decimal,
    ) -> Result<()> {
        self.lock_funds(&writer.to_string(), base_asset_id, qty).await?;
        self.credit_available(&writer.to_string(), quote_asset_id, premium).await
    }

    // ── Exercise ─────────────────────────────────────────────────────────────

    /// Exercise a call option.
    ///
    /// - Buyer's locked USD consumed (strike payment).
    /// - Buyer receives BTC.
    /// - Writer's locked BTC consumed.
    /// - Writer receives USD.
    pub async fn exercise_call(
        &self,
        buyer: Uuid,
        writer: Uuid,
        qty_base: Decimal,
        strike_quote: Decimal,
        base_asset_id: &str,
        quote_asset_id: &str,
    ) -> Result<()> {
        self.debit_locked(&buyer.to_string(),  quote_asset_id, strike_quote).await?;
        self.credit_available(&buyer.to_string(),  base_asset_id, qty_base).await?;
        self.consume_locked(&writer.to_string(), base_asset_id, qty_base).await?;
        self.credit_available(&writer.to_string(), quote_asset_id, strike_quote).await
    }

    /// Exercise a put option.
    ///
    /// - Buyer's locked BTC consumed.
    /// - Buyer receives USD (strike payment).
    /// - Writer's locked USD consumed.
    /// - Writer receives BTC.
    pub async fn exercise_put(
        &self,
        buyer: Uuid,
        writer: Uuid,
        qty_base: Decimal,
        strike_quote: Decimal,
        base_asset_id: &str,
        quote_asset_id: &str,
    ) -> Result<()> {
        self.consume_locked(&buyer.to_string(),  base_asset_id,  qty_base).await?;
        self.credit_available(&buyer.to_string(),  quote_asset_id, strike_quote).await?;
        self.consume_locked(&writer.to_string(), quote_asset_id, strike_quote).await?;
        self.credit_available(&writer.to_string(), base_asset_id, qty_base).await
    }

    /// Cash settle a call option.
    /// Payout = (Settlement Price - Strike Price) * (QtyBase / 10^BaseDecimals)
    /// Returns the payout amount credited to the buyer.
    pub async fn cash_settle_call(
        &self,
        buyer: Uuid,
        writer: Uuid,
        qty_base: Decimal,
        base_decimals: u32,
        strike_price: Decimal,
        settlement_price: Decimal,
        quote_asset_id: &str,
    ) -> Result<Decimal> {
        let profit_per_unit = settlement_price - strike_price;
        if profit_per_unit <= Decimal::ZERO {
            return Ok(Decimal::ZERO);
        }

        let scale = Decimal::from(10).powi(base_decimals as i64);
        let quantity_units = qty_base / scale;
        let payout = (profit_per_unit * quantity_units).floor();

        // Transfer payout from Writer to Buyer.
        // We assume Writer has funds available (or locked as margin).
        // For this implementation, we try to debit available.
        self.debit_available(&writer.to_string(), quote_asset_id, payout).await?;
        self.credit_available(&buyer.to_string(), quote_asset_id, payout).await?;
        
        Ok(payout)
    }

    /// Cash settle a put option.
    /// Payout = (Strike Price - Settlement Price) * (QtyBase / 10^BaseDecimals)
    /// Returns the payout amount credited to the buyer.
    pub async fn cash_settle_put(
        &self,
        buyer: Uuid,
        writer: Uuid,
        qty_base: Decimal,
        base_decimals: u32,
        strike_price: Decimal,
        settlement_price: Decimal,
        quote_asset_id: &str,
    ) -> Result<Decimal> {
        let profit_per_unit = strike_price - settlement_price;
        if profit_per_unit <= Decimal::ZERO {
            return Ok(Decimal::ZERO);
        }

        let scale = Decimal::from(10).powi(base_decimals as i64);
        let quantity_units = qty_base / scale;
        let payout = (profit_per_unit * quantity_units).floor();

        // Transfer payout from Writer to Buyer.
        self.debit_available(&writer.to_string(), quote_asset_id, payout).await?;
        self.credit_available(&buyer.to_string(), quote_asset_id, payout).await?;
        
        Ok(payout)
    }

    // ── Expiry ───────────────────────────────────────────────────────────────

    /// OTM expiry: release the writer's locked collateral back to available.
    pub async fn expire_option(
        &self,
        writer: Uuid,
        collateral_asset_id: &str,
        qty: Decimal,
    ) -> Result<()> {
        self.release_locked(&writer.to_string(), collateral_asset_id, qty).await
    }

    // ── Assignment ───────────────────────────────────────────────────────────

    /// Exercise a call and assign to the first writer in the list.
    /// Only one writer is affected; the rest retain their locked collateral.
    pub async fn exercise_and_assign(
        &self,
        buyer: Uuid,
        writers: &[Uuid],
        qty_base: Decimal,
        strike_quote: Decimal,
        base_asset_id: &str,
        quote_asset_id: &str,
    ) -> Result<()> {
        let assigned = writers
            .first()
            .ok_or_else(|| AppError::ValidationError("No writers available for assignment".into()))?;

        self.exercise_call(buyer, *assigned, qty_base, strike_quote, base_asset_id, quote_asset_id).await
    }

    // ── Wallet helpers ───────────────────────────────────────────────────────

    async fn debit_locked(&self, account: &str, asset: &str, amount: Decimal) -> Result<()> {
        if let Some(mut w) = self.wallet_service.get_wallet_by_account_and_asset(account, asset).await? {
            let locked = parse(&w.locked);
            let total  = parse(&w.total);
            if locked < amount {
                return Err(AppError::InsufficientFunds {
                    asset: asset.to_string(),
                    required: amount.to_string(),
                    available: locked.to_string(),
                });
            }
            w.locked     = (locked - amount).to_string();
            w.total      = (total  - amount).to_string();
            w.updated_at = chrono::Utc::now().timestamp_millis();
            self.wallet_service.update_wallet(w).await?;
        }
        Ok(())
    }

    async fn debit_available(&self, account: &str, asset: &str, amount: Decimal) -> Result<()> {
        if let Some(mut w) = self.wallet_service.get_wallet_by_account_and_asset(account, asset).await? {
            let available = parse(&w.available);
            let total  = parse(&w.total);
            if available < amount {
                return Err(AppError::InsufficientFunds {
                    asset: asset.to_string(),
                    required: amount.to_string(),
                    available: available.to_string(),
                });
            }
            w.available  = (available - amount).to_string();
            w.total      = (total  - amount).to_string();
            w.updated_at = chrono::Utc::now().timestamp_millis();
            self.wallet_service.update_wallet(w).await?;
        }
        Ok(())
    }

    /// Consume locked funds (same as debit_locked).
    async fn consume_locked(&self, account: &str, asset: &str, amount: Decimal) -> Result<()> {
        self.debit_locked(account, asset, amount).await
    }

    async fn credit_available(&self, account: &str, asset: &str, amount: Decimal) -> Result<()> {
        if let Some(mut w) = self.wallet_service.get_wallet_by_account_and_asset(account, asset).await? {
            w.available  = (parse(&w.available) + amount).to_string();
            w.total      = (parse(&w.total)     + amount).to_string();
            w.updated_at = chrono::Utc::now().timestamp_millis();
            self.wallet_service.update_wallet(w).await?;
        }
        Ok(())
    }

    async fn lock_funds(&self, account: &str, asset: &str, amount: Decimal) -> Result<()> {
        if let Some(mut w) = self.wallet_service.get_wallet_by_account_and_asset(account, asset).await? {
            let available = parse(&w.available);
            let locked    = parse(&w.locked);
            if available < amount {
                return Err(AppError::InsufficientFunds {
                    asset: asset.to_string(),
                    required: amount.to_string(),
                    available: available.to_string(),
                });
            }
            w.available  = (available - amount).to_string();
            w.locked     = (locked    + amount).to_string();
            w.updated_at = chrono::Utc::now().timestamp_millis();
            self.wallet_service.update_wallet(w).await?;
        }
        Ok(())
    }

    async fn release_locked(&self, account: &str, asset: &str, amount: Decimal) -> Result<()> {
        if let Some(mut w) = self.wallet_service.get_wallet_by_account_and_asset(account, asset).await? {
            let locked    = parse(&w.locked);
            let available = parse(&w.available);
            let release   = amount.min(locked);
            if release > Decimal::ZERO {
                w.locked     = (locked    - release).to_string();
                w.available  = (available + release).to_string();
                w.updated_at = chrono::Utc::now().timestamp_millis();
                self.wallet_service.update_wallet(w).await?;
            }
        }
        Ok(())
    }
}
