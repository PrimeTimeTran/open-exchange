use uuid::Uuid;
use chrono::Utc;
use ledger::error::Result;
use std::sync::{Arc, Mutex};
use async_trait::async_trait;
use ledger::domain::orders::model::Order;
use ledger::proto::common::{Trade, Instrument};
use ledger::domain::orders::repository::OrderRepository;
use ledger::infra::repositories::{InstrumentRepository, AssetRepository};
use ledger::domain::ledger::service::LedgerService;
use ledger::domain::wallets::WalletService;
use ledger::domain::settlement::service::SettlementService;
use ledger::domain::orders::service::OrderService;
use ledger::domain::assets::AssetService;
use ledger::domain::fills::service::FillService;
use rust_decimal::Decimal;
use rust_decimal::prelude::FromPrimitive;
use sqlx::{Transaction, Postgres};

#[derive(Debug)]
pub struct MockOrderRepository {
    orders: Mutex<Vec<Order>>,
}

impl MockOrderRepository {
    pub fn new() -> Self {
        Self { orders: Mutex::new(Vec::new()) }
    }

    pub fn add(&self, order: Order) {
        self.orders.lock().unwrap().push(order);
    }
}

#[async_trait]
impl OrderRepository for MockOrderRepository {
    async fn create(&self, order: Order) -> Result<Order> {
        self.add(order.clone());
        Ok(order)
    }

    async fn get(&self, id: Uuid) -> Result<Option<Order>> {
        let orders = self.orders.lock().unwrap();
        Ok(orders.iter().find(|o| o.id == id).cloned())
    }

    async fn update_status(&self, _id: Uuid, _status: String) -> Result<()> {
        Ok(())
    }

    async fn update_status_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, id: Uuid, status: String) -> Result<()> {
        self.update_status(id, status).await
    }

    async fn update_filled_amount(&self, id: Uuid, filled: Decimal) -> Result<()> {
        let mut orders = self.orders.lock().unwrap();
        if let Some(order) = orders.iter_mut().find(|o| o.id == id) {
            order.filled_quantity = filled;
        }
        Ok(())
    }

    async fn update_filled_amount_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, id: Uuid, filled: Decimal) -> Result<()> {
        self.update_filled_amount(id, filled).await
    }

    async fn list_open(&self) -> Result<Vec<Order>> {
        Ok(vec![])
    }
}

#[derive(Debug)]
pub struct MockInstrumentRepository {
    instruments: Mutex<Vec<Instrument>>,
}

impl MockInstrumentRepository {
    pub fn new() -> Self {
        Self { instruments: Mutex::new(Vec::new()) }
    }

    pub fn add(&self, instrument: Instrument) {
        self.instruments.lock().unwrap().push(instrument);
    }
}

#[async_trait]
impl InstrumentRepository for MockInstrumentRepository {
    async fn get(&self, id: Uuid) -> Result<Option<Instrument>> {
        let instruments = self.instruments.lock().unwrap();
        Ok(instruments.iter().find(|i| i.id == id.to_string()).cloned())
    }

    async fn get_by_symbol(&self, symbol: &str) -> Result<Option<Instrument>> {
        let instruments = self.instruments.lock().unwrap();
        Ok(instruments.iter().find(|i| i.symbol == symbol).cloned())
    }

    async fn list(&self) -> Result<Vec<Instrument>> {
        Ok(vec![])
    }

    async fn create(&self, instrument: Instrument) -> Result<Instrument> {
        self.add(instrument.clone());
        Ok(instrument)
    }
}

#[derive(Debug)]
pub struct MockAssetRepository {
    assets: Mutex<Vec<ledger::proto::common::Asset>>,
}

impl MockAssetRepository {
    pub fn new() -> Self {
        Self { assets: Mutex::new(Vec::new()) }
    }

    #[allow(dead_code)]
    pub fn add(&self, asset: ledger::proto::common::Asset) {
        self.assets.lock().unwrap().push(asset);
    }
}

