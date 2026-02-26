#![allow(dead_code)]
#![allow(unused_imports)]
use chrono::Utc;
use rust_decimal::prelude::FromPrimitive;
use rust_decimal::Decimal;
use std::str::FromStr;
use std::sync::Arc;
use tonic::Request;
use uuid::Uuid;

use ledger::domain::orders::model::{Order, OrderSide, OrderStatus, OrderType};
use ledger::domain::transaction::TransactionManager;
use ledger::proto::common::{Instrument, Trade};

// Services
use ledger::domain::{
    accounts::AccountService,
    assets::AssetService,
    borrow::BorrowService,
    corporate_actions::CorporateActionService,
    deposits::DepositService,
    exercise::ExerciseService,
    fees::service::StandardFeeService,
    fills::service::FillService,
    funding::{FundingRateService, FuturesSettlementService, MarkToMarketService},
    ledger::service::LedgerService,
    liquidation::InsuranceFundService,
    liquidation::LiquidationService,
    margin::MarginService,
    margin::{CrossMarginService, IsolatedMarginService},
    orders::service::OrderService,
    position_limits::{PositionLimitConfig, PositionLimitService},
    settlement::service::SettlementService,
    users::UserService,
    wallets::WalletService,
    withdrawals::WithdrawalService,
};

// API Implementations
use ledger::api::{
    accounts::AccountServiceImpl, assets::AssetServiceImpl, deposits::DepositServiceImpl,
    orders::OrderServiceImpl, settlement::SettlementServiceImpl, users::UserServiceImpl,
    wallets::WalletServiceImpl, withdrawals::WithdrawalServiceImpl,
};

// Repositories
use ledger::infra::repositories::{
    InMemoryAccountRepository, InMemoryAssetRepository, InMemoryFillRepository,
    InMemoryInstrumentRepository, InMemoryLedgerRepository, InMemoryOrderRepository,
    InMemoryTradeRepository, InMemoryWalletRepository,
};

// Proto Requests

use ledger::proto::ledger::{
    CreateAccountRequest, CreateAssetRequest, CreateDepositRequest, CreateInstrumentRequest,
    CreateWalletRequest,
};

// Proto Traits (Aliased to avoid conflicts with Domain Services)
use ledger::proto::ledger::account_service_server::AccountService as AccountServiceTrait;
use ledger::proto::ledger::asset_service_server::AssetService as AssetServiceTrait;
use ledger::proto::ledger::deposit_service_server::DepositService as DepositServiceTrait;
use ledger::proto::ledger::wallet_service_server::WalletService as WalletServiceTrait;

// Transaction
use ledger::infra::transaction::InMemoryTransactionManager;

pub fn assert_decimal(left: &str, right: &str) {
    let l = Decimal::from_str(left).unwrap_or_else(|_| panic!("Invalid decimal left: {}", left));
    let r = Decimal::from_str(right).unwrap_or_else(|_| panic!("Invalid decimal right: {}", right));
    assert_eq!(l, r, "Decimals not equal: {} != {}", left, right);
}

pub struct InMemoryTestContext {
    // Repositories (Public for direct access in tests)
    pub order_repo: Arc<InMemoryOrderRepository>,
    pub instrument_repo: Arc<InMemoryInstrumentRepository>,
    pub asset_repo: Arc<InMemoryAssetRepository>,
    pub account_repo: Arc<InMemoryAccountRepository>,
    pub wallet_repo: Arc<InMemoryWalletRepository>,
    pub fill_repo: Arc<InMemoryFillRepository>,
    pub ledger_repo: Arc<InMemoryLedgerRepository>,
    pub trade_repo: Arc<InMemoryTradeRepository>,

    // Domain Services
    pub order_service: Arc<OrderService>,
    pub account_service: Arc<AccountService>,
    pub wallet_service: Arc<WalletService>,
    pub asset_service: Arc<AssetService>,
    pub ledger_service: Arc<LedgerService>,
    pub settlement_service: Arc<SettlementService>,
    pub fill_service: Arc<FillService>,
    pub user_service: Arc<UserService>,
    pub margin_service: Arc<MarginService>,
    pub cross_margin_service: Arc<CrossMarginService>,
    pub isolated_margin_service: Arc<IsolatedMarginService>,
    pub borrow_service: Arc<BorrowService>,
    pub corporate_action_service: Arc<CorporateActionService>,
    pub exercise_service: Arc<ExerciseService>,
    pub funding_rate_service: Arc<FundingRateService>,
    pub mark_to_market_service: Arc<MarkToMarketService>,
    pub futures_settlement_service: Arc<FuturesSettlementService>,
    pub liquidation_service: Arc<LiquidationService>,
    pub insurance_fund_service: Arc<InsuranceFundService>,
    pub position_limit_service: Arc<PositionLimitService>,

