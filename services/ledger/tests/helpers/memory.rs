#![allow(dead_code)]
use super::container::Container;
use chrono::Utc;
use rust_decimal::prelude::FromPrimitive;
use rust_decimal::Decimal;
use std::str::FromStr;
use std::sync::Arc;
use tonic::Request;
use uuid::Uuid;

use ledger::domain::instruments::model::Instrument;
use ledger::domain::orders::model::{Order, OrderSide, OrderStatus, OrderType};
use ledger::domain::trade::model::Trade;

// Services
use ledger::domain::{
    accounts::AccountService,
    assets::AssetService,
    borrow::BorrowService,
    corporate_actions::CorporateActionService,
    exercise::ExerciseService,
    fills::service::FillService,
    funding::{FundingRateService, FuturesSettlementService, MarkToMarketService},
    ledger::service::LedgerService,
    liquidation::InsuranceFundService,
    liquidation::LiquidationService,
    margin::MarginService,
    margin::{CrossMarginService, IsolatedMarginService},
    orders::service::OrderService,
    position_limits::PositionLimitService,
    settlement::service::SettlementService,
    users::UserService,
    wallets::WalletService,
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

// ─── Assertion Helpers ────────────────────────────────────────────────────────

pub fn assert_decimal(left: &str, right: &str) {
    let l = Decimal::from_str(left).unwrap_or_else(|_| panic!("Invalid decimal left: {}", left));
    let r = Decimal::from_str(right).unwrap_or_else(|_| panic!("Invalid decimal right: {}", right));
    assert_eq!(l, r, "Decimals not equal: {} != {}", left, right);
}

// ─── Object Mother: Return Types ──────────────────────────────────────────────

/// Shared with `PostgresTestContext`. Defined in `helpers/mod.rs`.
pub use super::FundedAccount;

/// Both sides of a spot trade, pre-funded and ready for order placement.
pub struct SpotParticipants {
    /// Holds the quote asset (USD). Ready to place buy orders.
    pub buyer: FundedAccount,
    /// Holds the base asset. Ready to place sell orders.
    pub seller: FundedAccount,
}

/// Both sides of an option trade, pre-funded with correct collateral per option type.
pub struct OptionParticipants {
    /// Holds USD to pay the option premium.
    pub buyer: FundedAccount,
    /// Holds the correct collateral: AAPL for calls, USD for puts.
    pub writer: FundedAccount,
}

// ─── Object Mother: Pre-wired Asset & Instrument Catalogs ────────────────────

/// All assets pre-wired into every `InMemoryTestContext`.
/// Add new asset classes here as the exchange supports them.
pub struct TestAssets {
    // ── Crypto ────────────────────────────────────────────
    /// Bitcoin. 8 decimal places (satoshi precision).
    pub btc: Uuid,
    /// Ethereum. 8 decimal places (wei precision).
    pub eth: Uuid,

    // ── Fiat ──────────────────────────────────────────────
    /// US Dollar. 2 decimal places. Primary quote currency.
    pub usd: Uuid,

    // ── Equity ────────────────────────────────────────────
    /// Apple Inc. (AAPL). 2 decimal places.
    /// Used as the canonical equity for stock, option, and future tests.
    pub aapl: Uuid,
}

/// All instruments pre-wired into every `InMemoryTestContext`.
///
/// Instruments are fully configured — collateral asset, settlement logic, and
/// option/future metadata are all set correctly so tests can place orders
/// immediately without additional setup.
///
/// Add new instruments here when adding new asset class coverage.
pub struct TestInstruments {
    // ── Spot ──────────────────────────────────────────────
    /// BTC/USD crypto spot. Also aliased as `ctx.instrument_id` for backward compat.
    pub btc_usd: Uuid,
    /// ETH/USD crypto spot.
    pub eth_usd: Uuid,
    /// AAPL/USD equity spot. Standard cash-account stock trading.
    pub aapl_usd: Uuid,

    // ── Options (AAPL, strike = $150.00, expiry = Dec 2026) ───────────────
    /// AAPL Call option.
    /// - Buyer pays premium (price × qty) in USD.
    /// - Writer locks AAPL shares (qty) as delivery collateral.
    pub aapl_call: Uuid,
    /// AAPL Put option.
    /// - Buyer pays premium (price × qty) in USD.
    /// - Writer locks USD (strike × qty) as purchase collateral.
    pub aapl_put: Uuid,

    // ── Futures ───────────────────────────────────────────
    /// BTC perpetual futures. Margin-settled in USD. No expiry.
    pub btc_perp: Uuid,
    /// AAPL quarterly future. Expiry Mar 2026. Contract size = 100 shares.
    pub aapl_future: Uuid,
}

// ─── Test Context ─────────────────────────────────────────────────────────────

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

    // ── Object Mother Catalogs ────────────────────────────
    /// All pre-wired assets. Use these IDs when creating wallets or instruments.
    pub assets: TestAssets,
    /// All pre-wired instruments. Use these IDs when placing orders.
    pub instruments: TestInstruments,

    // ── Backward-Compatible Test Data Fields ──────────────
    // These mirror the catalog above. Existing tests using ctx.btc_id,
    // ctx.usd_id, and ctx.instrument_id continue to work unchanged.
    pub tenant_id: Uuid,
    pub user_id: Uuid,
    /// Alias for instruments.btc_usd. Kept for backward compat with existing tests.
    pub instrument_id: Uuid,
    /// Alias for assets.btc. Kept for backward compat with existing tests.
    pub btc_id: Uuid,
    /// Alias for assets.usd. Kept for backward compat with existing tests.
    pub usd_id: Uuid,
    pub account_a: Uuid,
    pub account_b: Uuid,
}