#[async_trait]
impl AssetRepository for MockAssetRepository {
    async fn create(&self, asset: ledger::proto::common::Asset) -> Result<ledger::proto::common::Asset> {
        self.assets.lock().unwrap().push(asset.clone());
        Ok(asset)
    }

    async fn get(&self, id: Uuid) -> Result<Option<ledger::proto::common::Asset>> {
        let assets = self.assets.lock().unwrap();
        Ok(assets.iter().find(|a| a.id == id.to_string()).cloned())
    }

    async fn get_by_symbol(&self, symbol: &str) -> Result<Option<ledger::proto::common::Asset>> {
        let assets = self.assets.lock().unwrap();
        Ok(assets.iter().find(|a| a.symbol == symbol).cloned())
    }

    async fn list(&self) -> Result<Vec<ledger::proto::common::Asset>> {
        let assets = self.assets.lock().unwrap();
        Ok(assets.clone())
    }
}

#[derive(Debug)]
pub struct MockWalletRepository {
    wallets: Mutex<Vec<ledger::domain::wallets::Wallet>>,
}

impl MockWalletRepository {
    pub fn new() -> Self {
        Self { wallets: Mutex::new(Vec::new()) }
    }

    #[allow(dead_code)]
    pub fn add(&self, wallet: ledger::domain::wallets::Wallet) {
        self.wallets.lock().unwrap().push(wallet);
    }
}

#[async_trait]
impl ledger::domain::wallets::WalletRepository for MockWalletRepository {
    async fn create(&self, wallet: ledger::domain::wallets::Wallet) -> Result<ledger::domain::wallets::Wallet> {
        self.wallets.lock().unwrap().push(wallet.clone());
        Ok(wallet)
    }

    async fn get(&self, id: Uuid) -> Result<Option<ledger::domain::wallets::Wallet>> {
        let wallets = self.wallets.lock().unwrap();
        Ok(wallets.iter().find(|w| w.id == id.to_string()).cloned())
    }

    async fn get_by_account_and_asset(&self, account_id: &str, asset_id: &str) -> Result<Option<ledger::domain::wallets::Wallet>> {
        let wallets = self.wallets.lock().unwrap();
        Ok(wallets.iter().find(|w| w.account_id == account_id && w.asset_id == asset_id).cloned())
    }

    async fn get_by_account_and_asset_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, account_id: &str, asset_id: &str) -> Result<Option<ledger::domain::wallets::Wallet>> {
        self.get_by_account_and_asset(account_id, asset_id).await
    }

    async fn update(&self, wallet: ledger::domain::wallets::Wallet) -> Result<ledger::domain::wallets::Wallet> {
        let mut wallets = self.wallets.lock().unwrap();
        if let Some(w) = wallets.iter_mut().find(|w| w.id == wallet.id) {
            *w = wallet.clone();
            Ok(wallet)
        } else {
            Err(ledger::error::AppError::NotFound("Wallet not found".to_string()))
        }
    }

    async fn update_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, wallet: ledger::domain::wallets::Wallet) -> Result<ledger::domain::wallets::Wallet> {
        self.update(wallet).await
    }

    async fn delete(&self, id: Uuid) -> Result<()> {
        let mut wallets = self.wallets.lock().unwrap();
        wallets.retain(|w| w.id != id.to_string());
        Ok(())
    }

    async fn list_by_account(&self, account_id: &str) -> Result<Vec<ledger::domain::wallets::Wallet>> {
        let wallets = self.wallets.lock().unwrap();
        Ok(wallets.iter().filter(|w| w.account_id == account_id).cloned().collect())
    }
}

#[derive(Debug)]
pub struct MockFillRepository {
    fills: Mutex<Vec<ledger::domain::fills::Fill>>,
}

impl MockFillRepository {
    pub fn new() -> Self {
        Self { fills: Mutex::new(Vec::new()) }
    }
}

