use tonic::transport::Server;
use ledger::api::hello::MyGreeter;
use ledger::api::ledger::LedgerImpl;
use ledger::proto::hello_world::greeter_server::GreeterServer;
use ledger::proto::ledger::ledger_service_server::LedgerServiceServer;
use ledger::{infra, system};
use dotenv::dotenv;
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    env_logger::init();

    // Database Connection
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    println!("Connecting to database: {}", database_url);
    
    let db_pool = infra::database::get_db_pool(&database_url).await?;
    println!("Database connected successfully.");

    // Start HTTP Health Server
    tokio::spawn(async {
        system::start_health_server(8081).await;
    });

    let addr = "[::]:50052".parse()?;
    let greeter = MyGreeter::default();

    println!("LedgerService listening on {}", addr);

    Server::builder()
        .add_service(GreeterServer::new(greeter))
        .add_service(LedgerServiceServer::new(LedgerImpl::new(db_pool)))
        .serve(addr)
        .await?;

    Ok(())
}

