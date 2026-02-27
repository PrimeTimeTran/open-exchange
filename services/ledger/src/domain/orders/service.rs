use super::repository::OrderRepository;
use crate::domain::assets::AssetService;
use crate::domain::instruments::factory::InstrumentHandlerFactory;
use crate::domain::orders::model::{Order, OrderStatus, OrderType};
use crate::domain::position_limits::PositionLimitService;
use crate::domain::transaction::{RepositoryTransaction, TransactionManager};
use crate::domain::wallets::WalletService;
use crate::error::{AppError, Result};
use rust_decimal::Decimal;
use rust_decimal::MathematicalOps;
use std::fmt;
use std::sync::Arc;
use uuid::Uuid;

#[tonic::async_trait]
pub trait MatchingGateway: Send + Sync {
    async fn place_order(&self, order: &Order) -> Result<()>;
}

#[derive(Clone)]
pub struct OrderService {
    tx_manager: Option<Arc<dyn TransactionManager>>,
    repo: Arc<dyn OrderRepository>,
    asset_service: Arc<AssetService>,
    wallet_service: Arc<WalletService>,
    matching_gateway: Option<Arc<dyn MatchingGateway>>,
    position_limit_service: Option<Arc<PositionLimitService>>,
}

impl fmt::Debug for OrderService {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "OrderService")
    }
}

pub struct OrderServiceBuilder {
    repo: Arc<dyn OrderRepository>,
    wallet_service: Arc<WalletService>,
    asset_service: Arc<AssetService>,
    tx_manager: Option<Arc<dyn TransactionManager>>,
    matching_gateway: Option<Arc<dyn MatchingGateway>>,
    position_limit_service: Option<Arc<PositionLimitService>>,
}

impl OrderServiceBuilder {
    pub fn new(
        repo: Arc<dyn OrderRepository>,
        wallet_service: Arc<WalletService>,
        asset_service: Arc<AssetService>,
    ) -> Self {
        Self {
            repo,
            wallet_service,
            asset_service,
            tx_manager: None,
            matching_gateway: None,
            position_limit_service: None,
        }
    }

    pub fn with_transaction_manager(mut self, tx_manager: Arc<dyn TransactionManager>) -> Self {
        self.tx_manager = Some(tx_manager);
        self
    }

    pub fn with_matching_gateway(mut self, gateway: Arc<dyn MatchingGateway>) -> Self {
        self.matching_gateway = Some(gateway);
        self
    }

    pub fn with_position_limit_service(mut self, service: Arc<PositionLimitService>) -> Self {
        self.position_limit_service = Some(service);
        self
    }

    pub fn build(self) -> OrderService {
        OrderService {
            repo: self.repo,
            wallet_service: self.wallet_service,
            asset_service: self.asset_service,
            tx_manager: self.tx_manager,
            matching_gateway: self.matching_gateway,
            position_limit_service: self.position_limit_service,
        }
    }
}

impl OrderService {
    pub fn builder(
        repo: Arc<dyn OrderRepository>,
        wallet_service: Arc<WalletService>,
        asset_service: Arc<AssetService>,
    ) -> OrderServiceBuilder {
        OrderServiceBuilder::new(repo, wallet_service, asset_service)
    }

    pub async fn create_order(&self, order: Order) -> Result<Order> {
        // Validate Instrument first
        let instr_uuid = order.instrument_id.to_string();

        if order.quantity <= Decimal::ZERO {
            return Err(AppError::ValidationError(
                "Order quantity must be positive".into(),
            ));
        }
        if order.price <= Decimal::ZERO && order.r#type == OrderType::Limit {
            return Err(AppError::ValidationError(
                "Order price must be positive for limit orders".into(),
            ));
        }

        if self
            .asset_service
            .get_instrument(&instr_uuid)
            .await?
            .is_none()
        {
            return Err(AppError::InvalidInstrument(instr_uuid));
        }

        if let Ok(Some(existing)) = self.repo.get(order.id).await {
            // Idempotency check
            tracing::info!(order_id = %order.id, "Order already exists, skipping creation");
            return Ok(existing);
        }

        // --- Position Limits Check ---
        if let Some(pos_limit) = &self.position_limit_service {
            // 1. Max Order Size Check
            // Need atomic units for BASE asset
            if let Some(instr) = self
                .asset_service
                .get_instrument(&order.instrument_id.to_string())
                .await?
            {
                if let Some(base_asset) = self
                    .asset_service
                    .get_asset(instr.underlying_asset_id)
                    .await?
                {
                    let scale = Decimal::from(10).powi(base_asset.decimals as i64);
                    let qty_atomic = (order.quantity * scale).floor();
                    pos_limit.check_order_size(qty_atomic)?;
                }
            }
        }

