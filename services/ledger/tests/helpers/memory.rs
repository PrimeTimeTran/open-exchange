#![allow(dead_code)]
use super::container::Container;
use chrono::Utc;
use rust_decimal::prelude::FromPrimitive;
use rust_decimal::{Decimal, MathematicalOps};
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
    AssetRepository, InMemoryAccountRepository, InMemoryAssetRepository, InMemoryFillRepository,
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

// ─── Object Mother: Return Types ─────────────────────────────────────────────
// These structs are returned by scenario builder methods. They give tests
// named, semantic handles on the accounts and wallets they need — replacing
// raw UUIDs with intent-revealing names like `buyer` and `seller`.

/// Shared with `PostgresTestContext`. Defined in `helpers/mod.rs`.
pub use super::FundedAccount;

/// Both sides of a spot trade, pre-funded and ready for order placement.
pub struct SpotParticipants {
    /// Holds the quote asset (USD). Ready to place buy orders.
    pub buyer: FundedAccount,
    /// Holds the base asset. Ready to place sell orders.
    pub seller: FundedAccount,
}

/// Both sides of an option trade, pre-funded with the correct collateral per option type.
pub struct OptionParticipants {
    /// Holds USD to pay the option premium.
    pub buyer: FundedAccount,
    /// Holds the collateral: AAPL shares for calls, USD for puts.
    pub writer: FundedAccount,
}

// ─── Pre-wired Test Catalogs ──────────────────────────────────────────────────
// Assets and instruments are seeded once in InMemoryTestContext::new() and
// available on every test context. Tests reference them by name instead of
// juggling raw UUIDs or repeating setup code.

/// Assets seeded into every `InMemoryTestContext`. Reference via `ctx.assets.*`.
pub struct TestAssets {
    // ── Crypto ────────────────────────────────────────────
    /// Bitcoin. 8 decimal places (satoshi precision).
    pub btc: Uuid,
    /// Ethereum. 8 decimal places.
    pub eth: Uuid,

    // ── Fiat ──────────────────────────────────────────────
    /// US Dollar. 2 decimal places. Primary quote currency across all instruments.
    pub usd: Uuid,

    // ── Equity ────────────────────────────────────────────
    /// Apple Inc. 2 decimal places. Canonical equity for stock, option, and future tests.
    pub aapl: Uuid,
}

/// Instruments seeded into every `InMemoryTestContext`. Reference via `ctx.instruments.*`.
///
/// All instruments are fully configured with correct settlement asset and metadata,
/// so tests can place orders immediately without any additional instrument setup.
pub struct TestInstruments {
    // ── Spot ──────────────────────────────────────────────
    /// BTC/USD. Also aliased as `ctx.instrument_id` for backward compatibility.
    pub btc_usd: Uuid,
    /// ETH/USD.
    pub eth_usd: Uuid,
    /// AAPL/USD equity spot.
    pub aapl_usd: Uuid,

    // ── Options (AAPL, strike $150.00, expiry Dec 2026) ──
    /// AAPL call. Buyer pays USD premium; writer locks AAPL shares as delivery collateral.
    pub aapl_call: Uuid,
    /// AAPL put. Buyer pays USD premium; writer locks USD (strike × qty) as purchase collateral.
    pub aapl_put: Uuid,

    // ── Futures ───────────────────────────────────────────
    /// BTC perpetual. Margin-settled in USD, no expiry.
    pub btc_perp: Uuid,
    /// AAPL quarterly future. Expiry Mar 2026, 100 shares per contract.
    pub aapl_future: Uuid,
}

// ─── Test Context ─────────────────────────────────────────────────────────────
// InMemoryTestContext is the single entry point for all in-memory integration
// tests. It wires every repository, service, and API handler together and seeds
// the shared test data (assets, instruments, fee account) once on construction.
//
// Tests get a fully operational ledger in one line:
//   let ctx = InMemoryTestContext::new();

pub struct InMemoryTestContext {
    // Repositories — exposed for tests that need to assert on raw repo state
    // (e.g. checking ledger entries or order fills directly).
    pub order_repo: Arc<InMemoryOrderRepository>,
    pub instrument_repo: Arc<InMemoryInstrumentRepository>,
    pub asset_repo: Arc<InMemoryAssetRepository>,
    pub account_repo: Arc<InMemoryAccountRepository>,
    pub wallet_repo: Arc<InMemoryWalletRepository>,
    pub fill_repo: Arc<InMemoryFillRepository>,
    pub ledger_repo: Arc<InMemoryLedgerRepository>,
    pub trade_repo: Arc<InMemoryTradeRepository>,

