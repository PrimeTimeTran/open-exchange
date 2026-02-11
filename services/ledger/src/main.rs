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
    PostgresLedgerRepository
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
    dotenv().ok();
    env_logger::init();

    // Load Configuration
    let config = Config::from_env().expect("Failed to load configuration");

    // Database Connection
    println!("Connecting to database: {}", config.database_url);
    let db_pool = infra::database::get_db_pool(&config.database_url).await?;
    println!("Database connected successfully.");

    // Repositories
    let order_repo = Arc::new(PostgresOrderRepository::new(db_pool.clone()));
    let account_repo = Arc::new(PostgresAccountRepository::new(db_pool.clone()));
    let wallet_repo = Arc::new(PostgresWalletRepository::new(db_pool.clone()));
    let asset_repo = Arc::new(PostgresAssetRepository::new(db_pool.clone()));
    let instrument_repo = Arc::new(PostgresInstrumentRepository::new(db_pool.clone()));
    let fill_repo = Arc::new(PostgresFillRepository::new(db_pool.clone()));

    let ledger_repo = Arc::new(PostgresLedgerRepository::new(db_pool.clone()));

    // Services (Domain)
    let wallet_service = Arc::new(WalletService::new(wallet_repo));
    let asset_service = Arc::new(AssetService::new(asset_repo, instrument_repo.clone()));
    let order_service = Arc::new(OrderService::new(
        order_repo.clone(), 
        wallet_service.clone(), 
        asset_service.clone()
    ));
    let account_service = Arc::new(AccountService::new(account_repo));
    let deposit_service = Arc::new(DepositService::new());
    let withdrawal_service = Arc::new(WithdrawalService::new());
    let user_service = Arc::new(UserService::new());
    
    // Domain Services
    let ledger_service = Arc::new(LedgerService::new(order_repo.clone(), instrument_repo.clone()));
    let fill_service = Arc::new(FillService::new(fill_repo.clone()));
    let settlement_service = Arc::new(SettlementService::new(
        Some(db_pool.clone()),
        order_service.clone(), 
        instrument_repo.clone(), 
        ledger_service.clone(),
        wallet_service.clone(),
        fill_service.clone(),
        ledger_repo.clone(),
    ));

    // Matching Engine Connection
    let matching_engine_url = std::env::var("MATCHING_ENGINE_URL")
        .unwrap_or_else(|_| "http://matching:50051".to_string());
    println!("Connecting to Matching Engine at: {}", matching_engine_url);

    // Using Option<MatchingClient> but populated later if needed, or we just connect once and clone.
    // Ideally we want to start serving even if matching engine is down.
    // But OrderServiceImpl needs the client.
    // Let's rely on tonic's lazy connection or make the connection retry loop not block main.
    
    // For now, let's just create the channel lazily.
    // system::connect_to_matching_engine blocks, which prevents the server from starting.
    // We should make it non-blocking or just use endpoint connect which is lazy.
    
    // Changing strategy: Don't block on matching engine connection.
    let channel = tonic::transport::Endpoint::from_shared(matching_engine_url.clone())?
        .connect_lazy();
    let matching_client = Some(ledger::proto::matching::matching_client::MatchingClient::new(channel));
    println!("Lazy connected to Matching Engine at {}", matching_engine_url);

    // Start HTTP Health Server
    let health_port = 8081;
    tokio::spawn(async move {
        system::start_health_server(health_port).await;
    });

    let addr = format!("[::]:{}", config.port).parse()?;

    // API Services
    let order_impl = OrderServiceImpl::new(order_service, asset_service.clone(), matching_client);
    let account_impl = AccountServiceImpl::new(account_service);
    let wallet_impl = WalletServiceImpl::new(wallet_service.clone());
    let asset_impl = AssetServiceImpl::new(asset_service);
    let deposit_impl = DepositServiceImpl::new(deposit_service, wallet_service.clone());
    let withdrawal_impl = WithdrawalServiceImpl::new(withdrawal_service);
    let user_impl = UserServiceImpl::new(user_service);
    let settlement_impl = SettlementServiceImpl::new(settlement_service);

    println!("LedgerService listening on {}", addr);

    Server::builder()
        .add_service(OrderServiceServer::new(order_impl))
        .add_service(AccountServiceServer::new(account_impl))
        .add_service(WalletServiceServer::new(wallet_impl))
        .add_service(AssetServiceServer::new(asset_impl))
        .add_service(DepositServiceServer::new(deposit_impl))
        .add_service(WithdrawalServiceServer::new(withdrawal_impl))
        .add_service(UserServiceServer::new(user_impl))
        .add_service(SettlementServer::new(settlement_impl))
        .serve(addr)
        .await?;

    Ok(())
}

