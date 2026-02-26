use crate::domain::accounts::{Account, AccountRepository};
use crate::domain::assets::model::Asset;
use crate::domain::fills::{Fill, FillRepository};
use crate::domain::orders::{Order, OrderRepository, OrderStatus};
use crate::domain::trade::model::Trade;
use crate::domain::transaction::RepositoryTransaction;
use crate::domain::wallets::{Wallet, WalletRepository};
use crate::error::{AppError, Result};
pub use instrument::InMemoryInstrumentRepository;
use uuid::Uuid;
pub mod instrument;
pub mod withdrawal;
use async_trait::async_trait;
use rust_decimal::Decimal;
use std::sync::{Arc, Mutex};

// --- InMemoryOrderRepository ---

#[derive(Clone, Default)]
pub struct InMemoryAccountRepository {
    accounts: Arc<Mutex<Vec<Account>>>,
}

impl InMemoryAccountRepository {
    pub fn new() -> Self {
        Self {
            accounts: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn add(&self, account: Account) {
        if let Ok(mut accounts) = self.accounts.lock() {
            accounts.push(account);
        }
    }

    pub fn get_accounts(&self) -> Vec<Account> {
        self.accounts
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .clone()
    }
}

#[async_trait]
impl AccountRepository for InMemoryAccountRepository {
    async fn create(&self, account: Account) -> Result<Account> {
        let mut accounts = self
            .accounts
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock accounts: {}", e)))?;
        accounts.push(account.clone());
        Ok(account)
    }

    async fn get(&self, id: Uuid) -> Result<Option<Account>> {
        let accounts = self
            .accounts
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock accounts: {}", e)))?;
        Ok(accounts.iter().find(|a| a.id == id).cloned())
    }

    async fn update(&self, account: Account) -> Result<Account> {
        let mut accounts = self
            .accounts
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock accounts: {}", e)))?;
        if let Some(pos) = accounts.iter().position(|a| a.id == account.id) {
            accounts[pos] = account.clone();
            Ok(account)
        } else {
            Err(AppError::NotFound(format!(
                "Account {} not found",
                account.id
            )))
        }
    }

    async fn delete(&self, id: Uuid) -> Result<()> {
        let mut accounts = self
            .accounts
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock accounts: {}", e)))?;
        if let Some(pos) = accounts.iter().position(|a| a.id == id) {
            accounts.remove(pos);
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Account {} not found", id)))
        }
    }

    async fn list_by_user(&self, user_id: &str) -> Result<Vec<Account>> {
        let accounts = self
            .accounts
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock accounts: {}", e)))?;
        Ok(accounts
            .iter()
            .filter(|a| a.user_id == user_id)
            .cloned()
            .collect())
    }

    async fn get_by_name(&self, name: &str) -> Result<Option<Account>> {
        let accounts = self
            .accounts
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock accounts: {}", e)))?;
        Ok(accounts.iter().find(|a| a.name == name).cloned())
    }

    async fn list_all(&self) -> Result<Vec<Account>> {
        let accounts = self
            .accounts
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to lock accounts: {}", e)))?;
        Ok(accounts.clone())
    }
}

// --- InMemoryOrderRepository ---

#[derive(Clone, Default)]
pub struct InMemoryOrderRepository {
    orders: Arc<Mutex<Vec<Order>>>,
}

impl InMemoryOrderRepository {
    pub fn new() -> Self {
        Self {
            orders: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn add(&self, order: Order) {
        if let Ok(mut orders) = self.orders.lock() {
            if let Some(pos) = orders.iter().position(|o| o.id == order.id) {
                orders[pos] = order;
            } else {
                orders.push(order);
            }
        }
    }
}

#[async_trait]
impl OrderRepository for InMemoryOrderRepository {
    async fn create(&self, order: Order) -> Result<Order> {
        let mut orders = self
            .orders
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        orders.push(order.clone());
        Ok(order)
    }

    async fn create_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        order: Order,
    ) -> Result<Order> {
        self.create(order).await
    }

    async fn get(&self, id: Uuid) -> Result<Option<Order>> {
        let orders = self
            .orders
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(orders.iter().find(|o| o.id == id).cloned())
    }

    async fn get_for_update(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        id: Uuid,
    ) -> Result<Option<Order>> {
        self.get(id).await
    }

    async fn update_status(&self, id: Uuid, status: OrderStatus) -> Result<()> {
        let mut orders = self
            .orders
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        if let Some(order) = orders.iter_mut().find(|o| o.id == id) {
            order.status = status;
            order.updated_at = chrono::Utc::now();
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Order {} not found", id)))
        }
    }

    async fn update_status_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        id: Uuid,
        status: OrderStatus,
    ) -> Result<()> {
        self.update_status(id, status).await
    }

    async fn update_filled_amount(&self, id: Uuid, filled: Decimal) -> Result<()> {
        let mut orders = self
            .orders
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        if let Some(order) = orders.iter_mut().find(|o| o.id == id) {
            order.filled_quantity = filled;
            order.updated_at = chrono::Utc::now();
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Order {} not found", id)))
        }
    }

    async fn update_filled_amount_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        id: Uuid,
        filled: Decimal,
    ) -> Result<()> {
        self.update_filled_amount(id, filled).await
    }

    async fn increment_filled_amount(&self, id: Uuid, amount: Decimal) -> Result<Order> {
        let mut orders = self
            .orders
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        if let Some(order) = orders.iter_mut().find(|o| o.id == id) {
            order.filled_quantity += amount;
            order.updated_at = chrono::Utc::now();
            Ok(order.clone())
        } else {
            Err(AppError::NotFound(format!("Order {} not found", id)))
        }
    }

    async fn increment_filled_amount_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        id: Uuid,
        amount: Decimal,
    ) -> Result<Order> {
        self.increment_filled_amount(id, amount).await
    }