impl InMemoryTestContext {
    pub fn new() -> Self {
        let c = Container::new();

        // ── 4. Pre-wired Test Data ────────────────────────────────────────────
        let tenant_id = Uuid::new_v4();
        let user_id = Uuid::new_v4();

        // Assets
        let btc_id = Uuid::new_v4();
        let eth_id = Uuid::new_v4();
        let usd_id = Uuid::new_v4();
        let aapl_id = Uuid::new_v4();

        // Instruments
        let btc_usd_id = Uuid::new_v4();
        let eth_usd_id = Uuid::new_v4();
        let aapl_usd_id = Uuid::new_v4();
        let aapl_call_id = Uuid::new_v4();
        let aapl_put_id = Uuid::new_v4();
        let btc_perp_id = Uuid::new_v4();
        let aapl_future_id = Uuid::new_v4();

        // ── Assets ────────────────────────────────────────────────────────────
        let make_asset =
            |id, symbol: &str, asset_type: &str, decimals| ledger::domain::assets::model::Asset {
                id,
                tenant_id,
                symbol: symbol.to_string(),
                r#type: asset_type.to_string(),
                decimals,
                meta: serde_json::json!({}),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            };

        c.asset_repo
            .add(make_asset(btc_id, "BTC", "CRYPTO", 8))
            .expect("Failed to seed BTC");
        c.asset_repo
            .add(make_asset(eth_id, "ETH", "CRYPTO", 8))
            .expect("Failed to seed ETH");
        c.asset_repo
            .add(make_asset(usd_id, "USD", "FIAT", 2))
            .expect("Failed to seed USD");
        c.asset_repo
            .add(make_asset(aapl_id, "AAPL", "EQUITY", 2))
            .expect("Failed to seed AAPL");

        // ── System Accounts ───────────────────────────────────────────────────
        c.account_repo
            .add(ledger::domain::accounts::Account {
                id: Uuid::new_v4(),
                tenant_id: tenant_id.to_string(),
                user_id: "".to_string(),
                name: "fees_account".to_string(),
                r#type: "fees".to_string(),
                status: "active".to_string(),
                meta: serde_json::json!({}),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            })
            .expect("Failed to seed fee account");

        // ── Instruments ───────────────────────────────────────────────────────
        let make_spot = |id, symbol: &str, base, quote| Instrument {
            id,
            tenant_id,
            symbol: symbol.to_string(),
            r#type: "spot".to_string(),
            status: "active".to_string(),
            underlying_asset_id: base,
            quote_asset_id: quote,
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        c.instrument_repo
            .add(make_spot(btc_usd_id, "BTC-USD", btc_id, usd_id))
            .expect("Failed to seed BTC-USD");
        c.instrument_repo
            .add(make_spot(eth_usd_id, "ETH-USD", eth_id, usd_id))
            .expect("Failed to seed ETH-USD");
        c.instrument_repo
            .add(make_spot(aapl_usd_id, "AAPL-USD", aapl_id, usd_id))
            .expect("Failed to seed AAPL-USD");

        // AAPL Call Option — strike $150.00, expiry Dec 31 2026
        // Buyer pays premium in USD; writer locks AAPL as collateral.
        c.instrument_repo
            .add(Instrument {
                id: aapl_call_id,
                tenant_id,
                symbol: "AAPL-CALL-150-DEC26".to_string(),
                r#type: "option".to_string(),
                status: "active".to_string(),
                underlying_asset_id: aapl_id,
                quote_asset_id: usd_id,
                meta: serde_json::json!({
                    "option_type":  "call",
                    "strike_price": "150.00",
                    "expiry":       1767225600,
                    "contract_size": "1"
                }),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            })
            .expect("Failed to seed AAPL Call");

        // AAPL Put Option — strike $150.00, expiry Dec 31 2026
        // Buyer pays premium in USD; writer locks USD (strike × qty) as collateral.
        c.instrument_repo
            .add(Instrument {
                id: aapl_put_id,
                tenant_id,
                symbol: "AAPL-PUT-150-DEC26".to_string(),
                r#type: "option".to_string(),
                status: "active".to_string(),
                underlying_asset_id: aapl_id,
                quote_asset_id: usd_id,
                meta: serde_json::json!({
                    "option_type":  "put",
                    "strike_price": "150.00",
                    "expiry":       1767225600,
                    "contract_size": "1"
                }),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            })
            .expect("Failed to seed AAPL Put");

        // BTC Perpetual Futures — no expiry, USD margin
        c.instrument_repo
            .add(Instrument {
                id: btc_perp_id,
                tenant_id,
                symbol: "BTC-PERP".to_string(),
                r#type: "future".to_string(),
                status: "active".to_string(),
                underlying_asset_id: btc_id,
                quote_asset_id: usd_id,
                meta: serde_json::json!({
                    "contract_size": "1",
                    "tick_size":     "0.50",
                    "perpetual":     true
                }),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            })
            .expect("Failed to seed BTC-PERP");

        // AAPL Quarterly Future — expiry Mar 31 2026, 100 shares per contract
        c.instrument_repo
            .add(Instrument {
                id: aapl_future_id,
                tenant_id,
                symbol: "AAPL-FUT-MAR26".to_string(),
                r#type: "future".to_string(),
                status: "active".to_string(),
                underlying_asset_id: aapl_id,
                quote_asset_id: usd_id,
                meta: serde_json::json!({
                    "contract_size": "100",
                    "tick_size":     "0.01",
                    "expiry":        1743379200,
                    "perpetual":     false
                }),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            })
            .expect("Failed to seed AAPL-FUT-MAR26");

        Self {
            order_repo: c.order_repo,
            instrument_repo: c.instrument_repo,
            asset_repo: c.asset_repo,
            account_repo: c.account_repo,
            wallet_repo: c.wallet_repo,
            fill_repo: c.fill_repo,
            ledger_repo: c.ledger_repo,
            trade_repo: c.trade_repo,

            order_service: c.order_service,
            account_service: c.account_service,
            wallet_service: c.wallet_service,
            asset_service: c.asset_service,
            ledger_service: c.ledger_service,
            settlement_service: c.settlement_service,
            fill_service: c.fill_service,
            user_service: c.user_service,
            margin_service: c.margin_service,
            cross_margin_service: c.cross_margin_service,
            isolated_margin_service: c.isolated_margin_service,
            borrow_service: c.borrow_service,
            corporate_action_service: c.corporate_action_service,
            exercise_service: c.exercise_service,
            funding_rate_service: c.funding_rate_service,
            mark_to_market_service: c.mark_to_market_service,
            futures_settlement_service: c.futures_settlement_service,
            liquidation_service: c.liquidation_service,
            insurance_fund_service: c.insurance_fund_service,
            position_limit_service: c.position_limit_service,

            order_api: c.order_api,
            account_api: c.account_api,
            wallet_api: c.wallet_api,
            asset_api: c.asset_api,
            deposit_api: c.deposit_api,
            withdrawal_api: c.withdrawal_api,
            user_api: c.user_api,
            settlement_api: c.settlement_api,

            assets: TestAssets {
                btc: btc_id,
                eth: eth_id,
                usd: usd_id,
                aapl: aapl_id,
            },
            instruments: TestInstruments {
                btc_usd: btc_usd_id,
                eth_usd: eth_usd_id,
                aapl_usd: aapl_usd_id,
                aapl_call: aapl_call_id,
                aapl_put: aapl_put_id,
                btc_perp: btc_perp_id,
                aapl_future: aapl_future_id,
            },

            // Backward-compat aliases
            tenant_id,
            user_id,
            instrument_id: btc_usd_id,
            btc_id,
            usd_id,
            account_a: Uuid::new_v4(),
            account_b: Uuid::new_v4(),
        }
    }

    // ─── Object Mother: Scenario Setup ───────────────────────────────────────
    //
    // These methods create a fully-wired account + wallet in one call.
    // Tests describe *what* they need (a spot buyer, a call writer) rather
    // than *how* to construct it (account → wallet → deposit → ...).
    //
    // When a model changes, update here — not in every test file.

    /// Low-level primitive. Creates a new account funded with `amount` of `asset_id`.
    /// All higher-level setup methods delegate here.
    pub fn funded_account(&self, asset_id: Uuid, amount: &str) -> FundedAccount {
        let account_id = Uuid::new_v4();
        let amount_decimal = Decimal::from_str(amount)
            .unwrap_or_else(|_| panic!("funded_account: invalid amount '{}'", amount));

        self.account_repo
            .add(ledger::domain::accounts::Account {
                id: account_id,
                tenant_id: self.tenant_id.to_string(),
                user_id: Uuid::new_v4().to_string(),
                name: format!("test-account-{}", account_id),
                r#type: "cash".to_string(),
                status: "active".to_string(),
                meta: serde_json::json!({}),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            })
            .expect("funded_account: failed to create account");

        let wallet = self.create_wallet_decimal(
            account_id,
            &asset_id.to_string(),
            amount_decimal,
            Decimal::ZERO,
            amount_decimal,
        );

        FundedAccount {
            account_id,
            wallet_id: wallet.id,
        }
    }

    // ── Spot ─────────────────────────────────────────────────────────────────

    /// Account funded with USD. Ready to buy on any spot instrument.
    pub fn spot_buyer(&self, usd_amount: &str) -> FundedAccount {
        self.funded_account(self.assets.usd, usd_amount)
    }

    /// Account funded with BTC. Ready to sell on BTC-USD.
    pub fn spot_seller_btc(&self, btc_amount: &str) -> FundedAccount {
        self.funded_account(self.assets.btc, btc_amount)
    }

    /// Account funded with ETH. Ready to sell on ETH-USD.
    pub fn spot_seller_eth(&self, eth_amount: &str) -> FundedAccount {
        self.funded_account(self.assets.eth, eth_amount)
    }

    /// Account funded with AAPL shares. Ready to sell on AAPL-USD.
    pub fn spot_seller_aapl(&self, aapl_amount: &str) -> FundedAccount {
        self.funded_account(self.assets.aapl, aapl_amount)
    }

    /// Both sides of a BTC/USD spot trade. Buyer has USD, seller has BTC.
    pub fn btc_spot_participants(&self, usd_amount: &str, btc_amount: &str) -> SpotParticipants {
        SpotParticipants {
            buyer: self.spot_buyer(usd_amount),
            seller: self.spot_seller_btc(btc_amount),
        }
    }

    /// Both sides of an ETH/USD spot trade. Buyer has USD, seller has ETH.
    pub fn eth_spot_participants(&self, usd_amount: &str, eth_amount: &str) -> SpotParticipants {
        SpotParticipants {
            buyer: self.spot_buyer(usd_amount),
            seller: self.spot_seller_eth(eth_amount),
        }
    }

    /// Both sides of an AAPL/USD spot trade. Buyer has USD, seller has AAPL.
    pub fn aapl_spot_participants(&self, usd_amount: &str, aapl_amount: &str) -> SpotParticipants {
        SpotParticipants {
            buyer: self.spot_buyer(usd_amount),
            seller: self.spot_seller_aapl(aapl_amount),
        }
    }

    // ── Options ───────────────────────────────────────────────────────────────

    /// Account funded with USD to pay option premiums. Works for calls and puts.
    pub fn option_buyer(&self, usd_amount: &str) -> FundedAccount {
        self.funded_account(self.assets.usd, usd_amount)
    }

    /// Account funded with AAPL shares for writing call options.
    /// Call writers must hold the underlying asset they may be required to deliver.
    pub fn call_writer(&self, aapl_collateral: &str) -> FundedAccount {
        self.funded_account(self.assets.aapl, aapl_collateral)
    }

    /// Account funded with USD for writing put options.
    /// Put writers must hold cash to purchase the underlying if assigned.
    pub fn put_writer(&self, usd_collateral: &str) -> FundedAccount {
        self.funded_account(self.assets.usd, usd_collateral)
    }

    /// Both sides of an AAPL call option trade.
    /// Buyer has USD for premium; writer has AAPL for collateral.
    pub fn call_participants(&self, buyer_usd: &str, writer_aapl: &str) -> OptionParticipants {
        OptionParticipants {
            buyer: self.option_buyer(buyer_usd),
            writer: self.call_writer(writer_aapl),
        }
    }

    /// Both sides of an AAPL put option trade.
    /// Buyer has USD for premium; writer has USD for collateral.
    pub fn put_participants(&self, buyer_usd: &str, writer_usd: &str) -> OptionParticipants {
        OptionParticipants {
            buyer: self.option_buyer(buyer_usd),
            writer: self.put_writer(writer_usd),
        }
    }

    // ── Futures ───────────────────────────────────────────────────────────────

    /// Account funded with USD margin for futures trading.
    /// Futures are margin-settled — no base asset wallet needed.
    pub fn futures_trader(&self, margin_usd: &str) -> FundedAccount {
        self.funded_account(self.assets.usd, margin_usd)
    }

    /// Both sides of a futures trade, each funded with USD margin.
    pub fn futures_participants(&self, long_margin: &str, short_margin: &str) -> SpotParticipants {
        SpotParticipants {
            buyer: self.futures_trader(long_margin),
            seller: self.futures_trader(short_margin),
        }
    }

    // ─── Low-Level Primitives (Backward Compatible) ───────────────────────────
    //
    // These remain unchanged. Existing tests continue to work without modification.

    pub fn create_order(&self, account_id: Uuid, side: &str, price: f64, quantity: f64) -> Order {
        let order = Order {
            id: Uuid::new_v4(),
            tenant_id: self.tenant_id,
            account_id,
            instrument_id: self.instrument_id,
            side: OrderSide::from_str(side).expect("Invalid order side"),
            r#type: OrderType::Limit,
            quantity: Decimal::from_f64(quantity).expect("Invalid quantity"),
            price: Decimal::from_f64(price).expect("Invalid price"),
            status: OrderStatus::Open,
            filled_quantity: Decimal::ZERO,
            average_fill_price: Decimal::ZERO,
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        self.order_repo
            .add(order.clone())
            .expect("Failed to add order");
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
            id: Uuid::new_v4(),
            tenant_id: self.tenant_id,
            instrument_id: self.instrument_id,
            buy_order_id,
            sell_order_id,
            price: Decimal::from_f64(price).expect("Invalid trade price"),
            quantity: Decimal::from_f64(quantity).expect("Invalid trade quantity"),
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
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
            Decimal::from_f64(available).expect("Invalid available amount"),
            Decimal::from_f64(locked).expect("Invalid locked amount"),
            Decimal::from_f64(total).expect("Invalid total amount"),
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
            id: Uuid::new_v4(),
            account_id,
            asset_id: Uuid::parse_str(asset_id).expect("Invalid asset_id"),
            available,
            locked,
            total,
            tenant_id: self.tenant_id,
            user_id: "".to_string(),
            version: 1,
            status: "active".to_string(),
            meta: serde_json::Value::Null,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        self.wallet_repo
            .add(wallet.clone())
            .expect("Failed to add wallet");
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
            .expect("Failed to create asset via API")
            .into_inner()
            .asset
            .expect("Asset response missing asset field")
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
            .expect("Failed to create instrument via API")
            .into_inner()
            .instrument
            .expect("Instrument response missing instrument field")
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
            .expect("Failed to create account via API")
            .into_inner()
            .account
            .expect("Account response missing account field")
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
            .expect("Failed to create wallet via API")
            .into_inner()
            .wallet
            .expect("Wallet response missing wallet field")
            .id
    }

    pub async fn deposit_funds_api(&self, wallet_id: impl ToString, amount: &str) {
        let req = Request::new(CreateDepositRequest {
            wallet_id: wallet_id.to_string(),
            amount: amount.to_string(),
            transaction_ref: format!("dep-{}", Uuid::new_v4()),
        });
        self.deposit_api
            .create_deposit(req)
            .await
            .expect("Failed to deposit funds via API");
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

    pub async fn place_limit_order(
        &self,
        account_id: Uuid,
        side: OrderSide,
        price: Decimal,
        quantity: Decimal,
    ) -> Result<Order, ledger::error::AppError> {
        let order = Order {
            id: Uuid::new_v4(),
            tenant_id: self.tenant_id,
            account_id,
            instrument_id: self.instrument_id,
            side,
            r#type: OrderType::Limit,
            quantity,
            price,
            status: OrderStatus::Open,
            filled_quantity: Decimal::ZERO,
            average_fill_price: Decimal::ZERO,
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        self.order_service.create_order(order).await
    }

    pub fn init_test_services(&self) -> (Arc<SettlementService>, Arc<WalletService>) {
        (self.settlement_service.clone(), self.wallet_service.clone())
    }
}
