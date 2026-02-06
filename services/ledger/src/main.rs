mod api;
mod domain;
mod infra;
mod proto;
mod system;

use tonic::transport::Server;
use crate::api::hello::MyGreeter;
use crate::api::ledger::LedgerImpl;
use crate::proto::hello_world::greeter_server::GreeterServer;
use crate::proto::ledger::ledger_service_server::LedgerServiceServer;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();

    // Start HTTP Health Server
    tokio::spawn(async {
        system::start_health_server(8081).await;
    });

    let addr = "[::]:50052".parse()?;
    let greeter = MyGreeter::default();

    println!("LedgerService listening on {}", addr);

    Server::builder()
        .add_service(GreeterServer::new(greeter))
        .add_service(LedgerServiceServer::new(LedgerImpl::default()))
        .serve(addr)
        .await?;

    Ok(())
}