    // API Services (gRPC Implementations)
    pub order_api: OrderServiceImpl,
    pub account_api: AccountServiceImpl,
    pub wallet_api: WalletServiceImpl,
    pub asset_api: AssetServiceImpl,
    pub deposit_api: DepositServiceImpl,
    pub withdrawal_api: WithdrawalServiceImpl,
    pub user_api: UserServiceImpl,
    pub settlement_api: SettlementServiceImpl,

    // Test Data
    pub tenant_id: Uuid,
    pub user_id: Uuid,
    pub instrument_id: Uuid,
    pub btc_id: Uuid,
    pub usd_id: Uuid,
    pub account_a: Uuid,
    pub account_b: Uuid,
}

impl InMemoryTestContext {
    pub fn new() -> Self {
        // 1. Initialize Repositories
        let order_repo = Arc::new(InMemoryOrderRepository::new());
        let instrument_repo = Arc::new(InMemoryInstrumentRepository::new());
        let asset_repo = Arc::new(InMemoryAssetRepository::new());
        let account_repo = Arc::new(InMemoryAccountRepository::new());
        let wallet_repo = Arc::new(InMemoryWalletRepository::new());
        let fill_repo = Arc::new(InMemoryFillRepository::new());
        let ledger_repo = Arc::new(InMemoryLedgerRepository::new());
        let trade_repo = Arc::new(InMemoryTradeRepository::new());

        // 2. Initialize Domain Services
        let user_service = Arc::new(UserService::new());
        let account_service = Arc::new(AccountService::new(account_repo.clone()));
        let wallet_service = Arc::new(WalletService::new(wallet_repo.clone()));
        let asset_service = Arc::new(AssetService::new(
            asset_repo.clone(),
            instrument_repo.clone(),
        ));
        let fee_service = Arc::new(StandardFeeService::new());
        let fill_service = Arc::new(FillService::new(fill_repo.clone()));
        let deposit_service = Arc::new(DepositService::new());
        let withdrawal_service = Arc::new(WithdrawalService::new());

        let margin_service = Arc::new(MarginService::new(wallet_service.clone()));
        let cross_margin_service = Arc::new(CrossMarginService::new(wallet_service.clone()));
        let isolated_margin_service = Arc::new(IsolatedMarginService::new(wallet_service.clone()));
        let borrow_service = Arc::new(BorrowService::new(wallet_service.clone()));
        let corporate_action_service =
            Arc::new(CorporateActionService::new(wallet_service.clone()));
        let exercise_service = Arc::new(ExerciseService::new(wallet_service.clone()));
        let funding_rate_service = Arc::new(FundingRateService::new(wallet_service.clone()));
        let mark_to_market_service = Arc::new(MarkToMarketService::new(wallet_service.clone()));
        let position_limit_service =
            Arc::new(PositionLimitService::new(PositionLimitConfig::default()));

        let tx_manager = Arc::new(InMemoryTransactionManager);

        // 2a. Order Service (Needed for Liquidation)
        let order_service = Arc::new(
            OrderService::builder(
                order_repo.clone(),
                wallet_service.clone(),
                asset_service.clone(),
            )
            .with_transaction_manager(Arc::new(InMemoryTransactionManager))
            .with_position_limit_service(position_limit_service.clone())
            .build(),
        );

        let futures_settlement_service =
            Arc::new(FuturesSettlementService::new(wallet_service.clone()));
        let liquidation_service = Arc::new(LiquidationService::new(
            wallet_service.clone(),
            Some(order_service.clone()),
        ));
        let insurance_fund_service = Arc::new(InsuranceFundService::new(wallet_service.clone()));

        let ledger_service = Arc::new(LedgerService::new(
            order_repo.clone(),
            instrument_repo.clone(),
            asset_repo.clone(),
            account_repo.clone(),
        ));

        let settlement_service = Arc::new(SettlementService::new(
            Some(tx_manager.clone()),
            order_service.clone(),
            instrument_repo.clone(),
            ledger_service.clone(),
            wallet_service.clone(),
            fill_service.clone(),
            fee_service.clone(),
            ledger_repo.clone(),
            trade_repo.clone(),
        ));

        // 3. Initialize API Services
        let order_api = OrderServiceImpl::new(
            order_service.clone(),
            fill_service.clone(),
            account_service.clone(),
        );
        let account_api = AccountServiceImpl::new(account_service.clone());
        let wallet_api = WalletServiceImpl::new(wallet_service.clone());
        let asset_api = AssetServiceImpl::new(asset_service.clone());
        let deposit_api = DepositServiceImpl::new(
            deposit_service.clone(),
            wallet_service.clone(),
            account_service.clone(),
        );
        let withdrawal_api =
            WithdrawalServiceImpl::new(withdrawal_service.clone(), wallet_service.clone());
        let user_api = UserServiceImpl::new(user_service.clone());
        let settlement_api = SettlementServiceImpl::new(settlement_service.clone());

        // 4. Setup Default Data
        let tenant_id = Uuid::new_v4();
        let user_id = Uuid::new_v4();
        let btc_id = Uuid::new_v4();
        let usd_id = Uuid::new_v4();
        let instrument_id = Uuid::new_v4();

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
            order_repo,
            instrument_repo,
            asset_repo,
            account_repo,
            wallet_repo,
            fill_repo,
            ledger_repo,
            trade_repo,

            order_service,
            account_service,
            wallet_service,
            asset_service,
            ledger_service,
            settlement_service,
            fill_service,
            user_service,
            margin_service,
            cross_margin_service,
            isolated_margin_service,
            borrow_service,
            corporate_action_service,
            exercise_service,
            funding_rate_service,
            mark_to_market_service,
            futures_settlement_service,
            liquidation_service,
            insurance_fund_service,
            position_limit_service,

            order_api,
            account_api,
            wallet_api,
            asset_api,
            deposit_api,
            withdrawal_api,
            user_api,
            settlement_api,

            tenant_id,
            user_id,
            instrument_id,
            btc_id,
            usd_id,
            account_a: Uuid::new_v4(),
            account_b: Uuid::new_v4(),
        }
    }

    // --- Helper Methods ---

    pub fn create_order(&self, account_id: Uuid, side: &str, price: f64, quantity: f64) -> Order {
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
        self.order_repo.add(order.clone());
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

    pub fn create_wallet(
        &self,
        account_id: Uuid,
        asset_id: &str,
        available: f64,
        locked: f64,
        total: f64,
    ) -> ledger::domain::wallets::Wallet {
        self.create_wallet_decimal(
            account_id,
            asset_id,
            Decimal::from_f64(available).unwrap_or(Decimal::ZERO),
            Decimal::from_f64(locked).unwrap_or(Decimal::ZERO),
            Decimal::from_f64(total).unwrap_or(Decimal::ZERO),
        )
    }

    pub fn create_wallet_decimal(
        &self,
        account_id: Uuid,
        asset_id: &str,
        available: Decimal,
        locked: Decimal,
        total: Decimal,
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

    pub async fn create_asset_api(&self, symbol: &str, klass: &str, precision: i32) -> String {
        let req = Request::new(CreateAssetRequest {
            symbol: symbol.to_string(),
            klass: klass.to_string(),
            precision,
        });
        self.asset_api
            .create_asset(req)
            .await
            .unwrap()
            .into_inner()
            .asset
            .unwrap()
            .id
    }

    pub async fn create_instrument_api(
        &self,
        symbol: &str,
        base_id: &str,
        quote_id: &str,
    ) -> String {
        let req = Request::new(CreateInstrumentRequest {
            symbol: symbol.to_string(),
            r#type: "spot".to_string(),
            base_asset_id: base_id.to_string(),
            quote_asset_id: quote_id.to_string(),
        });
        self.asset_api
            .create_instrument(req)
            .await
            .unwrap()
            .into_inner()
            .instrument
            .unwrap()
            .id
    }

    pub async fn create_account_api(&self, user_id: impl ToString, type_: &str) -> String {
        let req = Request::new(CreateAccountRequest {
            user_id: user_id.to_string(),
            r#type: type_.to_string(),
        });
        self.account_api
            .create_account(req)
            .await
            .unwrap()
            .into_inner()
            .account
            .unwrap()
            .id
    }

    pub async fn create_wallet_api(
        &self,
        account_id: impl ToString,
        asset_id: impl ToString,
    ) -> String {
        let req = Request::new(CreateWalletRequest {
            account_id: account_id.to_string(),
            asset_id: asset_id.to_string(),
        });
        self.wallet_api
            .create_wallet(req)
            .await
            .unwrap()
            .into_inner()
            .wallet
            .unwrap()
            .id
    }

    pub async fn deposit_funds_api(&self, wallet_id: impl ToString, amount: &str) {
        let req = Request::new(CreateDepositRequest {
            wallet_id: wallet_id.to_string(),
            amount: amount.to_string(),
            transaction_ref: format!("dep-{}", Uuid::new_v4()),
        });
        self.deposit_api.create_deposit(req).await.unwrap();
    }

    pub fn create_order_object(
        &self,
        account_id: impl ToString,
        instrument_id: impl ToString,
        side: ledger::proto::common::OrderSide,
        quantity: &str,
        price: &str,
    ) -> ledger::proto::common::Order {
        use ledger::proto::common::{Order, OrderStatus, OrderType, TimeInForce};
        Order {
            id: Uuid::new_v4().to_string(),
            tenant_id: self.tenant_id.to_string(),
            account_id: account_id.to_string(),
            instrument_id: instrument_id.to_string(),
            side: side as i32,
            price: price.to_string(),
            quantity: quantity.to_string(),
            quantity_filled: "0".to_string(),
            status: OrderStatus::Open as i32,
            time_in_force: TimeInForce::Gtc as i32,
            created_at: 0,
            updated_at: 0,
            r#type: OrderType::Limit as i32,
            meta: "{}".to_string(),
        }
    }

    pub fn init_test_services(&self) -> (Arc<SettlementService>, Arc<WalletService>) {
        (self.settlement_service.clone(), self.wallet_service.clone())
    }
}
