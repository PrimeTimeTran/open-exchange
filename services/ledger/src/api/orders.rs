use crate::domain::accounts::AccountService;
use crate::domain::fills::service::FillService;
use crate::domain::orders::{Order, OrderService as OrderDomainService};
use crate::infra::mappers::order_mapper::OrderMapper;
use crate::infra::mappers::trade_mapper::TradeMapper;
use crate::proto::ledger::order_service_server::OrderService;
use crate::proto::ledger::*;
use std::sync::Arc;
use tonic::{Request, Response, Status};
use uuid::Uuid;

pub struct OrderServiceImpl {
    fill_service: Arc<FillService>,
    order_service: Arc<OrderDomainService>,
    account_service: Arc<AccountService>,
}

impl OrderServiceImpl {
    pub fn new(
        order_service: Arc<OrderDomainService>,
        fill_service: Arc<FillService>,
        account_service: Arc<AccountService>,
    ) -> Self {
        Self {
            order_service,
            fill_service,
            account_service,
        }
    }

    // Helper for tests to access internal state
    pub async fn get_order_internal(&self, id: Uuid) -> Result<Option<Order>, Status> {
        self.order_service
            .get_order(id)
            .await
            .map_err(|e| Status::internal(e.to_string()))
    }
}

#[tonic::async_trait]
impl OrderService for OrderServiceImpl {
    async fn record_order(
        &self,
        request: Request<RecordOrderRequest>,
    ) -> Result<Response<RecordOrderResponse>, Status> {
        let req = request.into_inner();

        if let Some(proto_order) = req.order {
            let order = OrderMapper::to_domain(&proto_order)?;

            // Reject orders from frozen accounts
            if let Ok(account_id) = Uuid::parse_str(&proto_order.account_id) {
                if let Ok(Some(account)) = self.account_service.get_account(account_id).await {
                    if account.status == "frozen" {
                        return Err(Status::failed_precondition(
                            "Account is frozen and cannot place new orders",
                        ));
                    }
                }
            }

            // OrderService handles validation, reservation, AND matching engine push
            match self.order_service.create_order(order).await {
                Ok(_) => {}
                Err(crate::error::AppError::ValidationError(msg)) => {
                    return Err(Status::failed_precondition(msg))
                }
                Err(crate::error::AppError::NotFound(msg)) => return Err(Status::not_found(msg)),
                Err(crate::error::AppError::InsufficientFunds {
                    asset,
                    required,
                    available,
                }) => {
                    return Err(Status::failed_precondition(format!(
                        "Insufficient funds for asset {}: required {}, available {}",
                        asset, required, available
                    )));
                }
                Err(e) => return Err(Status::internal(e.to_string())),
            }
        }

        Ok(Response::new(RecordOrderResponse {
            transaction_id: "tx-12345".to_string(),
            success: true,
            message: "Order recorded in ledger".to_string(),
        }))
    }

    async fn cancel_order(
        &self,
        request: Request<CancelOrderRequest>,
    ) -> Result<Response<CancelOrderResponse>, Status> {
        let req = request.into_inner();
        let order_id = Uuid::parse_str(&req.order_id)
            .map_err(|_| Status::invalid_argument("Invalid order ID"))?;

        match self.order_service.cancel_order(order_id).await {
            Ok(_) => Ok(Response::new(CancelOrderResponse {
                success: true,
                message: "Order cancelled".to_string(),
            })),
            Err(crate::error::AppError::NotFound(_)) => Ok(Response::new(CancelOrderResponse {
                success: false,
                message: "Order not found".to_string(),
            })),
            Err(e) => Err(Status::internal(e.to_string())),
        }
    }

    async fn delete_order(
        &self,
        _request: Request<DeleteOrderRequest>,
    ) -> Result<Response<DeleteOrderResponse>, Status> {
        Err(Status::unimplemented("delete_order not implemented"))
    }

    async fn get_open_orders(
        &self,
        _request: Request<GetOpenOrdersRequest>,
    ) -> Result<Response<GetOpenOrdersResponse>, Status> {
        let orders = self
            .order_service
            .list_open_orders()
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let mut proto_orders = Vec::new();

        for o in orders {
            proto_orders.push(OrderMapper::to_proto(o));
        }

        Ok(Response::new(GetOpenOrdersResponse {
            orders: proto_orders,
        }))
    }

    async fn process_trade(
        &self,
        _request: Request<ProcessTradeRequest>,
    ) -> Result<Response<ProcessTradeResponse>, Status> {
        // Deprecated: Settlement via `Commit` batch is now the source of truth.
        // This endpoint is no longer used by the Matching Engine.
        Err(Status::unimplemented(
            "ProcessTrade is deprecated. Use Settlement Service.",
        ))
    }

    async fn get_trades(
        &self,
        request: Request<GetTradesRequest>,
    ) -> Result<Response<GetTradesResponse>, Status> {
        let req = request.into_inner();

        let instrument_id = Uuid::parse_str(&req.instrument_id)
            .map_err(|_| Status::invalid_argument("Invalid instrument ID"))?;

        let start_time = chrono::DateTime::from_timestamp_millis(req.start_time)
            .ok_or_else(|| Status::invalid_argument("Invalid start time"))?;

        let end_time = chrono::DateTime::from_timestamp_millis(req.end_time)
            .ok_or_else(|| Status::invalid_argument("Invalid end time"))?;

        let trades_as_fills = self
            .fill_service
            .get_trades_by_instrument(instrument_id, start_time, end_time)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        // Map Fills to Trades
        let trades = trades_as_fills
            .into_iter()
            .map(TradeMapper::to_proto)
            .collect();

        Ok(Response::new(GetTradesResponse { trades }))
    }
}
