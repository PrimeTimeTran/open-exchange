use crate::error::{AppError, Result};
use crate::domain::fills::{Fill, FillRepository};
use crate::domain::orders::{Order, OrderRepository};
use crate::domain::wallets::{Wallet, WalletRepository};
use crate::domain::accounts::{Account, AccountRepository};
use uuid::Uuid;
pub mod instrument;
use rust_decimal::Decimal;
use std::sync::{Arc, Mutex};
use async_trait::async_trait;
use sqlx::{Transaction, Postgres};
pub use instrument::InMemoryInstrumentRepository;


// --- InMemoryAccountRepository ---

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
        self.accounts.lock().unwrap().push(account);
    }

    pub fn get_accounts(&self) -> Vec<Account> {
        self.accounts.lock().unwrap().clone()
    }
}

#[async_trait]
impl AccountRepository for InMemoryAccountRepository {
    async fn create(&self, account: Account) -> Result<Account> {
        let mut accounts = self.accounts.lock().unwrap();
        accounts.push(account.clone());
        Ok(account)
    }

    async fn get(&self, id: Uuid) -> Result<Option<Account>> {
        let accounts = self.accounts.lock().unwrap();
        Ok(accounts.iter().find(|a| a.id == id).cloned())
    }

    async fn update(&self, account: Account) -> Result<Account> {
        let mut accounts = self.accounts.lock().unwrap();
        if let Some(pos) = accounts.iter().position(|a| a.id == account.id) {
            accounts[pos] = account.clone();
            Ok(account)
        } else {
            Err(AppError::NotFound(format!("Account {} not found", account.id)))
        }
    }

    async fn delete(&self, id: Uuid) -> Result<()> {
        let mut accounts = self.accounts.lock().unwrap();
        if let Some(pos) = accounts.iter().position(|a| a.id == id) {
            accounts.remove(pos);
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Account {} not found", id)))
        }
    }

    async fn list_by_user(&self, user_id: &str) -> Result<Vec<Account>> {
        let accounts = self.accounts.lock().unwrap();
        Ok(accounts.iter().filter(|a| a.user_id == user_id).cloned().collect())
    }

    async fn get_by_name(&self, name: &str) -> Result<Option<Account>> {
        let accounts = self.accounts.lock().unwrap();
        Ok(accounts.iter().find(|a| a.name == name).cloned())
    }

    async fn list_all(&self) -> Result<Vec<Account>> {
        Ok(self.accounts.lock().unwrap().clone())
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
        self.orders.lock().unwrap().push(order);
    }
}

#[async_trait]
impl OrderRepository for InMemoryOrderRepository {
    async fn create(&self, order: Order) -> Result<Order> {
        let mut orders = self.orders.lock().unwrap();
        orders.push(order.clone());
        Ok(order)
    }

    async fn create_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, order: Order) -> Result<Order> {
        self.create(order).await
    }

    async fn get(&self, id: Uuid) -> Result<Option<Order>> {
        let orders = self.orders.lock().unwrap();
        Ok(orders.iter().find(|o| o.id == id).cloned())
    }

    async fn update_status(&self, id: Uuid, status: String) -> Result<()> {
        let mut orders = self.orders.lock().unwrap();
        if let Some(order) = orders.iter_mut().find(|o| o.id == id) {
            order.status = status;
            order.updated_at = chrono::Utc::now();
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Order {} not found", id)))
        }
    }

    async fn update_status_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, id: Uuid, status: String) -> Result<()> {
        self.update_status(id, status).await
    }

    async fn update_filled_amount(&self, id: Uuid, filled: Decimal) -> Result<()> {
        let mut orders = self.orders.lock().unwrap();
        if let Some(order) = orders.iter_mut().find(|o| o.id == id) {
            order.filled_quantity = filled;
            order.updated_at = chrono::Utc::now();
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Order {} not found", id)))
        }
    }

    async fn update_filled_amount_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, id: Uuid, filled: Decimal) -> Result<()> {
        self.update_filled_amount(id, filled).await
    }

    async fn increment_filled_amount(&self, id: Uuid, amount: Decimal) -> Result<Order> {
        let mut orders = self.orders.lock().unwrap();
        if let Some(order) = orders.iter_mut().find(|o| o.id == id) {
            order.filled_quantity += amount;
            order.updated_at = chrono::Utc::now();
            Ok(order.clone())
        } else {
            Err(AppError::NotFound(format!("Order {} not found", id)))
        }
    }

    async fn increment_filled_amount_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, id: Uuid, amount: Decimal) -> Result<Order> {
        self.increment_filled_amount(id, amount).await
    }

    async fn list_open(&self) -> Result<Vec<Order>> {
        let orders = self.orders.lock().unwrap();
        // Assuming "open", "partial_fill", "new" are considered open
        Ok(orders.iter()
            .filter(|o| o.status == "open" || o.status == "partial_fill" || o.status == "new")
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
        self.wallets.lock().unwrap().push(wallet);
    }
}

