use tonic::transport::Server;
use ledger::api::hello::MyGreeter;
use ledger::api::ledger::LedgerImpl;
use ledger::proto::hello_world::greeter_server::GreeterServer;
use ledger::proto::ledger::ledger_service_server::LedgerServiceServer;
use ledger::{infra, system};
use ledger::config::Config;
use ledger::domain::orders::OrderService;
use ledger::domain::accounts::AccountService;
use ledger::domain::wallets::WalletService;
use ledger::domain::assets::AssetService;
use ledger::infra::repositories::{PostgresOrderRepository, PostgresAccountRepository, PostgresWalletRepository, PostgresInstrumentRepository};
use std::sync::Arc;
use dotenv::dotenv;

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
    let asset_repo = Arc::new(ledger::infra::repositories::PostgresAssetRepository::new(db_pool.clone()));
    let instrument_repo = Arc::new(ledger::infra::repositories::PostgresInstrumentRepository::new(db_pool.clone()));

    // Services
    let wallet_service = WalletService::new(wallet_repo);
    let asset_service = AssetService::new(asset_repo, instrument_repo);
    
    let order_service = OrderService::new(
        order_repo, 
        Arc::new(wallet_service.clone()), 
        Arc::new(asset_service.clone())
    );
    let account_service = AccountService::new(account_repo);

    // Matching Engine Connection
    let matching_engine_url = std::env::var("MATCHING_ENGINE_URL").unwrap_or_else(|_| "http://matching:50051".to_string());
    println!("Connecting to Matching Engine at: {}", matching_engine_url);
    
    let mut retry_count = 0;
    let max_retries = 60;
    let matching_client = loop {
        match ledger::proto::matching::matching_engine_client::MatchingEngineClient::connect(matching_engine_url.clone()).await {
            Ok(client) => {
                println!("Connected to Matching Engine.");
                break Some(client);
            },
            Err(e) => {
                retry_count += 1;
                eprintln!("Failed to connect to Matching Engine: {}. Retry {}/{}...", e, retry_count, max_retries);
                if retry_count >= max_retries {
                    eprintln!("Giving up on Matching Engine connection. Orders will strictly be recorded but not matched.");
                    break None;
                }
                tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
            }
        }
    };

    // Start HTTP Health Server
    let health_port = 8081; // Could be from config
    tokio::spawn(async move {
        system::start_health_server(health_port).await;
    });

    let addr = format!("[::]:{}", config.port).parse()?;
    let greeter = MyGreeter::default();
    let ledger_impl = LedgerImpl::new(
        order_service, 
        account_service,
        wallet_service,
        asset_service,
        matching_client,
    );

    println!("LedgerService listening on {}", addr);

    Server::builder()
        .add_service(GreeterServer::new(greeter))
        .add_service(LedgerServiceServer::new(ledger_impl))
        .serve(addr)
        .await?;

    Ok(())
}