    // Domain Services — use these to exercise business logic in tests.
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

    // gRPC API handlers — use these to test the full request/response pipeline.
    pub order_api: OrderServiceImpl,
    pub account_api: AccountServiceImpl,
    pub wallet_api: WalletServiceImpl,
    pub asset_api: AssetServiceImpl,
    pub deposit_api: DepositServiceImpl,
    pub withdrawal_api: WithdrawalServiceImpl,
    pub user_api: UserServiceImpl,
    pub settlement_api: SettlementServiceImpl,

    // Pre-wired catalogs — reference assets and instruments by semantic name.
    pub assets: TestAssets,
    pub instruments: TestInstruments,

    // Backward-compatible aliases — legacy tests using ctx.btc_id, ctx.usd_id,
    // or ctx.instrument_id continue to compile without changes.
    pub tenant_id: Uuid,
    pub user_id: Uuid,
    pub instrument_id: Uuid, // alias for instruments.btc_usd
    pub btc_id: Uuid,        // alias for assets.btc
    pub usd_id: Uuid,        // alias for assets.usd
    pub account_a: Uuid,
    pub account_b: Uuid,
}

impl InMemoryTestContext {
    pub fn new() -> Self {
        let c = Container::new();

        let tenant_id = Uuid::new_v4();
        let user_id = Uuid::new_v4();

        // Asset IDs — generated here so instruments can reference them during seeding.
        let btc_id = Uuid::new_v4();
        let eth_id = Uuid::new_v4();
        let usd_id = Uuid::new_v4();
        let aapl_id = Uuid::new_v4();

        // Instrument IDs
        let btc_usd_id = Uuid::new_v4();
        let eth_usd_id = Uuid::new_v4();
        let aapl_usd_id = Uuid::new_v4();
        let aapl_call_id = Uuid::new_v4();
        let aapl_put_id = Uuid::new_v4();
        let btc_perp_id = Uuid::new_v4();
        let aapl_future_id = Uuid::new_v4();

        // ── Seed Assets ───────────────────────────────────────────────────────
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

        // ── Seed System Accounts ──────────────────────────────────────────────
        // The fee account is required by SettlementService. Without it, any
        // test that settles a trade will panic.
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

        // ── Seed Instruments ──────────────────────────────────────────────────
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

            tenant_id,
            user_id,
            instrument_id: btc_usd_id,
            btc_id,
            usd_id,
            account_a: Uuid::new_v4(),
            account_b: Uuid::new_v4(),
        }
    }

    // ── Wallet Queries ────────────────────────────────────────────────────────
    // One-line shortcuts for reading wallet state in assertions.
    // Both methods panic with a clear message if the wallet is missing,
    // so assertion failures point directly at the missing wallet rather than
    // unwinding through the service call chain.

    /// Fetch a wallet for a pre-wired catalog asset. Panics if not found.
    ///
    /// Use `wallet_str` when the asset ID comes from an API call (as a `String`).
    pub async fn wallet(
        &self,
        account_id: Uuid,
        asset_id: Uuid,
    ) -> ledger::domain::wallets::Wallet {
        self.wallet_service
            .get_wallet_by_account_and_asset(&account_id.to_string(), &asset_id.to_string())
            .await
            .expect("wallet: service error")
            .expect("wallet: not found")
    }

    /// Fetch a wallet when the account and asset IDs are already strings.
    ///
    /// Useful for tests that create assets via `create_asset_api`, which returns `String`.
    /// For pre-wired catalog assets, prefer `wallet` to keep call sites cleaner.
    pub async fn wallet_str(
        &self,
        account_id: &str,
        asset_id: &str,
    ) -> ledger::domain::wallets::Wallet {
        self.wallet_service
            .get_wallet_by_account_and_asset(account_id, asset_id)
            .await
            .expect("wallet_str: service error")
            .expect("wallet_str: not found")
    }

    // ── Wallet Seeding ────────────────────────────────────────────────────────
    // These methods write wallet state directly to the repository, bypassing
    // the service layer. This is intentional for unit tests that need to control
    // specific available/locked splits without going through order placement.
    //
    // Use seed_wallet and empty_wallet for most tests.
    // Use create_wallet / create_wallet_decimal only when you need raw Decimal control.

    // Returns the decimal precision for a known asset. Falls back to an asset repo
    // lookup for assets created dynamically (e.g. via create_asset_api).
    async fn get_asset_decimals(&self, asset_id: Uuid) -> u32 {
        if asset_id == self.assets.btc {
            return 8;
        }
        if asset_id == self.assets.eth {
            return 8;
        }
        if asset_id == self.assets.usd {
            return 2;
        }
        if asset_id == self.assets.aapl {
            return 2;
        }

        let asset = self
            .asset_repo
            .get(asset_id)
            .await
            .expect("AssetRepo error")
            .expect("Asset not found");
        asset.decimals as u32
    }

    /// Creates a zero-balance wallet (available=0, locked=0, total=0).
    ///
    /// Use this to create a destination wallet before settlement tries to credit it.
    /// The spot participant methods call this automatically for counter-asset wallets.
    pub fn empty_wallet(&self, account_id: Uuid, asset_id: Uuid) {
        self.create_wallet_decimal(
            account_id,
            &asset_id.to_string(),
            Decimal::ZERO,
            Decimal::ZERO,
            Decimal::ZERO,
        );
    }

    /// Seeds a wallet with human-scale amounts (e.g. `1.5` BTC, `50000.0` USD).
    /// Converts to atomic units automatically using each asset's decimal precision.
    ///
    /// Prefer this over `create_wallet` and `create_wallet_decimal` — it accepts
    /// Uuid directly, removes the `.to_string()` noise, and eliminates the risk
    /// of passing the wrong decimal scale.
    pub async fn seed_wallet(
        &self,
        account_id: Uuid,
        asset_id: Uuid,
        available: f64,
        locked: f64,
        total: f64,
    ) -> ledger::domain::wallets::Wallet {
        let decimals = self.get_asset_decimals(asset_id).await;
        let scale = Decimal::from(10).powu(decimals as u64);

        let to_atomic = |val: f64| -> Decimal {
            (Decimal::from_f64(val).expect("Invalid float") * scale).floor()
        };

        self.create_wallet_decimal(
            account_id,
            &asset_id.to_string(),
            to_atomic(available),
            to_atomic(locked),
            to_atomic(total),
        )
    }

    /// Creates a new account and seeds it with `amount` of `asset_id`.
    /// Returns the account ID and the wallet ID for direct use in tests.
    ///
    /// This is the core primitive that all scenario builder methods delegate to.
    /// Tests rarely need to call this directly — prefer the named scenario methods
    /// (`spot_buyer`, `btc_spot_participants`, etc.) which convey intent.
    pub async fn funded_account(&self, asset_id: Uuid, amount: f64) -> FundedAccount {
        let account_id = Uuid::new_v4();

        let decimals = self.get_asset_decimals(asset_id).await;
        let scale = Decimal::from(10).powu(decimals as u64);
        let amount_atomic = (Decimal::from_f64(amount).expect("Invalid float") * scale).floor();

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
            amount_atomic,
            Decimal::ZERO,
            amount_atomic,
        );

        FundedAccount {
            account_id,
            wallet_id: wallet.id,
        }
    }

    // ── Scenario Builders: Spot ───────────────────────────────────────────────
    // These methods answer the question "what does this test need?" rather than
    // "how do I set up an account and wallet?". Use them to keep test setup
    // to one or two lines and keep the focus on the behaviour being tested.

    /// A new account funded with USD, ready to place buy orders on any spot instrument.
    pub async fn spot_buyer(&self, usd_amount: f64) -> FundedAccount {
        self.funded_account(self.assets.usd, usd_amount).await
    }

    /// A new account funded with BTC, ready to place sell orders on BTC-USD.
    pub async fn spot_seller_btc(&self, btc_amount: f64) -> FundedAccount {
        self.funded_account(self.assets.btc, btc_amount).await
    }

    /// A new account funded with ETH, ready to place sell orders on ETH-USD.
    pub async fn spot_seller_eth(&self, eth_amount: f64) -> FundedAccount {
        self.funded_account(self.assets.eth, eth_amount).await
    }

    /// A new account funded with AAPL shares, ready to place sell orders on AAPL-USD.
    pub async fn spot_seller_aapl(&self, aapl_amount: f64) -> FundedAccount {
        self.funded_account(self.assets.aapl, aapl_amount).await
    }

    /// Both sides of a BTC/USD spot trade, with all four wallets pre-created.
    ///
    /// buyer  → USD wallet (funded) + BTC wallet (empty, for receiving)
    /// seller → BTC wallet (funded) + USD wallet (empty, for receiving)
    ///
    /// Settlement requires a destination wallet to exist before it credits funds.
    /// This method handles that automatically so tests don't have to.
    pub async fn btc_spot_participants(
        &self,
        usd_amount: f64,
        btc_amount: f64,
    ) -> SpotParticipants {
        let buyer = self.spot_buyer(usd_amount).await;
        let seller = self.spot_seller_btc(btc_amount).await;
        self.empty_wallet(buyer.account_id, self.assets.btc);
        self.empty_wallet(seller.account_id, self.assets.usd);
        SpotParticipants { buyer, seller }
    }

    /// Both sides of an ETH/USD spot trade, with all four wallets pre-created.
    pub async fn eth_spot_participants(
        &self,
        usd_amount: f64,
        eth_amount: f64,
    ) -> SpotParticipants {
        let buyer = self.spot_buyer(usd_amount).await;
        let seller = self.spot_seller_eth(eth_amount).await;
        self.empty_wallet(buyer.account_id, self.assets.eth);
        self.empty_wallet(seller.account_id, self.assets.usd);
        SpotParticipants { buyer, seller }
    }

    /// Both sides of an AAPL/USD spot trade, with all four wallets pre-created.
    pub async fn aapl_spot_participants(
        &self,
        usd_amount: f64,
        aapl_amount: f64,
    ) -> SpotParticipants {
        let buyer = self.spot_buyer(usd_amount).await;
        let seller = self.spot_seller_aapl(aapl_amount).await;
        self.empty_wallet(buyer.account_id, self.assets.aapl);
        self.empty_wallet(seller.account_id, self.assets.usd);
        SpotParticipants { buyer, seller }
    }

    // ── Scenario Builders: Options ────────────────────────────────────────────

    /// A new account funded with USD to pay option premiums. Works for calls and puts.
    pub async fn option_buyer(&self, usd_amount: f64) -> FundedAccount {
        self.funded_account(self.assets.usd, usd_amount).await
    }

    /// A new account funded with AAPL shares to write call options.
    /// Call writers must hold the underlying they may be required to deliver.
    pub async fn call_writer(&self, aapl_collateral: f64) -> FundedAccount {
        self.funded_account(self.assets.aapl, aapl_collateral).await
    }

    /// A new account funded with USD to write put options.
    /// Put writers must hold cash to purchase the underlying if assigned.
    pub async fn put_writer(&self, usd_collateral: f64) -> FundedAccount {
        self.funded_account(self.assets.usd, usd_collateral).await
    }

    /// Both sides of an AAPL call option trade.
    /// Buyer has USD for the premium; writer has AAPL as delivery collateral.
    pub async fn call_participants(&self, buyer_usd: f64, writer_aapl: f64) -> OptionParticipants {
        OptionParticipants {
            buyer: self.option_buyer(buyer_usd).await,
            writer: self.call_writer(writer_aapl).await,
        }
    }

    /// Both sides of an AAPL put option trade.
    /// Buyer has USD for the premium; writer has USD as purchase collateral.
    pub async fn put_participants(&self, buyer_usd: f64, writer_usd: f64) -> OptionParticipants {
        OptionParticipants {
            buyer: self.option_buyer(buyer_usd).await,
            writer: self.put_writer(writer_usd).await,
        }
    }

    // ── Scenario Builders: Futures ────────────────────────────────────────────

    /// A new account funded with USD margin for futures trading.
    /// Futures are margin-settled — no base asset wallet is required.
    pub async fn futures_trader(&self, margin_usd: f64) -> FundedAccount {
        self.funded_account(self.assets.usd, margin_usd).await
    }

    /// Both sides of a futures trade, each funded with the given USD margin.
    pub async fn futures_participants(
        &self,
        long_margin: f64,
        short_margin: f64,
    ) -> SpotParticipants {
        SpotParticipants {
            buyer: self.futures_trader(long_margin).await,
            seller: self.futures_trader(short_margin).await,
        }
    }

    // ── Repo-Direct Primitives ────────────────────────────────────────────────
    // These write to the repository layer directly, bypassing service-layer
    // validation and side effects (e.g. fund locking). Use them in tests that
    // need to control exact wallet state (available, locked, total) as a
    // pre-condition — for example, settlement unit tests that simulate an
    // already-matched order without going through the order service.

    /// Creates an order directly in the order repo using float amounts.
    pub fn seed_order(&self, account_id: Uuid, side: &str, price: f64, quantity: f64) -> Order {
        self.create_order(account_id, side, &price.to_string(), &quantity.to_string())
    }

    /// Creates an order directly in the order repo, skipping fund locking.
    /// Use `place_limit_order` instead when you need funds locked as a side effect.
    pub fn create_order(&self, account_id: Uuid, side: &str, price: &str, quantity: &str) -> Order {
        let order = Order {
            id: Uuid::new_v4(),
            tenant_id: self.tenant_id,
            account_id,
            instrument_id: self.instrument_id,
            side: OrderSide::from_str(side).expect("Invalid order side"),
            r#type: OrderType::Limit,
            quantity: Decimal::from_str(quantity).expect("Invalid quantity"),
            price: Decimal::from_str(price).expect("Invalid price"),
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

    /// Builds a Trade struct using float amounts without persisting it.
    pub fn seed_trade(
        &self,
        buy_order_id: Uuid,
        sell_order_id: Uuid,
        price: f64,
        quantity: f64,
    ) -> Trade {
        self.create_trade(
            buy_order_id,
            sell_order_id,
            &price.to_string(),
            &quantity.to_string(),
        )
    }

    /// Builds a Trade struct without persisting it. Pass to `settlement_service.process_trade_event`.
    pub fn create_trade(
        &self,
        buy_order_id: Uuid,
        sell_order_id: Uuid,
        price: &str,
        quantity: &str,
    ) -> Trade {
        Trade {
            id: Uuid::new_v4(),
            tenant_id: self.tenant_id,
            instrument_id: self.instrument_id,
            buy_order_id,
            sell_order_id,
            price: Decimal::from_str(price).expect("Invalid trade price"),
            quantity: Decimal::from_str(quantity).expect("Invalid trade quantity"),
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }

    /// Writes a wallet directly to the repo with raw f64 amounts (no precision scaling).
    /// Values are stored as-is — be explicit about whether you're passing atomic units or
    /// human-scale amounts. Prefer `seed_wallet` for human-scale amounts.
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

    /// Writes a wallet directly to the repo with exact Decimal amounts.
    /// The underlying primitive — all other wallet seeding methods call this.
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

    // ── API Helpers ───────────────────────────────────────────────────────────
    // These helpers exercise the full gRPC request/response pipeline. Use them
    // when a test specifically needs to go through the API layer — for example,
    // to verify proto serialization, request validation, or response shape.
    // For most domain logic tests, prefer the domain service directly.

    /// Creates an asset via the gRPC API. Returns the new asset ID as a String.
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

    /// Creates a spot instrument via the gRPC API. Returns the new instrument ID as a String.
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

    /// Creates an account via the gRPC API. Returns the new account ID as a String.
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

    /// Creates a wallet via the gRPC API. Returns the new wallet ID as a String.
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

    /// Deposits funds into a wallet via the gRPC API. Amount is a decimal string (e.g. "1000").
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

    /// Builds a proto Order object using float amounts.
    pub fn seed_order_proto(
        &self,
        account_id: impl ToString,
        instrument_id: impl ToString,
        side: ledger::proto::common::OrderSide,
        price: f64,
        quantity: f64,
    ) -> ledger::proto::common::Order {
        self.create_order_object(
            account_id,
            instrument_id,
            side,
            &quantity.to_string(),
            &price.to_string(),
        )
    }

    /// Builds a proto Order object. Use when testing handlers that accept proto types directly.
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

    // ── Service Helpers ───────────────────────────────────────────────────────

    /// Places a limit order through the domain service using float amounts.
    pub async fn place_order(
        &self,
        account_id: Uuid,
        side: OrderSide,
        price: f64,
        quantity: f64,
    ) -> Result<Order, ledger::error::AppError> {
        self.place_limit_order(account_id, side, price, quantity)
            .await
    }

    /// Places a limit order through the domain service, which locks funds as a side effect.
    /// Use this when the test needs realistic pre-settlement wallet state
    /// (locked funds corresponding to open orders).
    pub async fn place_limit_order(
        &self,
        account_id: Uuid,
        side: OrderSide,
        price: f64,
        quantity: f64,
    ) -> Result<Order, ledger::error::AppError> {
        let order = Order {
            id: Uuid::new_v4(),
            tenant_id: self.tenant_id,
            account_id,
            instrument_id: self.instrument_id,
            side,
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

        self.order_service.create_order(order).await
    }

    /// Places a limit order on a specific instrument through the domain service.
    pub async fn place_limit_order_on_instrument(
        &self,
        account_id: Uuid,
        instrument_id: Uuid,
        side: OrderSide,
        price: f64,
        quantity: f64,
    ) -> Result<Order, ledger::error::AppError> {
        let order = Order {
            id: Uuid::new_v4(),
            tenant_id: self.tenant_id,
            account_id,
            instrument_id,
            side,
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

        self.order_service.create_order(order).await
    }
}