#[async_trait]
impl WalletRepository for InMemoryWalletRepository {
    async fn create(&self, wallet: Wallet) -> Result<Wallet> {
        let mut wallets = self.wallets.lock().unwrap();
        wallets.push(wallet.clone());
        Ok(wallet)
    }

    async fn get(&self, id: Uuid) -> Result<Option<Wallet>> {
        let wallets = self.wallets.lock().unwrap();
        Ok(wallets.iter().find(|w| w.id == id.to_string()).cloned())
    }

    async fn get_by_account_and_asset(&self, account_id: &str, asset_id: &str) -> Result<Option<Wallet>> {
        let wallets = self.wallets.lock().unwrap();
        Ok(wallets.iter().find(|w| w.account_id == account_id && w.asset_id == asset_id).cloned())
    }

    async fn get_by_account_and_asset_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, account_id: &str, asset_id: &str) -> Result<Option<Wallet>> {
        self.get_by_account_and_asset(account_id, asset_id).await
    }

    async fn update(&self, mut wallet: Wallet) -> Result<Wallet> {
        let mut wallets = self.wallets.lock().unwrap();
        if let Some(pos) = wallets.iter().position(|w| w.id == wallet.id) {
            let existing = &wallets[pos];
            if existing.version != wallet.version {
                return Err(AppError::OptimisticLockingError(format!("Wallet {} version mismatch (expected {}, found {})", wallet.id, wallet.version, existing.version)));
            }
            wallet.version += 1;
            wallet.updated_at = chrono::Utc::now().timestamp_millis();
            wallets[pos] = wallet.clone();
            Ok(wallet)
        } else {
            Err(AppError::NotFound(format!("Wallet {} not found", wallet.id)))
        }
    }

    async fn update_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, wallet: Wallet) -> Result<Wallet> {
        self.update(wallet).await
    }

    async fn delete(&self, id: Uuid) -> Result<()> {
        let mut wallets = self.wallets.lock().unwrap();
        if let Some(pos) = wallets.iter().position(|w| w.id == id.to_string()) {
            wallets.remove(pos);
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Wallet {} not found", id)))
        }
    }

    async fn list_by_account(&self, account_id: &str) -> Result<Vec<Wallet>> {
        let wallets = self.wallets.lock().unwrap();
        Ok(wallets.iter().filter(|w| w.account_id == account_id).cloned().collect())
    }
}

// --- InMemoryAssetRepository ---

use crate::infra::repositories::AssetRepository;
use crate::proto::common;

#[derive(Clone, Default, Debug)]
pub struct InMemoryAssetRepository {
    assets: Arc<Mutex<Vec<common::Asset>>>,
}

