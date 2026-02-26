/// Forced liquidation and insurance fund services.
///
/// - `LiquidationService`    – forcibly closes under-collateralised positions.
/// - `InsuranceFundService`  – covers shortfalls when liquidation proceeds are
///                            insufficient to repay the debt.
use crate::error::Result;
use crate::domain::wallets::WalletService;
use crate::domain::orders::service::OrderService;
use crate::domain::orders::model::{ Order, OrderSide, OrderType, OrderStatus };
use rust_decimal::Decimal;
use std::str::FromStr;
use std::sync::Arc;
use uuid::Uuid;

fn parse(s: &str) -> Decimal {
    Decimal::from_str(s).unwrap_or_default()
}

// ─── LiquidationReport ───────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct LiquidationReport {
    pub account_id: Uuid,
    /// Total amount recovered from selling collateral.
    pub recovered_amount: Decimal,
    /// Remaining shortfall (> 0 if recovery < debt).
    pub shortfall: Decimal,
    /// Orders placed during liquidation
    pub liquidation_orders: Vec<Uuid>,
}

// ─── LiquidationService ───────────────────────────────────────────────────────

/// Handles forced closure of under-collateralised margin positions.
///
/// The current implementation zeroes out the account's locked balance
/// (simulating a full market sell that realises whatever remains) and returns
/// a `LiquidationReport`.  A partial-liquidation overload restores the account
/// above the given `maintenance` threshold.
#[derive(Clone)]
pub struct LiquidationService {
    wallet_service: Arc<WalletService>,
    order_service: Option<Arc<OrderService>>,
}

impl LiquidationService {
    pub fn new(
        wallet_service: Arc<WalletService>,
        order_service: Option<Arc<OrderService>>
    ) -> Self {
        Self { wallet_service, order_service }
    }

    /// Liquidate all locked funds in the account's `asset_id` wallet.
    pub async fn liquidate(
        &self,
        account_id: Uuid,
        asset_id: &str,
        instrument_id: Option<Uuid>
    ) -> Result<LiquidationReport> {
        // Idempotency Check
        if let Some(order_svc) = &self.order_service {
            let open_orders = order_svc.list_open_orders().await?;
            let existing_liquidation = open_orders
                .iter()
                .any(
                    |o|
                        o.account_id == account_id &&
                        o.meta.get("type").and_then(|v| v.as_str()) == Some("liquidation")
                );

            if existing_liquidation {
                // Already liquidating. No-op.
                return Ok(LiquidationReport {
                    account_id,
                    recovered_amount: Decimal::ZERO,
                    shortfall: Decimal::ZERO,
                    liquidation_orders: vec![],
                });
            }
        }

        let mut liquidation_orders = Vec::new();

        let recovered = if
            let Some(mut w) = self.wallet_service.get_wallet_by_account_and_asset(
                &account_id.to_string(),
                asset_id
            ).await?
        {
            let locked = parse(&w.locked);
            if locked > Decimal::ZERO {
                // Place Market Sell Order if OrderService is available
                if let (Some(order_svc), Some(instr_id)) = (&self.order_service, instrument_id) {
                    let order = Order::new(
                        Uuid::new_v4(), // Tenant ID (unknown here, use dummy or fetch from account? OrderService checks it?)
                        account_id,
                        instr_id,
                        OrderSide::Sell,
                        OrderType::Market,
                        locked, // Sell all locked
                        Decimal::ZERO // Market order
                    );

                    let mut order = order;
                    order.meta = serde_json::json!({"type": "liquidation"});
                    order.status = OrderStatus::Open;

                    // Unlock funds first to allow OrderService to re-lock them
                    w.locked = Decimal::ZERO.to_string();
                    w.available = (parse(&w.available) + locked).to_string();
                    w.updated_at = chrono::Utc::now().timestamp_millis();
                    self.wallet_service.update_wallet(w.clone()).await?;

                    match order_svc.create_order(order).await {
                        Ok(o) => {
                            liquidation_orders.push(o.id);
                        }
                        Err(e) => {
                            println!("Liquidation order failed: {:?}", e);
                        }
                    }
                } else {
                    // Legacy behavior: just unlock
                    w.locked = Decimal::ZERO.to_string();
                    w.available = (parse(&w.available) + locked).to_string();
                    w.updated_at = chrono::Utc::now().timestamp_millis();
                    self.wallet_service.update_wallet(w).await?;
                }
                locked
            } else {
                Decimal::ZERO
            }
        } else {
            Decimal::ZERO
        };

        Ok(LiquidationReport {
            account_id,
            recovered_amount: recovered,
            shortfall: Decimal::ZERO,
            liquidation_orders,
        })
    }

