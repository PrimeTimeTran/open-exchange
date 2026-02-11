use std::sync::Arc;
use tonic::{Request, Response, Status};
use uuid::Uuid;

use crate::proto::ledger::settlement_server::Settlement;
use crate::proto::ledger::{CommitRequest, CommitResponse};
use crate::proto::common::{Trade, OrderSide};
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

        let mut trade_ids = Vec::new();
        let mut errors = Vec::new();

        for match_data in matches {
            // Generate a new Trade ID
            let trade_id = Uuid::new_v4().to_string();

            // Determine Buy/Sell Order IDs based on Taker Side
            let taker_side = OrderSide::try_from(match_data.taker_side).unwrap_or(OrderSide::Unspecified);
            let (buy_order_id, sell_order_id) = match taker_side {
                OrderSide::Buy => (match_data.taker_order_id, match_data.maker_order_id),
                OrderSide::Sell => (match_data.maker_order_id, match_data.taker_order_id),
                _ => {
                    let msg = format!("Invalid Taker Side for match {}", match_data.match_id);
                    log::error!("{}", msg);
                    errors.push(msg);
                    continue;
                }
            };

            let trade = Trade {
                id: trade_id.clone(),
                tenant_id: tenant_id.clone(),
                instrument_id: match_data.instrument_id,
                buy_order_id,
                sell_order_id,
                price: match_data.price,
                quantity: match_data.quantity,
                meta: "{}".to_string(), // Can be populated with more info if needed
                created_at: match_data.matched_at,
                updated_at: chrono::Utc::now().timestamp_millis(),
            };

            match self.trade_processor.process_trade_event(trade).await {
                Ok(_) => {
                    trade_ids.push(trade_id);
                }
                Err(e) => {
                    log::error!("Failed to process trade: {:?}", e);
                    errors.push(e.to_string());
                }
            }
        }

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
