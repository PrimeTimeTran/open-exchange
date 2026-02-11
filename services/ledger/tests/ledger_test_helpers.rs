use ledger::domain::orders::model::Order;
use ledger::proto::common::{Trade, OrderSide, OrderStatus, OrderType, TimeInForce, Instrument};
use uuid::Uuid;
use chrono::Utc;
use std::sync::{Arc, Mutex};
use async_trait::async_trait;
use ledger::domain::orders::repository::OrderRepository;
use ledger::infra::repositories::InstrumentRepository;
use ledger::error::Result;

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

    async fn update_filled_amount(&self, _id: Uuid, _filled: f64) -> Result<()> {
        Ok(())
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

pub struct LedgerTestContext {
    pub repo: Arc<MockOrderRepository>,
    pub instrument_repo: Arc<MockInstrumentRepository>,
    pub tenant_id: Uuid,
    pub account_a: Uuid,
    pub account_b: Uuid,
    pub instrument_id: Uuid,
}

impl LedgerTestContext {
    pub fn new() -> Self {
        let instrument_id = Uuid::new_v4();
        let instrument_repo = Arc::new(MockInstrumentRepository::new());
        
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
            quantity,
            price,
            status: "open".to_string(),
            filled_quantity: 0.0,
            average_fill_price: 0.0,
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
            instrument_id: "BTC-USD".to_string(), // Can be parameterized if needed
            buy_order_id: buy_order_id.to_string(),
            sell_order_id: sell_order_id.to_string(),
            price: price.to_string(),
            quantity: quantity.to_string(),
            meta: "{}".to_string(),
            created_at: Utc::now().timestamp_millis(),
            updated_at: Utc::now().timestamp_millis(),
        }
    }
}