    async fn list_open(&self) -> Result<Vec<Order>> {
        let orders = self
            .orders
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        // Assuming "open", "partial_fill", "new" are considered open
        Ok(orders
            .iter()
            .filter(|o| {
                o.status == OrderStatus::Open
                    || o.status == OrderStatus::PartialFill
                    || o.status == OrderStatus::New
            })
            .cloned()
            .collect())
    }
}

// --- InMemoryWalletRepository ---

#[derive(Clone, Default, Debug)]
pub struct InMemoryWalletRepository {
    wallets: Arc<Mutex<Vec<Wallet>>>,
}

impl InMemoryWalletRepository {
    pub fn new() -> Self {
        Self {
            wallets: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn add(&self, wallet: Wallet) {
        if let Ok(mut wallets) = self.wallets.lock() {
            wallets.push(wallet);
        }
    }
}

#[async_trait]
impl WalletRepository for InMemoryWalletRepository {
    async fn create(&self, wallet: Wallet) -> Result<Wallet> {
        let mut wallets = self
            .wallets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        wallets.push(wallet.clone());
        Ok(wallet)
    }

    async fn get(&self, id: Uuid) -> Result<Option<Wallet>> {
        let wallets = self
            .wallets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(wallets.iter().find(|w| w.id == id.to_string()).cloned())
    }

    async fn get_by_account_and_asset(
        &self,
        account_id: &str,
        asset_id: &str,
    ) -> Result<Option<Wallet>> {
        let wallets = self
            .wallets
            .lock()
            .map_err(|_| AppError::Internal("Failed to lock wallets".into()))?;
        Ok(wallets
            .iter()
            .find(|w| w.account_id == account_id && w.asset_id == asset_id)
            .cloned())
    }

    async fn get_by_account_and_asset_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        account_id: &str,
        asset_id: &str,
    ) -> Result<Option<Wallet>> {
        self.get_by_account_and_asset(account_id, asset_id).await
    }

    async fn get_by_account_and_asset_for_update(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        account_id: &str,
        asset_id: &str,
    ) -> Result<Option<Wallet>> {
        self.get_by_account_and_asset(account_id, asset_id).await
    }

    async fn update(&self, mut wallet: Wallet) -> Result<Wallet> {
        let mut wallets = self
            .wallets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        if let Some(pos) = wallets.iter().position(|w| w.id == wallet.id) {
            let existing = &wallets[pos];
            if existing.version != wallet.version {
                return Err(AppError::OptimisticLockingError(format!(
                    "Wallet {} version mismatch (expected {}, found {})",
                    wallet.id, wallet.version, existing.version
                )));
            }
            wallet.version += 1;
            wallet.updated_at = chrono::Utc::now().timestamp_millis();
            wallets[pos] = wallet.clone();
            Ok(wallet)
        } else {
            Err(AppError::NotFound(format!(
                "Wallet {} not found",
                wallet.id
            )))
        }
    }

    async fn update_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        wallet: Wallet,
    ) -> Result<Wallet> {
        self.update(wallet).await
    }

