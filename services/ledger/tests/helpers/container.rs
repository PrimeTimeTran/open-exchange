use std::sync::Arc;

use ledger::domain::{
    accounts::AccountService,
    assets::AssetService,
    borrow::BorrowService,
    corporate_actions::CorporateActionService,
    deposits::{DepositService, InMemoryDepositRepository},
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
    users::{InMemoryUserRepository, UserService},
    wallets::WalletService,
    withdrawals::WithdrawalService,
};

use ledger::api::{
    accounts::AccountServiceImpl, assets::AssetServiceImpl, deposits::DepositServiceImpl,
    orders::OrderServiceImpl, settlement::SettlementServiceImpl, users::UserServiceImpl,
    wallets::WalletServiceImpl, withdrawals::WithdrawalServiceImpl,
};

use ledger::infra::repositories::{
    InMemoryAccountRepository, InMemoryAssetRepository, InMemoryFillRepository,
    InMemoryInstrumentRepository, InMemoryLedgerRepository, InMemoryOrderRepository,
    InMemoryTradeRepository, InMemoryWalletRepository,
};

use ledger::infra::transaction::InMemoryTransactionManager;

pub struct Container {
    // Repositories
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

    // API Services
    pub order_api: OrderServiceImpl,
    pub account_api: AccountServiceImpl,
    pub wallet_api: WalletServiceImpl,
    pub asset_api: AssetServiceImpl,
    pub deposit_api: DepositServiceImpl,
    pub withdrawal_api: WithdrawalServiceImpl,
    pub user_api: UserServiceImpl,
    pub settlement_api: SettlementServiceImpl,
}

impl Container {
    pub fn new() -> Self {
        // ── 1. Repositories ───────────────────────────────────────────────────
        let order_repo = Arc::new(InMemoryOrderRepository::new());
        let instrument_repo = Arc::new(InMemoryInstrumentRepository::new());
        let asset_repo = Arc::new(InMemoryAssetRepository::new());
        let account_repo = Arc::new(InMemoryAccountRepository::new());
        let wallet_repo = Arc::new(InMemoryWalletRepository::new());
        let fill_repo = Arc::new(InMemoryFillRepository::new());
        let ledger_repo = Arc::new(InMemoryLedgerRepository::new());
        let trade_repo = Arc::new(InMemoryTradeRepository::new());

        // ── 2. Domain Services ────────────────────────────────────────────────
        let user_service = Arc::new(UserService::new(Arc::new(InMemoryUserRepository::new())));
        let account_service = Arc::new(AccountService::new(account_repo.clone()));
        let wallet_service = Arc::new(WalletService::new(wallet_repo.clone()));
        let asset_service = Arc::new(AssetService::new(
            asset_repo.clone(),
            instrument_repo.clone(),
        ));
        let fee_service = Arc::new(StandardFeeService::new());
        let fill_service = Arc::new(FillService::new(fill_repo.clone()));
        let deposit_service = Arc::new(DepositService::new(Arc::new(
            InMemoryDepositRepository::new(),
        )));
        let withdrawal_repo = Arc::new(
            ledger::infra::repositories::memory::withdrawal::InMemoryWithdrawalRepository::new(),
        );
        let withdrawal_service = Arc::new(WithdrawalService::new(withdrawal_repo));

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

        // ── 3. API Services ───────────────────────────────────────────────────
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
        }
    }
}
