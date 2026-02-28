use crate::domain::wallets::WalletService;
/// Options contract lifecycle service.
///
/// Handles premium collection, collateral locking, exercise (call & put),
/// expiry of OTM options, and assignment of a writer on exercise.
use crate::error::{AppError, Result};
use rust_decimal::{Decimal, MathematicalOps};
use std::sync::Arc;
use uuid::Uuid;

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
        quote_asset_id: Uuid,
        premium: Decimal,
    ) -> Result<()> {
        self.debit_locked(buyer, quote_asset_id, premium).await
    }

    /// Credit the option premium to the writer and lock the base asset as collateral.
    pub async fn write_call(
        &self,
        writer: Uuid,
        base_asset_id: Uuid,
        quote_asset_id: Uuid,
        qty: Decimal,
        premium: Decimal,
    ) -> Result<()> {
        self.lock_funds(writer, base_asset_id, qty).await?;
        self.credit_available(writer, quote_asset_id, premium).await
    }

    /// Credit the option premium to the writer and lock the quote asset as collateral (Cash Secured Put).
    pub async fn write_put(
        &self,
        writer: Uuid,
        quote_asset_id: Uuid,
        collateral_amount: Decimal, // Strike * Qty
        premium: Decimal,
    ) -> Result<()> {
        self.lock_funds(writer, quote_asset_id, collateral_amount)
            .await?;
        self.credit_available(writer, quote_asset_id, premium).await
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
        strike_quote_total: Decimal,
        base_asset_id: Uuid,
        quote_asset_id: Uuid,
        market_price: Decimal,
        base_decimals: u32,
        quote_decimals: u32,
    ) -> Result<()> {
        let scale_base = Decimal::from(10).powi(base_decimals as i64);
        let scale_quote = Decimal::from(10).powi(quote_decimals as i64);

        // Price Per Unit = (Total Quote / 10^Quote) / (Qty Base / 10^Base)
        let strike_price_unit = (strike_quote_total * scale_base) / (qty_base * scale_quote);

        // OTM Check: Call is OTM if Market < Strike
        if market_price < strike_price_unit {
            return Err(AppError::ValidationError(format!(
                "Cannot exercise OTM call: Market {} < Strike {}",
                market_price, strike_price_unit
            )));
        }

        self.debit_locked(buyer, quote_asset_id, strike_quote_total)
            .await?;
        self.credit_available(buyer, base_asset_id, qty_base)
            .await?;
        self.consume_locked(writer, base_asset_id, qty_base).await?;
        self.credit_available(writer, quote_asset_id, strike_quote_total)
            .await
    }

    /// Exercise a put option.
    /// - Writer's locked USD consumed.
    /// - Writer receives BTC.
    pub async fn exercise_put(
        &self,
        buyer: Uuid,
        writer: Uuid,
        qty_base: Decimal,
        strike_quote_total: Decimal,
        base_asset_id: Uuid,
        quote_asset_id: Uuid,
        market_price: Decimal,
        base_decimals: u32,
        quote_decimals: u32,
    ) -> Result<()> {
        let scale_base = Decimal::from(10).powi(base_decimals as i64);
        let scale_quote = Decimal::from(10).powi(quote_decimals as i64);

        let strike_price_unit = (strike_quote_total * scale_base) / (qty_base * scale_quote);

        // OTM Check: Put is OTM if Market > Strike
        if market_price > strike_price_unit {
            return Err(AppError::ValidationError(format!(
                "Cannot exercise OTM put: Market {} > Strike {}",
                market_price, strike_price_unit
            )));
        }

        self.consume_locked(buyer, base_asset_id, qty_base).await?;
        self.credit_available(buyer, quote_asset_id, strike_quote_total)
            .await?;
        self.consume_locked(writer, quote_asset_id, strike_quote_total)
            .await?;
        self.credit_available(writer, base_asset_id, qty_base).await
    }

    /// Cash settle a call option.
    pub async fn cash_settle_call(
        &self,
        buyer: Uuid,
        writer: Uuid,
        qty_base: Decimal,
        base_decimals: u32,
        strike_price: Decimal,
        settlement_price: Decimal,
        quote_asset_id: Uuid,
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
        self.debit_available(writer, quote_asset_id, payout).await?;
        self.credit_available(buyer, quote_asset_id, payout).await?;

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
        quote_asset_id: Uuid,
    ) -> Result<Decimal> {
        let profit_per_unit = strike_price - settlement_price;
        if profit_per_unit <= Decimal::ZERO {
            return Ok(Decimal::ZERO);
        }

        let scale = Decimal::from(10).powi(base_decimals as i64);
        let quantity_units = qty_base / scale;
        let payout = (profit_per_unit * quantity_units).floor();

        // Transfer payout from Writer to Buyer.
        self.debit_available(writer, quote_asset_id, payout).await?;
        self.credit_available(buyer, quote_asset_id, payout).await?;

        Ok(payout)
    }

    // ── Expiry ───────────────────────────────────────────────────────────────

    /// OTM expiry: release the writer's locked collateral back to available.
    pub async fn expire_option(
        &self,
        writer: Uuid,
        collateral_asset_id: Uuid,
        qty: Decimal,
    ) -> Result<()> {
        self.release_locked(writer, collateral_asset_id, qty).await
    }

    // ── Assignment ───────────────────────────────────────────────────────────

    /// Exercise a call and assign to the first writer in the list.
    /// Only one writer is affected; the rest retain their locked collateral.
    pub async fn exercise_and_assign(
        &self,
        buyer: Uuid,
        writers: &[Uuid],
        qty_base: Decimal,
        strike_quote_total: Decimal,
        base_asset_id: Uuid,
        quote_asset_id: Uuid,
        market_price: Decimal,
        base_decimals: u32,
        quote_decimals: u32,
    ) -> Result<()> {
        let assigned = writers.first().ok_or_else(|| {
            AppError::ValidationError("No writers available for assignment".into())
        })?;

        self.exercise_call(
            buyer,
            *assigned,
            qty_base,
            strike_quote_total,
            base_asset_id,
            quote_asset_id,
            market_price,
            base_decimals,
            quote_decimals,
        )
        .await
    }

    // ── Wallet helpers ───────────────────────────────────────────────────────

    async fn debit_locked(&self, account: Uuid, asset: Uuid, amount: Decimal) -> Result<()> {
        if let Some(mut w) = self
            .wallet_service
            .get_wallet_by_account_and_asset(&account.to_string(), &asset.to_string())
            .await?
        {
            let locked = w.locked;
            let _total = w.total;
            if locked < amount {
                return Err(AppError::InsufficientFunds {
                    asset: asset.to_string(),
                    required: amount.to_string(),
                    available: locked.to_string(),
                });
            }
            w.locked -= amount;
            w.total -= amount;
            w.updated_at = chrono::Utc::now();
            self.wallet_service.update_wallet(w).await?;
        }
        Ok(())
    }

    async fn debit_available(&self, account: Uuid, asset: Uuid, amount: Decimal) -> Result<()> {
        if let Some(mut w) = self
            .wallet_service
            .get_wallet_by_account_and_asset(&account.to_string(), &asset.to_string())
            .await?
        {
            let available = w.available;
            let _total = w.total;
            if available < amount {
                return Err(AppError::InsufficientFunds {
                    asset: asset.to_string(),
                    required: amount.to_string(),
                    available: available.to_string(),
                });
            }
            w.available -= amount;
            w.total -= amount;
            w.updated_at = chrono::Utc::now();
            self.wallet_service.update_wallet(w).await?;
        }
        Ok(())
    }

    /// Consume locked funds (same as debit_locked).
    async fn consume_locked(&self, account: Uuid, asset: Uuid, amount: Decimal) -> Result<()> {
        self.debit_locked(account, asset, amount).await
    }

    async fn credit_available(&self, account: Uuid, asset: Uuid, amount: Decimal) -> Result<()> {
        if let Some(mut w) = self
            .wallet_service
            .get_wallet_by_account_and_asset(&account.to_string(), &asset.to_string())
            .await?
        {
            w.available += amount;
            w.total += amount;
            w.updated_at = chrono::Utc::now();
            self.wallet_service.update_wallet(w).await?;
        }
        Ok(())
    }

    async fn lock_funds(&self, account: Uuid, asset: Uuid, amount: Decimal) -> Result<()> {
        if let Some(mut w) = self
            .wallet_service
            .get_wallet_by_account_and_asset(&account.to_string(), &asset.to_string())
            .await?
        {
            let available = w.available;
            let _locked = w.locked;
            if available < amount {
                return Err(AppError::InsufficientFunds {
                    asset: asset.to_string(),
                    required: amount.to_string(),
                    available: available.to_string(),
                });
            }
            w.available -= amount;
            w.locked += amount;
            w.updated_at = chrono::Utc::now();
            self.wallet_service.update_wallet(w).await?;
        }
        Ok(())
    }

    async fn release_locked(&self, account: Uuid, asset: Uuid, amount: Decimal) -> Result<()> {
        if let Some(mut w) = self
            .wallet_service
            .get_wallet_by_account_and_asset(&account.to_string(), &asset.to_string())
            .await?
        {
            let locked = w.locked;
            let _available = w.available;
            let release = amount.min(locked);
            if release > Decimal::ZERO {
                w.locked -= release;
                w.available += release;
                w.updated_at = chrono::Utc::now();
                self.wallet_service.update_wallet(w).await?;
            }
        }
        Ok(())
    }
}
