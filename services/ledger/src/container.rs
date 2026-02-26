use crate::api::{
    accounts::AccountServiceImpl, assets::AssetServiceImpl, deposits::DepositServiceImpl,
    orders::OrderServiceImpl, settlement::SettlementServiceImpl, users::UserServiceImpl,
    wallets::WalletServiceImpl, withdrawals::WithdrawalServiceImpl,
};
use crate::domain::{
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
use crate::infra::matching_gateway::GrpcMatchingGateway;
use crate::infra::repositories::memory::withdrawal::InMemoryWithdrawalRepository;
use crate::infra::repositories::{
    PostgresAccountRepository, PostgresAssetRepository, PostgresFillRepository,
    PostgresInstrumentRepository, PostgresLedgerRepository, PostgresOrderRepository,
    PostgresTradeRepository, PostgresWalletRepository,
};
use crate::infra::transaction::PostgresTransactionManager;
use crate::proto::matching::matching_client::MatchingClient;
use sqlx::PgPool;
use std::sync::Arc;
use tonic::transport::Channel;

pub struct Services {
    pub user: UserServiceImpl,
    pub asset: AssetServiceImpl,
    pub order: OrderServiceImpl,
    pub wallet: WalletServiceImpl,
    pub account: AccountServiceImpl,
    pub deposit: DepositServiceImpl,
    pub withdrawal: WithdrawalServiceImpl,
    pub settlement: SettlementServiceImpl,
    pub margin: Arc<MarginService>,
    pub cross_margin: Arc<CrossMarginService>,
    pub isolated_margin: Arc<IsolatedMarginService>,
    pub borrow: Arc<BorrowService>,
    pub corporate_action: Arc<CorporateActionService>,
    pub exercise: Arc<ExerciseService>,
    pub funding_rate: Arc<FundingRateService>,
    pub mark_to_market: Arc<MarkToMarketService>,
    pub futures_settlement: Arc<FuturesSettlementService>,
    pub liquidation: Arc<LiquidationService>,
    pub insurance_fund: Arc<InsuranceFundService>,
    pub position_limit: Arc<PositionLimitService>,
}

impl Services {
    pub fn new(db_pool: PgPool, matching_client: Option<MatchingClient<Channel>>) -> Self {
        // 1. Repositories(Data Access Layer)
        let fill_repo = Arc::new(PostgresFillRepository::new(db_pool.clone()));
        let order_repo = Arc::new(PostgresOrderRepository::new(db_pool.clone()));
        let asset_repo = Arc::new(PostgresAssetRepository::new(db_pool.clone()));
        let trade_repo = Arc::new(PostgresTradeRepository::new(db_pool.clone()));
        let ledger_repo = Arc::new(PostgresLedgerRepository::new(db_pool.clone()));
        let wallet_repo = Arc::new(PostgresWalletRepository::new(db_pool.clone()));
        let account_repo = Arc::new(PostgresAccountRepository::new(db_pool.clone()));
        let instrument_repo = Arc::new(PostgresInstrumentRepository::new(db_pool.clone()));
        let user_repo = Arc::new(InMemoryUserRepository::new());
        let deposit_repo = Arc::new(InMemoryDepositRepository::new());
        let withdrawal_repo = Arc::new(InMemoryWithdrawalRepository::new());

        // 2. Domain Services (Business Logic Layer)
        let user_svc = Arc::new(UserService::new(user_repo));
        let deposit_svc = Arc::new(DepositService::new(deposit_repo));
        let fee_svc = Arc::new(StandardFeeService::new());
        let fill_svc = Arc::new(FillService::new(fill_repo));
        let withdrawal_svc = Arc::new(WithdrawalService::new(withdrawal_repo));
        let wallet_svc = Arc::new(WalletService::new(wallet_repo));
        let account_svc = Arc::new(AccountService::new(account_repo.clone()));
        let asset_svc = Arc::new(AssetService::new(
            asset_repo.clone(),
            instrument_repo.clone(),
        ));

        let tx_manager = Arc::new(PostgresTransactionManager::new(db_pool.clone()));
        let gateway = Arc::new(GrpcMatchingGateway::new(matching_client));
        let position_limit_svc =
            Arc::new(PositionLimitService::new(PositionLimitConfig::default()));

        // Create OrderService early so LiquidationService can depend on it
        let order_svc = Arc::new(
            OrderService::builder(order_repo.clone(), wallet_svc.clone(), asset_svc.clone())
                .with_transaction_manager(tx_manager.clone())
                .with_matching_gateway(gateway)
                .with_position_limit_service(position_limit_svc.clone())
                .build(),
        );

        // 2b. New Domain Services (depend on wallet_svc and now order_svc)
        let margin_svc = Arc::new(MarginService::new(wallet_svc.clone()));
        let cross_margin_svc = Arc::new(CrossMarginService::new(wallet_svc.clone()));
        let isolated_margin_svc = Arc::new(IsolatedMarginService::new(wallet_svc.clone()));
        let borrow_svc = Arc::new(BorrowService::new(wallet_svc.clone()));
        let corp_action_svc = Arc::new(CorporateActionService::new(wallet_svc.clone()));
        let exercise_svc = Arc::new(ExerciseService::new(wallet_svc.clone()));
        let funding_rate_svc = Arc::new(FundingRateService::new(wallet_svc.clone()));
        let mark_to_market_svc = Arc::new(MarkToMarketService::new(wallet_svc.clone()));
        let futures_settlement_svc = Arc::new(FuturesSettlementService::new(wallet_svc.clone()));

        // Pass OrderService to LiquidationService
        let liquidation_svc = Arc::new(LiquidationService::new(
            wallet_svc.clone(),
            Some(order_svc.clone()),
        ));
        let insurance_fund_svc = Arc::new(InsuranceFundService::new(wallet_svc.clone()));

        let ledger_svc = Arc::new(LedgerService::new(
            order_repo.clone(),
            instrument_repo.clone(),
            asset_repo.clone(),
            account_repo.clone(),
        ));

        let settlement_svc = Arc::new(SettlementService::new(
            Some(tx_manager.clone()),
            order_svc.clone(),
            instrument_repo.clone(),
            ledger_svc.clone(),
            wallet_svc.clone(),
            fill_svc.clone(),
            fee_svc.clone(),
            ledger_repo.clone(),
            trade_repo.clone(),
        ));

        // 3. Presentation Layer (API)
        let user_api = UserServiceImpl::new(user_svc);
        let account_api = AccountServiceImpl::new(account_svc.clone());
        let asset_api = AssetServiceImpl::new(asset_svc.clone());
        let wallet_api = WalletServiceImpl::new(wallet_svc.clone());
        let withdrawal_api = WithdrawalServiceImpl::new(withdrawal_svc, wallet_svc.clone());
        let settlement_api = SettlementServiceImpl::new(settlement_svc);
        let deposit_api =
            DepositServiceImpl::new(deposit_svc, wallet_svc.clone(), account_svc.clone());
        let order_api = OrderServiceImpl::new(order_svc, fill_svc.clone(), account_svc.clone());

        Self {
            user: user_api,
            order: order_api,
            asset: asset_api,
            wallet: wallet_api,
            account: account_api,
            deposit: deposit_api,
            withdrawal: withdrawal_api,
            settlement: settlement_api,
            margin: margin_svc,
            cross_margin: cross_margin_svc,
            isolated_margin: isolated_margin_svc,
            borrow: borrow_svc,
            corporate_action: corp_action_svc,
            exercise: exercise_svc,
            funding_rate: funding_rate_svc,
            mark_to_market: mark_to_market_svc,
            futures_settlement: futures_settlement_svc,
            liquidation: liquidation_svc,
            insurance_fund: insurance_fund_svc,
            position_limit: position_limit_svc,
        }
    }
}