    async fn delete(&self, id: Uuid) -> Result<()> {
        let mut wallets = self
            .wallets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        if let Some(pos) = wallets.iter().position(|w| w.id == id.to_string()) {
            wallets.remove(pos);
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Wallet {} not found", id)))
        }
    }

    async fn list_by_account(&self, account_id: &str) -> Result<Vec<Wallet>> {
        let wallets = self
            .wallets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(wallets
            .iter()
            .filter(|w| w.account_id == account_id)
            .cloned()
            .collect())
    }

    async fn list_by_asset(&self, asset_id: &str) -> Result<Vec<Wallet>> {
        let wallets = self
            .wallets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(wallets
            .iter()
            .filter(|w| w.asset_id == asset_id)
            .cloned()
            .collect())
    }
}

// --- InMemoryAssetRepository ---

use crate::infra::repositories::AssetRepository;

#[derive(Clone, Default, Debug)]
pub struct InMemoryAssetRepository {
    assets: Arc<Mutex<Vec<Asset>>>,
}

impl InMemoryAssetRepository {
    pub fn new() -> Self {
        Self {
            assets: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn add(&self, asset: Asset) {
        if let Ok(mut assets) = self.assets.lock() {
            assets.push(asset);
        }
    }
}

#[async_trait]
impl AssetRepository for InMemoryAssetRepository {
    async fn create(&self, asset: Asset) -> Result<Asset> {
        let mut assets = self
            .assets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        assets.push(asset.clone());
        Ok(asset)
    }

    async fn get(&self, id: Uuid) -> Result<Option<Asset>> {
        let assets = self
            .assets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(assets.iter().find(|a| a.id == id).cloned())
    }

    async fn get_by_symbol(&self, symbol: &str) -> Result<Option<Asset>> {
        let assets = self
            .assets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(assets.iter().find(|a| a.symbol == symbol).cloned())
    }

    async fn list(&self) -> Result<Vec<Asset>> {
        let assets = self
            .assets
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(assets.clone())
    }
}

// --- InMemoryFillRepository ---

#[derive(Clone, Default)]
pub struct InMemoryFillRepository {
    fills: Arc<Mutex<Vec<Fill>>>,
}

impl InMemoryFillRepository {
    pub fn new() -> Self {
        Self {
            fills: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn add(&self, fill: Fill) {
        if let Ok(mut fills) = self.fills.lock() {
            fills.push(fill);
        }
    }
}

#[async_trait]
impl FillRepository for InMemoryFillRepository {
    async fn create(&self, fill: Fill) -> Result<Fill> {
        let mut fills = self
            .fills
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        fills.push(fill.clone());
        Ok(fill)
    }

    async fn create_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        fill: Fill,
    ) -> Result<Fill> {
        self.create(fill).await
    }

    async fn list_by_order(&self, order_id: Uuid) -> Result<Vec<Fill>> {
        let fills = self
            .fills
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(fills
            .iter()
            .filter(|f| f.order_id == order_id)
            .cloned()
            .collect())
    }

    async fn list_by_instrument_and_time(
        &self,
        instrument_id: Uuid,
        start_time: chrono::DateTime<chrono::Utc>,
        end_time: chrono::DateTime<chrono::Utc>,
    ) -> Result<Vec<Fill>> {
        let fills = self
            .fills
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(fills
            .iter()
            .filter(|f| {
                f.instrument_id == instrument_id
                    && f.created_at >= start_time
                    && f.created_at <= end_time
            })
            .cloned()
            .collect())
    }
}

// --- InMemoryLedgerRepository ---

use crate::domain::ledger::model::{LedgerEntry, LedgerEvent};
use crate::domain::ledger::repository::LedgerRepository;

#[derive(Clone, Default, Debug)]
pub struct InMemoryLedgerRepository {
    events: Arc<Mutex<Vec<LedgerEvent>>>,
    entries: Arc<Mutex<Vec<LedgerEntry>>>,
}

impl InMemoryLedgerRepository {
    pub fn new() -> Self {
        Self {
            events: Arc::new(Mutex::new(Vec::new())),
            entries: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn get_events(&self) -> Vec<LedgerEvent> {
        self.events
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .clone()
    }

    pub fn get_entries(&self) -> Vec<LedgerEntry> {
        self.entries
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .clone()
    }
}

#[async_trait]
impl LedgerRepository for InMemoryLedgerRepository {
    async fn save_event(&self, event: LedgerEvent) -> Result<LedgerEvent> {
        self.events
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?
            .push(event.clone());
        Ok(event)
    }

    async fn save_event_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        event: LedgerEvent,
    ) -> Result<LedgerEvent> {
        self.save_event(event).await
    }

    async fn save_entries(&self, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>> {
        let mut store = self
            .entries
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        store.extend(entries.clone());
        Ok(entries)
    }

    async fn save_entries_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        entries: Vec<LedgerEntry>,
    ) -> Result<Vec<LedgerEntry>> {
        self.save_entries(entries).await
    }

    async fn save_trade_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        trade: Trade,
    ) -> Result<Trade> {
        Ok(trade)
    }

    async fn save_trade(&self, trade: Trade) -> Result<Trade> {
        Ok(trade)
    }

    async fn list_events(&self) -> Result<Vec<LedgerEvent>> {
        Ok(self
            .events
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?
            .clone())
    }

    async fn list_entries(&self) -> Result<Vec<LedgerEntry>> {
        Ok(self
            .entries
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?
            .clone())
    }
}

// --- InMemoryTradeRepository ---

use crate::domain::trade::TradeRepository;

#[derive(Clone, Default, Debug)]
pub struct InMemoryTradeRepository {
    trades: Arc<Mutex<Vec<Trade>>>,
}

impl InMemoryTradeRepository {
    pub fn new() -> Self {
        Self {
            trades: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn get_trades(&self) -> Vec<Trade> {
        self.trades
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .clone()
    }
}

#[async_trait]
impl TradeRepository for InMemoryTradeRepository {
    async fn create(&self, trade: Trade) -> Result<Trade> {
        self.trades
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?
            .push(trade.clone());
        Ok(trade)
    }

    async fn create_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        trade: Trade,
    ) -> Result<Trade> {
        self.create(trade).await
    }

    async fn get(&self, id: Uuid) -> Result<Option<Trade>> {
        let trades = self
            .trades
            .lock()
            .map_err(|e| AppError::Internal(format!("Failed to acquire lock: {}", e)))?;
        Ok(trades.iter().find(|t| t.id == id).cloned())
    }

    async fn get_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        id: Uuid,
    ) -> Result<Option<Trade>> {
        self.get(id).await
    }
}
