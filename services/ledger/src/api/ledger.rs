use tonic::{Request, Response, Status};
use crate::proto::ledger::ledger_service_server::LedgerService;
use crate::proto::ledger::{RecordOrderRequest, RecordOrderResponse};

#[derive(Debug, Default)]
pub struct LedgerImpl {}

#[tonic::async_trait]
impl LedgerService for LedgerImpl {
    async fn record_order(
        &self,
        request: Request<RecordOrderRequest>,
    ) -> Result<Response<RecordOrderResponse>, Status> {
        let req = request.into_inner();
        println!("Ledger: Recording order: {:?}", req.order);

        // Here we would interact with the domain layer / database
        // For now, just return success.

        Ok(Response::new(RecordOrderResponse {
            transaction_id: "tx-12345".to_string(),
            success: true,
            message: "Order recorded in ledger".to_string(),
        }))
    }
}
