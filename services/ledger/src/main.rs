use tonic::transport::Server;
use ledger::api::hello::MyGreeter;
use ledger::api::ledger::LedgerImpl;
use ledger::proto::hello_world::greeter_server::GreeterServer;
use ledger::proto::ledger::ledger_service_server::LedgerServiceServer;
use ledger::{infra, system};
use ledger::config::Config;
use ledger::domain::orders::OrderService;
use ledger::domain::accounts::AccountService;
use ledger::infra::repositories::{PostgresOrderRepository, PostgresAccountRepository};
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

    // Services
    let order_service = OrderService::new(order_repo);
    let account_service = AccountService::new(account_repo);

    // Start HTTP Health Server
    let health_port = 8081; // Could be from config
    tokio::spawn(async move {
        system::start_health_server(health_port).await;
    });

    let addr = format!("[::]:{}", config.port).parse()?;
    let greeter = MyGreeter::default();
    let ledger_impl = LedgerImpl::new(order_service, account_service);

    println!("LedgerService listening on {}", addr);

    Server::builder()
        .add_service(GreeterServer::new(greeter))
        .add_service(LedgerServiceServer::new(ledger_impl))
        .serve(addr)
        .await?;

    Ok(())
}

