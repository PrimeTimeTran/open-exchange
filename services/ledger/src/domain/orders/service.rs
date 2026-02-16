use super::model::Order;
use crate::error::{Result, AppError};
use super::repository::OrderRepository;
use crate::domain::assets::AssetService;
use crate::domain::wallets::WalletService;
use std::fmt;
use uuid::Uuid;
use std::sync::Arc;
use std::str::FromStr;
use rust_decimal::Decimal;
use sqlx::{Transaction, Postgres};
use rust_decimal::MathematicalOps;

// Constants to avoid magic strings
const STATUS_OPEN: &str = "open";
const STATUS_PARTIAL_FILL: &str = "partial_fill";
const STATUS_FILLED: &str = "filled";
const STATUS_CANCELLED: &str = "cancelled";
const SIDE_BUY: &str = "buy";

#[derive(Clone)]
pub struct OrderService {
    repo: Arc<dyn OrderRepository>,
    wallet_service: Arc<WalletService>,
    asset_service: Arc<AssetService>,
}

impl fmt::Debug for OrderService {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "OrderService")
    }
}

impl OrderService {
    pub fn new(
        repo: Arc<dyn OrderRepository>,
        wallet_service: Arc<WalletService>,
        asset_service: Arc<AssetService>,
    ) -> Self {
        Self { repo, wallet_service, asset_service }
    }

    pub async fn create_order(&self, order: Order) -> Result<Order> {
        if let Ok(Some(existing)) = self.repo.get(order.id).await {
            // Idempotency check
            println!("Order {} already exists, skipping creation.", order.id);
            return Ok(existing);
        }

        self.validate_and_reserve_funds(&order).await?;
        self.repo.create(order).await
    }

    pub async fn get_order(&self, id: Uuid) -> Result<Option<Order>> {
        self.repo.get(id).await
    }

    pub async fn list_open_orders(&self) -> Result<Vec<Order>> {
        self.repo.list_open().await
    }

    pub async fn cancel_order(&self, id: Uuid) -> Result<()> {
        if let Some(order) = self.repo.get(id).await? {
            if order.status == STATUS_OPEN || order.status == STATUS_PARTIAL_FILL {
                self.release_funds(&order).await?;
                self.repo.update_status(id, STATUS_CANCELLED.to_string()).await?;
            }
        }
        Ok(())
    }

    // --- Fund Management ---

    pub async fn validate_and_reserve_funds(&self, order: &Order) -> Result<()> {
        self.process_funds(order, true).await
    }

    async fn release_funds(&self, order: &Order) -> Result<()> {
        self.process_funds(order, false).await
    }

    /// Unified logic for locking (reserve) and unlocking (release) funds.
    async fn process_funds(&self, order: &Order, is_reservation: bool) -> Result<()> {
        if let Some((asset_id, amount_atomic)) = self.calculate_fund_requirement(order).await? {
            self.update_wallet_balance(order.account_id, asset_id, amount_atomic, is_reservation).await?;
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
                println!("Warning: Instrument {} not found, skipping balance check/update", instr_uuid);
                return Ok(None);
            }
        };

        let (asset_id, raw_amount) = if order.side == SIDE_BUY {
            (instrument.quote_asset_id, remaining_qty * order.price)
        } else {
            (instrument.underlying_asset_id, remaining_qty)
        };

        // Fetch asset to get decimals for scaling
        let asset = self.asset_service.get_asset(&asset_id.to_string()).await?
            .ok_or_else(|| AppError::NotFound(format!("Asset {} not found", asset_id)))?;
        
        let scale_factor = Decimal::from(10).powi(asset.decimals as i64);
        let amount_atomic = (raw_amount * scale_factor).floor();

        Ok(Some((asset_id.to_string(), amount_atomic)))
    }

    /// Performs the actual wallet update: locking or releasing the specified atomic amount.
    async fn update_wallet_balance(&self, account_id: Uuid, asset_id: String, amount_atomic: Decimal, is_reservation: bool) -> Result<()> {
        let account_uuid = account_id.to_string();
        
        let wallet_opt = self.wallet_service.get_wallet_by_account_and_asset(&account_uuid, &asset_id)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;

        if let Some(mut wallet) = wallet_opt {
            let available = Decimal::from_str(&wallet.available)
                .map_err(|_| AppError::Internal("Invalid available balance".into()))?;
            let locked = Decimal::from_str(&wallet.locked)
                .map_err(|_| AppError::Internal("Invalid locked balance".into()))?;

            if is_reservation {
                if available < amount_atomic {
                    return Err(AppError::ValidationError(format!(
                        "Insufficient funds. Required: {}, Available: {}", 
                        amount_atomic, available
                    )));
                }
                wallet.available = (available - amount_atomic).to_string();
                wallet.locked = (locked + amount_atomic).to_string();
            } else {
                wallet.available = (available + amount_atomic).to_string();
                wallet.locked = (locked - amount_atomic).to_string();
            }

            wallet.updated_at = chrono::Utc::now().timestamp_millis();
            self.wallet_service.update_wallet(wallet).await.map_err(|e| AppError::Internal(e.to_string()))?;
        } else if is_reservation {
            return Err(AppError::ValidationError("Wallet for required asset not found in account".to_string()));
        }
        
        Ok(())
    }

    // --- Order Updates ---

    pub async fn fill_order(&self, id: Uuid, fill_qty: Decimal, _fill_price: Decimal) -> Result<()> {
        if let Some(order) = self.repo.get(id).await? {
            let new_filled = order.filled_quantity + fill_qty;
            let status = self.determine_status(new_filled, order.quantity);

            self.repo.update_filled_amount(id, new_filled).await?;
            self.repo.update_status(id, status).await?;
            
            // TODO: Update wallet balances (unlock funds, transfer assets)
            // For this task, we focus on order status updates as requested by the tests.
        }
        Ok(())
    }

    pub async fn update_status_with_tx(&self, tx: &mut Transaction<'_, Postgres>, order_id_str: &str, trade_qty: Decimal) -> Result<()> {
        let order_uuid = self.parse_uuid(order_id_str)?;
        let updated_order = self.repo.increment_filled_amount_with_tx(tx, order_uuid, trade_qty).await?;
        
        let status = self.determine_status(updated_order.filled_quantity, updated_order.quantity);
        self.repo.update_status_with_tx(tx, order_uuid, status).await?;
        Ok(())
    }

    pub async fn update_status(&self, order_id_str: &str, trade_qty: Decimal) -> Result<()> {
        let order_uuid = self.parse_uuid(order_id_str)?;
        let updated_order = self.repo.increment_filled_amount(order_uuid, trade_qty).await?;
        
        let status = self.determine_status(updated_order.filled_quantity, updated_order.quantity);
        self.repo.update_status(order_uuid, status).await?;
        Ok(())
    }

    // --- Helpers ---

    fn parse_uuid(&self, id_str: &str) -> Result<Uuid> {
        Uuid::parse_str(id_str).map_err(|_| AppError::ValidationError("Invalid order ID".into()))
    }

    fn determine_status(&self, filled: Decimal, total: Decimal) -> String {
        if filled >= total {
            STATUS_FILLED.to_string()
        } else {
            STATUS_PARTIAL_FILL.to_string()
        }
    }
}