        let created_order = if let Some(tx_manager) = &self.tx_manager {
            let mut tx = tx_manager.begin().await?;

            // Bypass RLS for system operations if needed, or rely on service user
            self.validate_and_reserve_funds_with_tx(&mut *tx, &order)
                .await?;
            let o = self.repo.create_with_tx(&mut *tx, order.clone()).await?;

            tx.commit().await?;
            o
        } else {
            // InMemory for Testing scenarios - no transactions, but we still want to validate funds
            self.validate_and_reserve_funds(&order).await?;
            self.repo.create(order.clone()).await?
        };

        // Side Effect: Push to Matching Engine
        // Note: Ideally this should be part of the transaction via Outbox pattern to ensure atomicity,
        // but for now, we do it after commit. If this fails, the order is in Ledger but not Matching (inconsistent).
        // The Matching Engine's "RecoverState" from Ledger fixes this eventual consistency issue.
        if let Some(gateway) = &self.matching_gateway {
            if let Err(e) = gateway.place_order(&created_order).await {
                tracing::error!(order_id = %created_order.id, error = %e, "Failed to push order to matching engine");
                // We don't fail the request because the order is persisted and funds locked.
                // A background reconciliation process (or matching engine recovery) will pick it up.
            }
        }

        Ok(created_order)
    }

    pub async fn get_order(&self, id: Uuid) -> Result<Option<Order>> {
        self.repo.get(id).await
    }

    pub async fn list_open_orders(&self) -> Result<Vec<Order>> {
        self.repo.list_open().await
    }

    pub async fn cancel_order(&self, id: Uuid) -> Result<()> {
        if let Some(tx_manager) = &self.tx_manager {
            let mut tx = tx_manager.begin().await?;
            // Use explicit locking to prevent double release or status race
            if let Some(order) = self.repo.get_for_update(&mut *tx, id).await? {
                if order.status == OrderStatus::Open || order.status == OrderStatus::PartialFill {
                    self.process_funds_with_tx(&mut *tx, &order, false).await?;
                    self.repo
                        .update_status_with_tx(&mut *tx, id, OrderStatus::Cancelled)
                        .await?;
                }
            }
            tx.commit().await?;
        } else {
            // Fallback for non-transactional (test) environments
            if let Some(order) = self.repo.get(id).await? {
                if order.status == OrderStatus::Open || order.status == OrderStatus::PartialFill {
                    self.release_funds(&order).await?;
                    self.repo.update_status(id, OrderStatus::Cancelled).await?;
                }
            }
        }
        Ok(())
    }

    // --- Fund Management ---

    pub async fn validate_and_reserve_funds(&self, order: &Order) -> Result<()> {
        self.process_funds(order, true).await
    }

    pub async fn validate_and_reserve_funds_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        order: &Order,
    ) -> Result<()> {
        self.process_funds_with_tx(tx, order, true).await
    }

    async fn release_funds(&self, order: &Order) -> Result<()> {
        self.process_funds(order, false).await
    }

    /// Unified logic for locking (reserve) and unlocking (release) funds.
    async fn process_funds(&self, order: &Order, is_reservation: bool) -> Result<()> {
        if let Some((asset_id, amount_atomic)) = self.calculate_fund_requirement(order).await? {
            self.update_wallet_balance(order.account_id, asset_id, amount_atomic, is_reservation)
                .await?;
        }
        Ok(())
    }

    async fn process_funds_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        order: &Order,
        is_reservation: bool,
    ) -> Result<()> {
        if let Some((asset_id, amount_atomic)) = self.calculate_fund_requirement(order).await? {
            self.update_wallet_balance_with_tx(
                tx,
                order.account_id,
                asset_id,
                amount_atomic,
                is_reservation,
            )
            .await?;
        }
        Ok(())
    }

    /// Calculates which asset and how much of it (in atomic units) needs to be locked/released.
    async fn calculate_fund_requirement(&self, order: &Order) -> Result<Option<(String, Decimal)>> {
        let remaining_qty = order.quantity - order.filled_quantity;
        if remaining_qty <= Decimal::ZERO {
            return Ok(None);
        }

        let instr_uuid = order.instrument_id.to_string();

        let instrument = match self.asset_service.get_instrument(&instr_uuid).await? {
            Some(i) => i,
            None => {
                tracing::warn!(instrument_id = %instr_uuid, "Instrument not found, skipping balance check/update");
                return Ok(None);
            }
        };

        // Delegate to Instrument Handler
        let handler = InstrumentHandlerFactory::get_handler(&instrument.r#type);

        let asset_id = handler.identify_collateral_asset(order, &instrument)?;
        let raw_amount = handler.calculate_raw_collateral_amount(order, &instrument)?;

        // Fetch asset to get decimals for scaling
        let asset_uuid = Uuid::parse_str(&asset_id)
            .map_err(|_| AppError::ValidationError("Invalid asset ID".into()))?;
        let asset = self
            .asset_service
            .get_asset(asset_uuid)
            .await?
            .ok_or_else(|| AppError::NotFound(format!("Asset {} not found", asset_id)))?;

        let scale_factor = Decimal::from(10).powi(asset.decimals as i64);
        let amount_atomic = (raw_amount * scale_factor).floor();

        Ok(Some((asset_id, amount_atomic)))
    }

    /// Performs the actual wallet update: locking or releasing the specified atomic amount.
    async fn update_wallet_balance(
        &self,
        account_id: Uuid,
        asset_id: String,
        amount_atomic: Decimal,
        is_reservation: bool,
    ) -> Result<()> {
        let account_uuid = account_id.to_string();

        let wallet_opt = self
            .wallet_service
            .get_wallet_by_account_and_asset(&account_uuid, &asset_id)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;

        self.apply_balance_update(wallet_opt, amount_atomic, is_reservation)
            .await
    }

    async fn update_wallet_balance_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        account_id: Uuid,
        asset_id: String,
        amount_atomic: Decimal,
        is_reservation: bool,
    ) -> Result<()> {
        let account_uuid: String = account_id.to_string();

        let wallet_opt = self
            .wallet_service
            .get_wallet_by_account_and_asset_for_update(tx, &account_uuid, &asset_id)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;

        if let Some(mut wallet) = wallet_opt {
            Self::mutate_wallet_balance(&mut wallet, amount_atomic, is_reservation)?;
            self.wallet_service
                .update_wallet_with_tx(tx, wallet)
                .await
                .map_err(|e| AppError::Internal(e.to_string()))?;
        } else if is_reservation {
            return Err(AppError::InsufficientFunds {
                asset: asset_id,
                required: amount_atomic.to_string(),
                available: "0".to_string(),
            });
        }
        Ok(())
    }

    async fn apply_balance_update(
        &self,
        wallet_opt: Option<crate::domain::wallets::Wallet>,
        amount_atomic: Decimal,
        is_reservation: bool,
    ) -> Result<()> {
        if let Some(mut wallet) = wallet_opt {
            Self::mutate_wallet_balance(&mut wallet, amount_atomic, is_reservation)?;
            self.wallet_service
                .update_wallet(wallet)
                .await
                .map_err(|e| AppError::Internal(e.to_string()))?;
        } else if is_reservation {
            // Note: In real app we should thread the asset_id here to give better error
            return Err(AppError::ValidationError(
                "Wallet for required asset not found in account".to_string(),
            ));
        }
        Ok(())
    }

    fn mutate_wallet_balance(
        wallet: &mut crate::domain::wallets::Wallet,
        amount_atomic: Decimal,
        is_reservation: bool,
    ) -> Result<()> {
        let available = wallet.available;
        let _locked = wallet.locked;

        if is_reservation {
            if available < amount_atomic {
                return Err(AppError::InsufficientFunds {
                    asset: wallet.asset_id.to_string(),
                    required: amount_atomic.to_string(),
                    available: available.to_string(),
                });
            }
            wallet.available -= amount_atomic;
            wallet.locked += amount_atomic;
        } else {
            wallet.available += amount_atomic;
            wallet.locked -= amount_atomic;
        }

        wallet.updated_at = chrono::Utc::now();
        Ok(())
    }

    // --- Order Updates ---

    pub async fn update_status_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        order_id_str: &str,
        trade_qty: Decimal,
    ) -> Result<()> {
        let order_uuid = self.parse_uuid(order_id_str)?;
        let updated_order = self
            .repo
            .increment_filled_amount_with_tx(tx, order_uuid, trade_qty)
            .await?;

        let status = self.determine_status(updated_order.filled_quantity, updated_order.quantity);
        self.repo
            .update_status_with_tx(tx, order_uuid, status)
            .await?;
        Ok(())
    }

    pub async fn update_status(&self, order_id_str: &str, trade_qty: Decimal) -> Result<()> {
        let order_uuid = self.parse_uuid(order_id_str)?;
        let updated_order = self
            .repo
            .increment_filled_amount(order_uuid, trade_qty)
            .await?;

        let status = self.determine_status(updated_order.filled_quantity, updated_order.quantity);
        self.repo.update_status(order_uuid, status).await?;
        Ok(())
    }

    // --- Helpers ---

    fn parse_uuid(&self, id_str: &str) -> Result<Uuid> {
        Uuid::parse_str(id_str).map_err(|_| AppError::ValidationError("Invalid order ID".into()))
    }

    fn determine_status(&self, filled: Decimal, total: Decimal) -> OrderStatus {
        if filled >= total {
            OrderStatus::Filled
        } else {
            OrderStatus::PartialFill
        }
    }
}
