use crate::infra::repositories::{
    PostgresFillRepository,
    PostgresOrderRepository, 
    PostgresTradeRepository,
    PostgresAssetRepository,
    PostgresWalletRepository,
    PostgresLedgerRepository,
    PostgresAccountRepository, 
    PostgresInstrumentRepository,
};
use crate::domain::{
    users::UserService,
    orders::OrderService,
    assets::AssetService,
    wallets::WalletService,
    deposits::DepositService,
    accounts::AccountService,
    fills::service::FillService,
    withdrawals::WithdrawalService,
    ledger::service::LedgerService,
    fees::service::StandardFeeService,
    settlement::service::SettlementService,
};
use crate::api::{
    users::UserServiceImpl,
    orders::OrderServiceImpl,
    assets::AssetServiceImpl,
    wallets::WalletServiceImpl,
    accounts::AccountServiceImpl,
    deposits::DepositServiceImpl,
    settlement::SettlementServiceImpl,
    withdrawals::WithdrawalServiceImpl,
};
use sqlx::PgPool;
use std::sync::Arc;
use tonic::transport::Channel;
use crate::proto::matching::matching_client::MatchingClient;

pub struct Services {
    pub user: UserServiceImpl,
    pub asset: AssetServiceImpl,
    pub order: OrderServiceImpl,
    pub wallet: WalletServiceImpl,
    pub account: AccountServiceImpl,
    pub deposit: DepositServiceImpl,
    pub withdrawal: WithdrawalServiceImpl,
    pub settlement: SettlementServiceImpl,
}

impl Services {
    pub fn new(
        db_pool: PgPool, 
        matching_client: Option<MatchingClient<Channel>>
    ) -> Self {
        // 3. Initialize Repositories (Data Access Layer)
        let fill_repo = Arc::new(PostgresFillRepository::new(db_pool.clone()));
        let order_repo = Arc::new(PostgresOrderRepository::new(db_pool.clone()));
        let asset_repo = Arc::new(PostgresAssetRepository::new(db_pool.clone()));
        let trade_repo = Arc::new(PostgresTradeRepository::new(db_pool.clone()));
        let ledger_repo = Arc::new(PostgresLedgerRepository::new(db_pool.clone()));
        let wallet_repo = Arc::new(PostgresWalletRepository::new(db_pool.clone()));
        let account_repo = Arc::new(PostgresAccountRepository::new(db_pool.clone()));
        let instrument_repo = Arc::new(PostgresInstrumentRepository::new(db_pool.clone()));

        // 4. Initialize Domain Services (Business Logic Layer)
        let user_svc = Arc::new(UserService::new());
        let deposit_svc = Arc::new(DepositService::new());
        let fee_svc = Arc::new(StandardFeeService::new());
        let fill_svc = Arc::new(FillService::new(fill_repo));
        let withdrawal_svc = Arc::new(WithdrawalService::new());
        let wallet_svc = Arc::new(WalletService::new(wallet_repo));
        let account_svc = Arc::new(AccountService::new(account_repo.clone()));
        let asset_svc = Arc::new(AssetService::new(asset_repo.clone(), instrument_repo.clone()));
        
        let order_svc = Arc::new(OrderService::new(
            order_repo.clone(), 
            wallet_svc.clone(), 
            asset_svc.clone()
        ));

        let ledger_svc = Arc::new(LedgerService::new(
            order_repo.clone(), 
            instrument_repo.clone(), 
            asset_repo.clone(),
            account_repo.clone()
        ));

        let settlement_svc = Arc::new(SettlementService::new(
            Some(db_pool.clone()),
            order_svc.clone(), 
            instrument_repo.clone(), 
            ledger_svc.clone(),
            wallet_svc.clone(),
            fill_svc.clone(),
            fee_svc.clone(),
            ledger_repo.clone(),
            trade_repo.clone(),
        ));

        // 5. Initialize API Implementations (Presentation Layer)
        let user_api = UserServiceImpl::new(user_svc);
        let account_api = AccountServiceImpl::new(account_svc);
        let asset_api = AssetServiceImpl::new(asset_svc.clone());
        let wallet_api = WalletServiceImpl::new(wallet_svc.clone());
        let withdrawal_api = WithdrawalServiceImpl::new(withdrawal_svc);
        let settlement_api = SettlementServiceImpl::new(settlement_svc);
        let deposit_api = DepositServiceImpl::new(deposit_svc, wallet_svc.clone());
        let order_api = OrderServiceImpl::new(order_svc, asset_svc, fill_svc.repo().clone(), matching_client);

        Self {
            order: order_api,
            account: account_api,
            wallet: wallet_api,
            asset: asset_api,
            deposit: deposit_api,
            withdrawal: withdrawal_api,
            user: user_api,
            settlement: settlement_api,
        }
    }
}