    /// Liquidate all positions regardless of maintenance threshold.
    pub async fn full_liquidate(&self, account_id: Uuid, asset_id: &str) -> Result<()> {
        self.zero_locked(&account_id.to_string(), asset_id).await
    }

    /// Only liquidate enough to bring equity above `maintenance`.
    pub async fn partial_liquidate(
        &self,
        account_id: Uuid,
        asset_id: &str,
        maintenance: Decimal
    ) -> Result<()> {
        let equity = self.wallet_service
            .get_wallet_by_account_and_asset(&account_id.to_string(), asset_id).await?
            .map(|w| parse(&w.total))
            .unwrap_or_default();

        if equity >= maintenance {
            return Ok(());
        }
        self.release_locked_as_recovered(&account_id.to_string(), asset_id).await?;
        Ok(())
    }

    /// Check if liquidation is needed and trigger it.
    pub async fn liquidate_if_needed(
        &self,
        account_id: Uuid,
        asset_id: &str,
        maintenance: Decimal
    ) -> Result<()> {
        let equity = self.wallet_service
            .get_wallet_by_account_and_asset(&account_id.to_string(), asset_id).await?
            .map(|w| parse(&w.total))
            .unwrap_or_default();

        if equity < maintenance {
            self.full_liquidate(account_id, asset_id).await?;
        }
        Ok(())
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    /// Zero the locked balance (simulates selling at market).
    async fn zero_locked(&self, account: &str, asset: &str) -> Result<()> {
        if
            let Some(mut w) = self.wallet_service.get_wallet_by_account_and_asset(
                account,
                asset
            ).await?
        {
            let locked = parse(&w.locked);
            if locked > Decimal::ZERO {
                w.locked = Decimal::ZERO.to_string();
                w.total = (parse(&w.total) - locked).max(Decimal::ZERO).to_string();
                w.updated_at = chrono::Utc::now().timestamp_millis();
                self.wallet_service.update_wallet(w).await?;
            }
        }
        Ok(())
    }

    /// Release locked funds to available and return the released amount.
    async fn release_locked_as_recovered(&self, account: &str, asset: &str) -> Result<Decimal> {
        let mut recovered = Decimal::ZERO;
        if
            let Some(mut w) = self.wallet_service.get_wallet_by_account_and_asset(
                account,
                asset
            ).await?
        {
            let locked = parse(&w.locked);
            if locked > Decimal::ZERO {
                recovered = locked;
                w.available = (parse(&w.available) + locked).to_string();
                w.locked = Decimal::ZERO.to_string();
                w.updated_at = chrono::Utc::now().timestamp_millis();
                self.wallet_service.update_wallet(w).await?;
            }
        }
        Ok(recovered)
    }
}

// ─── InsuranceFundService ────────────────────────────────────────────────────

/// Covers liquidation shortfalls from an insurance fund wallet.
#[derive(Clone)]
pub struct InsuranceFundService {
    wallet_service: Arc<WalletService>,
}

impl InsuranceFundService {
    pub fn new(wallet_service: Arc<WalletService>) -> Self {
        Self { wallet_service }
    }

    /// Debit `shortfall` from the insurance fund account's wallet.
    pub async fn cover_shortfall(
        &self,
        shortfall: Decimal,
        insurance_account_id: Uuid,
        asset_id: &str
    ) -> Result<()> {
        if
            let Some(mut w) = self.wallet_service.get_wallet_by_account_and_asset(
                &insurance_account_id.to_string(),
                asset_id
            ).await?
        {
            let available = parse(&w.available);
            let total = parse(&w.total);
            let deduct = shortfall.min(available);
            w.available = (available - deduct).to_string();
            w.total = (total - deduct).to_string();
            w.updated_at = chrono::Utc::now().timestamp_millis();
            self.wallet_service.update_wallet(w).await?;
        }
        Ok(())
    }
}