#[async_trait]
impl ledger::domain::fills::FillRepository for MockFillRepository {
    async fn create(&self, fill: ledger::domain::fills::Fill) -> Result<ledger::domain::fills::Fill> {
        self.fills.lock().unwrap().push(fill.clone());
        Ok(fill)
    }

    async fn create_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, fill: ledger::domain::fills::Fill) -> Result<ledger::domain::fills::Fill> {
        self.create(fill).await
    }

    async fn list_by_order(&self, order_id: Uuid) -> Result<Vec<ledger::domain::fills::Fill>> {
        let fills = self.fills.lock().unwrap();
        Ok(fills.iter().filter(|f| f.order_id == order_id).cloned().collect())
    }

    async fn list_by_instrument_and_time(
        &self,
        instrument_id: Uuid,
        start_time: chrono::DateTime<chrono::Utc>,
        end_time: chrono::DateTime<chrono::Utc>,
    ) -> Result<Vec<ledger::domain::fills::Fill>> {
        let fills = self.fills.lock().unwrap();
        Ok(fills.iter().filter(|f| {
            f.instrument_id == instrument_id &&
            f.created_at >= start_time &&
            f.created_at <= end_time
        }).cloned().collect())
    }
}

#[derive(Debug)]
pub struct MockLedgerRepository {
    events: Mutex<Vec<ledger::proto::common::LedgerEvent>>,
    entries: Mutex<Vec<ledger::proto::common::LedgerEntry>>,
}

impl MockLedgerRepository {
    pub fn new() -> Self {
        Self {
            events: Mutex::new(Vec::new()),
            entries: Mutex::new(Vec::new()),
        }
    }

    #[allow(dead_code)]
    pub fn get_events(&self) -> Vec<ledger::proto::common::LedgerEvent> {
        self.events.lock().unwrap().clone()
    }

    #[allow(dead_code)]
    pub fn get_entries(&self) -> Vec<ledger::proto::common::LedgerEntry> {
        self.entries.lock().unwrap().clone()
    }
}

#[async_trait]
impl ledger::domain::ledger::repository::LedgerRepository for MockLedgerRepository {
    async fn save_event(&self, event: ledger::proto::common::LedgerEvent) -> Result<ledger::proto::common::LedgerEvent> {
        self.events.lock().unwrap().push(event.clone());
        Ok(event)
    }

    async fn save_event_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, event: ledger::proto::common::LedgerEvent) -> Result<ledger::proto::common::LedgerEvent> {
        self.save_event(event).await
    }

    async fn save_entries(&self, entries: Vec<ledger::proto::common::LedgerEntry>) -> Result<Vec<ledger::proto::common::LedgerEntry>> {
        let mut store = self.entries.lock().unwrap();
        store.extend(entries.clone());
        Ok(entries)
    }

    async fn save_entries_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, entries: Vec<ledger::proto::common::LedgerEntry>) -> Result<Vec<ledger::proto::common::LedgerEntry>> {
        self.save_entries(entries).await
    }
}

pub struct LedgerTestContext {
    pub repo: Arc<MockOrderRepository>,
    pub instrument_repo: Arc<MockInstrumentRepository>,
    pub asset_repo: Arc<MockAssetRepository>,
    pub wallet_repo: Arc<MockWalletRepository>,
    pub fill_repo: Arc<MockFillRepository>,
    pub ledger_repo: Arc<MockLedgerRepository>,
    pub tenant_id: Uuid,
    pub account_a: Uuid,
    pub account_b: Uuid,
    pub instrument_id: Uuid,
}

