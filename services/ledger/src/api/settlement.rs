use std::sync::Arc;
use tonic::{Request, Response, Status};

use crate::proto::ledger::settlement_server::Settlement;
use crate::proto::ledger::{CommitRequest, CommitResponse};
use crate::domain::trade::processor::TradeProcessor;

pub struct SettlementServiceImpl {
    trade_processor: Arc<TradeProcessor>,
}

impl SettlementServiceImpl {
    pub fn new(trade_processor: Arc<TradeProcessor>) -> Self {
        Self { trade_processor }
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

        let (trade_ids, errors) = self.trade_processor.process_matches(matches, tenant_id).await;

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