impl InMemoryAssetRepository {
    pub fn new() -> Self {
        Self {
            assets: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn add(&self, asset: common::Asset) {
        self.assets.lock().unwrap().push(asset);
    }
}

#[async_trait]
impl AssetRepository for InMemoryAssetRepository {
    async fn create(&self, asset: common::Asset) -> Result<common::Asset> {
        let mut assets = self.assets.lock().unwrap();
        assets.push(asset.clone());
        Ok(asset)
    }

    async fn get(&self, id: Uuid) -> Result<Option<common::Asset>> {
        let assets = self.assets.lock().unwrap();
        Ok(assets.iter().find(|a| a.id == id.to_string()).cloned())
    }

    async fn get_by_symbol(&self, symbol: &str) -> Result<Option<common::Asset>> {
        let assets = self.assets.lock().unwrap();
        Ok(assets.iter().find(|a| a.symbol == symbol).cloned())
    }

    async fn list(&self) -> Result<Vec<common::Asset>> {
        let assets = self.assets.lock().unwrap();
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
        self.fills.lock().unwrap().push(fill);
    }
}

#[async_trait]
impl FillRepository for InMemoryFillRepository {
    async fn create(&self, fill: Fill) -> Result<Fill> {
        let mut fills = self.fills.lock().unwrap();
        fills.push(fill.clone());
        Ok(fill)
    }

    async fn create_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, fill: Fill) -> Result<Fill> {
        self.create(fill).await
    }

    async fn list_by_order(&self, order_id: Uuid) -> Result<Vec<Fill>> {
        let fills = self.fills.lock().unwrap();
        Ok(fills.iter().filter(|f| f.order_id == order_id).cloned().collect())
    }

    async fn list_by_instrument_and_time(
        &self,
        instrument_id: Uuid,
        start_time: chrono::DateTime<chrono::Utc>,
        end_time: chrono::DateTime<chrono::Utc>,
    ) -> Result<Vec<Fill>> {
        let fills = self.fills.lock().unwrap();
        Ok(fills.iter()
            .filter(|f| f.instrument_id == instrument_id && f.created_at >= start_time && f.created_at <= end_time)
            .cloned()
            .collect())
    }
}

// --- InMemoryLedgerRepository ---

use crate::domain::ledger::repository::LedgerRepository;
use crate::proto::common::{LedgerEvent, LedgerEntry, Trade};

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
        self.events.lock().unwrap().clone()
    }
    
    pub fn get_entries(&self) -> Vec<LedgerEntry> {
        self.entries.lock().unwrap().clone()
    }
}

#[async_trait]
impl LedgerRepository for InMemoryLedgerRepository {
    async fn save_event(&self, event: LedgerEvent) -> Result<LedgerEvent> {
        self.events.lock().unwrap().push(event.clone());
        Ok(event)
    }

    async fn save_event_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, event: LedgerEvent) -> Result<LedgerEvent> {
        self.save_event(event).await
    }

    async fn save_entries(&self, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>> {
        let mut store = self.entries.lock().unwrap();
        store.extend(entries.clone());
        Ok(entries)
    }

    async fn save_entries_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>> {
        self.save_entries(entries).await
    }

    async fn save_trade_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, trade: Trade) -> Result<Trade> {
        Ok(trade)
    }

    async fn save_trade(&self, trade: Trade) -> Result<Trade> {
        Ok(trade)
    }

    async fn list_events(&self) -> Result<Vec<LedgerEvent>> {
        Ok(self.events.lock().unwrap().clone())
    }

    async fn list_entries(&self) -> Result<Vec<LedgerEntry>> {
        Ok(self.entries.lock().unwrap().clone())
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
        self.trades.lock().unwrap().clone()
    }
}

#[async_trait]
impl TradeRepository for InMemoryTradeRepository {
    async fn create(&self, trade: Trade) -> Result<Trade> {
        self.trades.lock().unwrap().push(trade.clone());
        Ok(trade)
    }

    async fn create_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, trade: Trade) -> Result<Trade> {
        self.create(trade).await
    }

    async fn get(&self, id: &str) -> Result<Option<Trade>> {
        let trades = self.trades.lock().unwrap();
        Ok(trades.iter().find(|t| t.id == id).cloned())
    }

    async fn get_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, id: &str) -> Result<Option<Trade>> {
        self.get(id).await
    }
}