impl LedgerTestContext {
    pub fn new() -> Self {
        let instrument_id = Uuid::new_v4();
        let instrument_repo = Arc::new(MockInstrumentRepository::new());
        let asset_repo = Arc::new(MockAssetRepository::new());
        let wallet_repo = Arc::new(MockWalletRepository::new());
        let fill_repo = Arc::new(MockFillRepository::new());
        let ledger_repo = Arc::new(MockLedgerRepository::new());
        
        // Add default BTC-USD instrument
        instrument_repo.add(Instrument {
            id: instrument_id.to_string(),
            tenant_id: "default".to_string(),
            symbol: "BTC-USD".to_string(),
            r#type: "spot".to_string(),
            status: "active".to_string(),
            underlying_asset_id: "BTC".to_string(),
            quote_asset_id: "USD".to_string(),
            meta: "{}".to_string(),
            created_at: Utc::now().timestamp_millis(),
            updated_at: Utc::now().timestamp_millis(),
        });

        Self {
            repo: Arc::new(MockOrderRepository::new()),
            instrument_repo,
            asset_repo,
            wallet_repo,
            fill_repo,
            ledger_repo,
            tenant_id: Uuid::new_v4(),
            account_a: Uuid::new_v4(),
            account_b: Uuid::new_v4(),
            instrument_id,
        }
    }

    pub fn create_order(
        &self,
        account_id: Uuid,
        side: &str,
        price: f64,
        quantity: f64,
    ) -> Order {
        let order = Order {
            id: Uuid::new_v4(),
            tenant_id: self.tenant_id,
            account_id,
            instrument_id: self.instrument_id,
            side: side.to_string(),
            r#type: "limit".to_string(),
            quantity: Decimal::from_f64(quantity).unwrap_or(Decimal::ZERO),
            price: Decimal::from_f64(price).unwrap_or(Decimal::ZERO),
            status: "open".to_string(),
            filled_quantity: Decimal::ZERO,
            average_fill_price: Decimal::ZERO,
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        self.repo.add(order.clone());
        order
    }

    pub fn create_trade(
        &self,
        buy_order_id: Uuid,
        sell_order_id: Uuid,
        price: f64,
        quantity: f64,
    ) -> Trade {
        Trade {
            id: Uuid::new_v4().to_string(),
            tenant_id: self.tenant_id.to_string(),
            instrument_id: self.instrument_id.to_string(),
            buy_order_id: buy_order_id.to_string(),
            sell_order_id: sell_order_id.to_string(),
            price: price.to_string(),
            quantity: quantity.to_string(),
            meta: "{}".to_string(),
            created_at: Utc::now().timestamp_millis(),
            updated_at: Utc::now().timestamp_millis(),
        }
    }

    #[allow(dead_code)]
    pub fn create_wallet(
        &self,
        account_id: Uuid,
        asset_id: &str,
        available: f64,
        locked: f64,
        total: f64,
    ) -> ledger::domain::wallets::Wallet {
        let wallet = ledger::domain::wallets::Wallet {
            id: Uuid::new_v4().to_string(),
            account_id: account_id.to_string(),
            asset_id: asset_id.to_string(),
            available: available.to_string(),
            locked: locked.to_string(),
            total: total.to_string(),
            tenant_id: self.tenant_id.to_string(),
            user_id: "".to_string(),
            version: 1,
            status: "active".to_string(),
            meta: "{}".to_string(),
            created_at: Utc::now().timestamp_millis(),
            updated_at: Utc::now().timestamp_millis(),
        };
        self.wallet_repo.add(wallet.clone());
        wallet
    }
    
    #[allow(dead_code)]
    pub fn init_test_services(&self) -> (SettlementService, Arc<WalletService>) {
        let ledger_service = Arc::new(LedgerService::new(self.repo.clone(), self.instrument_repo.clone()));
        let wallet_service = Arc::new(WalletService::new(self.wallet_repo.clone()));
        let asset_service = Arc::new(AssetService::new(self.asset_repo.clone(), self.instrument_repo.clone()));
        let order_service = Arc::new(OrderService::new(self.repo.clone(), wallet_service.clone(), asset_service));
        let fill_service = Arc::new(FillService::new(self.fill_repo.clone()));

        let settlement_service = SettlementService::new(
            None,
            order_service,
            self.instrument_repo.clone(),
            ledger_service,
            wallet_service.clone(),
            fill_service,
            self.ledger_repo.clone(),
        );

        (settlement_service, wallet_service)
    }
}
