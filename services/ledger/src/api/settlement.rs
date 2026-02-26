use crate::domain::settlement::service::SettlementService;
use crate::proto::ledger::settlement_server::Settlement;
use crate::proto::ledger::{CommitRequest, CommitResponse};
use std::sync::Arc;
use tonic::{Request, Response, Status};

pub struct SettlementServiceImpl {
    settlement_service: Arc<SettlementService>,
}

impl SettlementServiceImpl {
    pub fn new(settlement_service: Arc<SettlementService>) -> Self {
        Self { settlement_service }
    }
}

#[tonic::async_trait]
impl Settlement for SettlementServiceImpl {
    async fn commit(
        &self,
        request: Request<CommitRequest>,
    ) -> Result<Response<CommitResponse>, Status> {
        let req = request.into_inner();
        let matches = req.matches;
        let tenant_id = req.tenant_id;

        if matches.is_empty() {
            return Err(Status::invalid_argument("No matches provided"));
        }

        let (trade_ids, errors) = self
            .settlement_service
            .process_matches(matches, tenant_id)
            .await;
        // Todo:
        // Create email, notification,

        if !errors.is_empty() {
            Ok(Response::new(CommitResponse {
                success: false,
                trade_ids,
                error_message: errors.join("; "),
            }))
        } else {
            Ok(Response::new(CommitResponse {
                success: true,
                trade_ids,
                error_message: "".to_string(),
            }))
        }
    }
}
