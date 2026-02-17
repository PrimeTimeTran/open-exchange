use ledger::domain::orders::model::{Order, OrderSide, OrderType, OrderStatus};
use std::str::FromStr;
use ledger::domain::assets::AssetService;
use ledger::domain::wallets::WalletService;
use ledger::proto::common::{Trade, Instrument};
use ledger::domain::fills::service::FillService;
use ledger::domain::orders::service::OrderService;
use ledger::domain::ledger::service::LedgerService;
use ledger::domain::settlement::service::SettlementService;
use ledger::domain::fees::service::StandardFeeService;
use ledger::infra::repositories::{
    InMemoryOrderRepository, InMemoryInstrumentRepository, InMemoryAssetRepository, 
    InMemoryAccountRepository, InMemoryWalletRepository, InMemoryFillRepository,
    InMemoryLedgerRepository, InMemoryTradeRepository
};
use uuid::Uuid;
use chrono::Utc;
use std::sync::Arc;
use rust_decimal::Decimal;
use rust_decimal::prelude::FromPrimitive;

pub struct LedgerTestContext {
    pub repo: Arc<InMemoryOrderRepository>,
    pub instrument_repo: Arc<InMemoryInstrumentRepository>,
    pub asset_repo: Arc<InMemoryAssetRepository>,
    pub account_repo: Arc<InMemoryAccountRepository>,
    pub wallet_repo: Arc<InMemoryWalletRepository>,
    pub fill_repo: Arc<InMemoryFillRepository>,
    pub ledger_repo: Arc<InMemoryLedgerRepository>,
    pub trade_repo: Arc<InMemoryTradeRepository>,
    pub tenant_id: Uuid,
    pub account_a: Uuid,
    pub account_b: Uuid,
    pub instrument_id: Uuid,
    pub btc_id: Uuid,
    pub usd_id: Uuid,
}

impl LedgerTestContext {
    pub fn new() -> Self {
        let instrument_id = Uuid::new_v4();
        let instrument_repo = Arc::new(InMemoryInstrumentRepository::new());
        let asset_repo = Arc::new(InMemoryAssetRepository::new());
        let account_repo = Arc::new(InMemoryAccountRepository::new());
        let wallet_repo = Arc::new(InMemoryWalletRepository::new());
        let fill_repo = Arc::new(InMemoryFillRepository::new());
        let ledger_repo = Arc::new(InMemoryLedgerRepository::new());
        let trade_repo = Arc::new(InMemoryTradeRepository::new());
        let order_repo = Arc::new(InMemoryOrderRepository::new());
        
        let btc_id = Uuid::new_v4();
        let usd_id = Uuid::new_v4();
        let tenant_id = Uuid::new_v4();

        // Add Assets
        asset_repo.add(ledger::proto::common::Asset {
            id: btc_id.to_string(),
            tenant_id: tenant_id.to_string(),
            symbol: "BTC".to_string(),
            decimals: 8,
            ..Default::default()
        });
        asset_repo.add(ledger::proto::common::Asset {
            id: usd_id.to_string(),
            tenant_id: tenant_id.to_string(),
            symbol: "USD".to_string(),
            decimals: 2,
            ..Default::default()
        });

        // Add Fee Account
        account_repo.add(ledger::domain::accounts::Account {
            id: Uuid::new_v4(),
            tenant_id: tenant_id.to_string(),
            user_id: "".to_string(),
            name: "fees_account".to_string(),
            r#type: "fees".to_string(),
            status: "active".to_string(),
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        });

        // Add default BTC-USD instrument
        instrument_repo.add(Instrument {
            id: instrument_id.to_string(),
            tenant_id: tenant_id.to_string(),
            symbol: "BTC-USD".to_string(),
            r#type: "spot".to_string(),
            status: "active".to_string(),
            underlying_asset_id: btc_id.to_string(),
            quote_asset_id: usd_id.to_string(),
            meta: "{}".to_string(),
            created_at: Utc::now().timestamp_millis(),
            updated_at: Utc::now().timestamp_millis(),
        });

        Self {
            repo: order_repo,
            instrument_repo,
            asset_repo,
            account_repo,
            wallet_repo,
            fill_repo,
            ledger_repo,
            trade_repo,
            tenant_id,
            account_a: Uuid::new_v4(),
            account_b: Uuid::new_v4(),
            instrument_id,
            btc_id,
            usd_id,
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
            side: OrderSide::from_str(side).unwrap_or(OrderSide::Buy),
            r#type: OrderType::Limit,
            quantity: Decimal::from_f64(quantity).unwrap_or(Decimal::ZERO),
            price: Decimal::from_f64(price).unwrap_or(Decimal::ZERO),
            status: OrderStatus::Open,
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
        let ledger_service = Arc::new(LedgerService::new(self.repo.clone(), self.instrument_repo.clone(), self.asset_repo.clone(), self.account_repo.clone()));
        let wallet_service = Arc::new(WalletService::new(self.wallet_repo.clone()));
        let asset_service = Arc::new(AssetService::new(self.asset_repo.clone(), self.instrument_repo.clone()));
        let tx_manager = Arc::new(ledger::infra::transaction::InMemoryTransactionManager);
        let order_service = Arc::new(OrderService::new(self.repo.clone(), wallet_service.clone(), asset_service, Some(tx_manager)));
        let fill_service = Arc::new(FillService::new(self.fill_repo.clone()));
        let fee_service = Arc::new(StandardFeeService::new());

        let settlement_service = SettlementService::new(
            None,
            order_service,
            self.instrument_repo.clone(),
            ledger_service,
            wallet_service.clone(),
            fill_service,
            fee_service,
            self.ledger_repo.clone(),
            self.trade_repo.clone(),
        );

        (settlement_service, wallet_service)
    }
}
