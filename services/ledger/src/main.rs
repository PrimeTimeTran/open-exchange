use ledger::config::Config;
use ledger::{infra, system};
use ledger::container::Services;
use ledger::proto::{
    ledger::{
        settlement_server::SettlementServer,
        user_service_server::UserServiceServer,
        order_service_server::OrderServiceServer,
        asset_service_server::AssetServiceServer,
        wallet_service_server::WalletServiceServer,
        deposit_service_server::DepositServiceServer,
        account_service_server::AccountServiceServer,
        withdrawal_service_server::WithdrawalServiceServer,
    },
};
use dotenv::dotenv;
use tonic::transport::Server;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Setup Environment & Config
    dotenv().ok();
    
    // Initialize tracing (JSON logs for Cloud Run)
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env().add_directive(tracing::Level::INFO.into()))
        .json()
        .init();

    let config = Config::from_env().expect("Failed to load configuration");

    // 2. Infrastructure Setup
    let db_pool = infra::database::get_db_pool(&config.database_url, config.db_max_connections).await?;
    tracing::info!(database_url = %config.database_url, "Connected to database");

    let matching_client = system::connect_to_matching_engine(&std::env::var("MATCHING_ENGINE_URL").unwrap_or_else(|_| "http://matching:50051".to_string())).await;

    // 3. Initialize Domain Services (Business Logic Layer) & API
    // Services::new now expects the pool to be passed to OrderService internally
    // We need to check services/ledger/src/container.rs to see how Services are constructed.
    let services = Services::new(db_pool.clone(), matching_client);

    // 6. Start Health Check Server
    let health_port = 8081;
    tokio::spawn(async move {
        system::start_health_server(health_port).await;
    });

    // 7. Start gRPC Server
    let addr = format!("[::]:{}", config.port).parse()?;
    tracing::info!(address = %addr, "LedgerService listening");

    Server::builder()
        .add_service(UserServiceServer::new(services.user))
        .add_service(OrderServiceServer::new(services.order))
        .add_service(AssetServiceServer::new(services.asset))
        .add_service(WalletServiceServer::new(services.wallet))
        .add_service(SettlementServer::new(services.settlement))
        .add_service(DepositServiceServer::new(services.deposit))
        .add_service(AccountServiceServer::new(services.account))
        .add_service(WithdrawalServiceServer::new(services.withdrawal))
            .serve(addr)
        .await?;

    Ok(())
}

