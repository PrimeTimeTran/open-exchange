use std::sync::Arc;
use dotenv::dotenv;
use tonic::transport::Server;

use ledger::config::Config;
use ledger::{infra, system};
use ledger::api::{
    orders::OrderServiceImpl,
    accounts::AccountServiceImpl,
    wallets::WalletServiceImpl,
    assets::AssetServiceImpl,
    deposits::DepositServiceImpl,
    withdrawals::WithdrawalServiceImpl,
    users::UserServiceImpl,
    settlement::SettlementServiceImpl,
};
use ledger::domain::{
    orders::OrderService,
    accounts::AccountService,
    wallets::WalletService,
    assets::AssetService,
    deposits::DepositService,
    withdrawals::WithdrawalService,
    users::UserService,
    ledger::service::LedgerService,
    settlement::service::SettlementService,
    fills::service::FillService,
};
use ledger::infra::repositories::{
    PostgresOrderRepository, 
    PostgresAccountRepository, 
    PostgresWalletRepository,
    PostgresAssetRepository,
    PostgresInstrumentRepository,
    PostgresFillRepository,
    PostgresLedgerRepository,
    PostgresTradeRepository
};
use ledger::proto::{
    ledger::{
        order_service_server::OrderServiceServer,
        account_service_server::AccountServiceServer,
        wallet_service_server::WalletServiceServer,
        asset_service_server::AssetServiceServer,
        deposit_service_server::DepositServiceServer,
        withdrawal_service_server::WithdrawalServiceServer,
        user_service_server::UserServiceServer,
        settlement_server::SettlementServer,
    },
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Setup Environment & Config
    dotenv().ok();
    env_logger::init();
    let config = Config::from_env().expect("Failed to load configuration");

    // 2. Infrastructure Setup
    println!("Connecting to database: {}", config.database_url);
    let db_pool = infra::database::get_db_pool(&config.database_url).await?;
    println!("Database connected successfully.");

    let matching_client = connect_to_matching_engine().await;

    // 3. Initialize Repositories (Data Access Layer)
    let order_repo = Arc::new(PostgresOrderRepository::new(db_pool.clone()));
    let account_repo = Arc::new(PostgresAccountRepository::new(db_pool.clone()));
    let wallet_repo = Arc::new(PostgresWalletRepository::new(db_pool.clone()));
    let asset_repo = Arc::new(PostgresAssetRepository::new(db_pool.clone()));
    let instrument_repo = Arc::new(PostgresInstrumentRepository::new(db_pool.clone()));
    let fill_repo = Arc::new(PostgresFillRepository::new(db_pool.clone()));
    let ledger_repo = Arc::new(PostgresLedgerRepository::new(db_pool.clone()));
    let trade_repo = Arc::new(PostgresTradeRepository::new(db_pool.clone()));

    // 4. Initialize Domain Services (Business Logic Layer)
    let wallet_svc = Arc::new(WalletService::new(wallet_repo));
    let asset_svc = Arc::new(AssetService::new(asset_repo.clone(), instrument_repo.clone()));
    let account_svc = Arc::new(AccountService::new(account_repo.clone()));
    let deposit_svc = Arc::new(DepositService::new());
    let withdrawal_svc = Arc::new(WithdrawalService::new());
    let user_svc = Arc::new(UserService::new());
    let fill_svc = Arc::new(FillService::new(fill_repo));
    
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
        ledger_repo.clone(),
        trade_repo.clone(),
    ));

    // 5. Initialize API Implementations (Presentation Layer)
    let order_api = OrderServiceImpl::new(order_svc, asset_svc.clone(), fill_svc.repo().clone(), matching_client);
    let account_api = AccountServiceImpl::new(account_svc);
    let wallet_api = WalletServiceImpl::new(wallet_svc.clone());
    let asset_api = AssetServiceImpl::new(asset_svc);
    let deposit_api = DepositServiceImpl::new(deposit_svc, wallet_svc.clone());
    let withdrawal_api = WithdrawalServiceImpl::new(withdrawal_svc);
    let user_api = UserServiceImpl::new(user_svc);
    let settlement_api = SettlementServiceImpl::new(settlement_svc);

    // 6. Start Health Check Server
    let health_port = 8081;
    tokio::spawn(async move {
        system::start_health_server(health_port).await;
    });

    // 7. Start gRPC Server
    let addr = format!("[::]:{}", config.port).parse()?;
    println!("LedgerService listening on {}", addr);

    Server::builder()
        .add_service(OrderServiceServer::new(order_api))
        .add_service(AccountServiceServer::new(account_api))
        .add_service(WalletServiceServer::new(wallet_api))
        .add_service(AssetServiceServer::new(asset_api))
        .add_service(DepositServiceServer::new(deposit_api))
        .add_service(WithdrawalServiceServer::new(withdrawal_api))
        .add_service(UserServiceServer::new(user_api))
        .add_service(SettlementServer::new(settlement_api))
        .serve(addr)
        .await?;

    Ok(())
}

async fn connect_to_matching_engine() -> Option<ledger::proto::matching::matching_client::MatchingClient<tonic::transport::Channel>> {
    let url = std::env::var("MATCHING_ENGINE_URL").unwrap_or_else(|_| "http://matching:50051".to_string());
    println!("Connecting to Matching Engine at: {}", url);
    match tonic::transport::Endpoint::from_shared(url.clone()) {
        Ok(endpoint) => {
            let channel = endpoint.connect_lazy();
            println!("Lazy connected to Matching Engine at {}", url);
            Some(ledger::proto::matching::matching_client::MatchingClient::new(channel))
        },
        Err(e) => {
            eprintln!("Invalid Matching Engine URL: {}", e);
            None
        }
    }
}

