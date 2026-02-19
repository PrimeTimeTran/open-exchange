use crate::proto::ledger::*;
use crate::domain::assets::AssetService;
use crate::domain::fills::repository::FillRepository;
use crate::proto::ledger::order_service_server::OrderService;
use crate::proto::matching::matching_client::MatchingClient;
use crate::domain::orders::{OrderService as OrderDomainService, Order, OrderSide, OrderType, OrderStatus};
use uuid::Uuid;
use std::sync::Arc;
use std::str::FromStr;
use rust_decimal::Decimal;
use tonic::transport::Channel;
use tonic::{Request, Response, Status};

pub struct OrderServiceImpl {
    asset_service: Arc<AssetService>,
    fill_repo: Arc<dyn FillRepository>,
    order_service: Arc<OrderDomainService>,
    matching_client: Option<MatchingClient<Channel>>,
}

impl OrderServiceImpl {
    pub fn new(
        order_service: Arc<OrderDomainService>,
        asset_service: Arc<AssetService>,
        fill_repo: Arc<dyn FillRepository>,
        matching_client: Option<MatchingClient<Channel>>,
    ) -> Self {
        Self { order_service, asset_service, fill_repo, matching_client }
    }

    // Helper for tests to access internal state
    pub async fn get_order_internal(&self, id: Uuid) -> Result<Option<Order>, Status> {
        self.order_service.get_order(id).await.map_err(|e| Status::internal(e.to_string()))
    }

    fn map_proto_to_domain(proto_order: &crate::proto::common::Order) -> Result<Order, Status> {
        let order_id = if proto_order.id.is_empty() {
            Uuid::new_v4()
        } else {
            Uuid::parse_str(&proto_order.id).map_err(|_| Status::invalid_argument("Invalid order ID"))?
        };

        let tenant_id = Uuid::parse_str(&proto_order.tenant_id).map_err(|_| Status::invalid_argument("Invalid tenant ID"))?;
        let account_id = Uuid::parse_str(&proto_order.account_id).map_err(|_| Status::invalid_argument("Invalid account ID"))?;
        let instrument_id = Uuid::parse_str(&proto_order.instrument_id).map_err(|_| Status::invalid_argument("Invalid instrument ID"))?;

        let quantity = Decimal::from_str(&proto_order.quantity).map_err(|_| Status::invalid_argument("Invalid quantity format"))?;
        let price = Decimal::from_str(&proto_order.price).map_err(|_| Status::invalid_argument("Invalid price format"))?;
        let filled_quantity = Decimal::from_str(&proto_order.quantity_filled).unwrap_or(Decimal::ZERO);

        let side_enum = crate::proto::common::OrderSide::try_from(proto_order.side)
            .map_err(|_| Status::invalid_argument("Invalid side"))?;
        let side = match side_enum {
            crate::proto::common::OrderSide::Buy => OrderSide::Buy,
            crate::proto::common::OrderSide::Sell => OrderSide::Sell,
            _ => return Err(Status::invalid_argument("Unspecified side")),
        };

        let status_enum = crate::proto::common::OrderStatus::try_from(proto_order.status)
            .map_err(|_| Status::invalid_argument("Invalid status"))?;
        let status = match status_enum {
            crate::proto::common::OrderStatus::Open => OrderStatus::Open,
            crate::proto::common::OrderStatus::PartialFill => OrderStatus::PartialFill,
            crate::proto::common::OrderStatus::Filled => OrderStatus::Filled,
            crate::proto::common::OrderStatus::Cancelled => OrderStatus::Cancelled,
            crate::proto::common::OrderStatus::Rejected => OrderStatus::Rejected,
            _ => OrderStatus::New,
        };

        let type_enum = crate::proto::common::OrderType::try_from(proto_order.r#type)
            .map_err(|_| Status::invalid_argument("Invalid order type"))?;
        let order_type = match type_enum {
            crate::proto::common::OrderType::Limit => OrderType::Limit,
            crate::proto::common::OrderType::Market => OrderType::Market,
            _ => return Err(Status::invalid_argument("Unspecified order type")),
        };

        let meta = serde_json::from_str(&proto_order.meta).unwrap_or(serde_json::json!({}));

        Ok(Order {
            id: order_id,
            tenant_id,
            account_id,
            instrument_id,
            side,
            r#type: order_type,
            quantity,
            price,
            status,
            filled_quantity,
            average_fill_price: Decimal::ZERO,
            meta,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        })
    }

    fn map_domain_to_proto(order: Order) -> crate::proto::common::Order {
        let side = match order.side {
            OrderSide::Buy => crate::proto::common::OrderSide::Buy,
            OrderSide::Sell => crate::proto::common::OrderSide::Sell,
        } as i32;

        let status = match order.status {
            OrderStatus::New => crate::proto::common::OrderStatus::Unspecified,
            OrderStatus::Open => crate::proto::common::OrderStatus::Open,
            OrderStatus::PartialFill => crate::proto::common::OrderStatus::PartialFill,
            OrderStatus::Filled => crate::proto::common::OrderStatus::Filled,
            OrderStatus::Cancelled => crate::proto::common::OrderStatus::Cancelled,
            OrderStatus::Rejected => crate::proto::common::OrderStatus::Rejected,
        } as i32;

        let order_type = match order.r#type {
            OrderType::Limit => crate::proto::common::OrderType::Limit,
            OrderType::Market => crate::proto::common::OrderType::Market,
        } as i32;

        crate::proto::common::Order {
            id: order.id.to_string(),
            tenant_id: order.tenant_id.to_string(),
            account_id: order.account_id.to_string(),
            instrument_id: order.instrument_id.to_string(),
            side,
            r#type: order_type,
            price: order.price.to_string(),
            quantity: order.quantity.to_string(),
            quantity_filled: order.filled_quantity.to_string(),
            time_in_force: crate::proto::common::TimeInForce::Gtc as i32,
            status,
            meta: order.meta.to_string(),
            created_at: order.created_at.timestamp_millis(),
            updated_at: order.updated_at.timestamp_millis(),
        }
    }

    async fn validate_instrument(&self, instrument_id: &str) -> Result<(), Status> {
         let _ = self.asset_service.get_instrument(instrument_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?
            .ok_or_else(|| Status::not_found(format!("Instrument {} not found", instrument_id)))?;
        Ok(())
    }

    fn spawn_matching_engine_request(&self, order: &Order, time_in_force: i32) {
        if let Some(client) = &self.matching_client {
            let mut matching_client = client.clone();
            let mut proto_order = Self::map_domain_to_proto(order.clone());
            proto_order.time_in_force = time_in_force;

            let request = tonic::Request::new(crate::proto::matching::PlaceOrderRequest {
                order: Some(proto_order),
            });

            tokio::spawn(async move {
                match matching_client.place_order(request).await {
                    Ok(response) => tracing::info!(?response, "Successfully forwarded order to matching engine"),
                    Err(e) => tracing::error!(error = %e, "Failed to forward order to matching engine"),
                }
            });
        }
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
            self.validate_instrument(&proto_order.instrument_id).await?;
            let order = Self::map_proto_to_domain(&proto_order)?;

            // OrderService handles validation and reservation internally now
            match self.order_service.create_order(order.clone()).await {
                Ok(_) => {
                    self.spawn_matching_engine_request(&order, proto_order.time_in_force);
                },
                Err(crate::error::AppError::ValidationError(msg)) => return Err(Status::failed_precondition(msg)),
                Err(crate::error::AppError::InsufficientFunds { asset, required, available }) => {
                    return Err(Status::failed_precondition(format!(
                        "Insufficient funds for asset {}: required {}, available {}", 
                        asset, required, available
                    )));
                },
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
            let order_id = Uuid::parse_str(&req.order_id).map_err(|_| Status::invalid_argument("Invalid order ID"))?;
            
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
        let orders = self.order_service.list_open_orders().await
            .map_err(|e| Status::internal(e.to_string()))?;
            
        let mut proto_orders = Vec::new();

        for o in orders {
            self.validate_instrument(&o.instrument_id.to_string()).await?;
            proto_orders.push(Self::map_domain_to_proto(o));
        }

        Ok(Response::new(GetOpenOrdersResponse {
            orders: proto_orders,
        }))
    }
    
    async fn process_trade(
        &self,
        request: Request<ProcessTradeRequest>,
    ) -> Result<Response<ProcessTradeResponse>, Status> {
        let req = request.into_inner();

        let maker_order_id = Uuid::parse_str(&req.maker_order_id).map_err(|_| Status::invalid_argument("Invalid maker order ID"))?;
        let taker_order_id = Uuid::parse_str(&req.taker_order_id).map_err(|_| Status::invalid_argument("Invalid taker order ID"))?;
        
        // Fetch instrument to validate, but do NOT scale.
        // Input from Matching Engine is assumed to be in the same unit as stored orders (Human Readable).
        let _ = self.asset_service.get_instrument(&req.instrument_id).await.map_err(|e| Status::internal(e.to_string()))?;

        let quantity = Decimal::from_str(&req.quantity)
            .map_err(|_| Status::invalid_argument("Invalid quantity format"))?;
        let price = Decimal::from_str(&req.price)
            .map_err(|_| Status::invalid_argument("Invalid price format"))?;

        // Update Maker Order
        self.order_service.fill_order(maker_order_id, quantity, price).await
            .map_err(|e| Status::internal(e.to_string()))?;

        // Update Taker Order
        self.order_service.fill_order(taker_order_id, quantity, price).await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(ProcessTradeResponse {
            transaction_id: Uuid::new_v4().to_string(),
            success: true,
        }))
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

        let fills = self.fill_repo.list_by_instrument_and_time(instrument_id, start_time, end_time).await
            .map_err(|e| Status::internal(e.to_string()))?;
            
        // Map Fills to Trades
        // Note: Fills are split per side (buy/sell). A trade generates 2 fills.
        // If we just list fills, we might double count or need to filter.
        // Usually, we filter for a specific role or side to reconstruct trades uniquely.
        // For public market data (candles), we generally only care about the PRICE and QUANTITY of the execution,
        // so we can filter for 'taker' fills only, as every trade has exactly one taker.
        
        let trades = fills.into_iter()
            .filter(|f| f.role == "taker")
            .map(|f| crate::proto::common::Trade {
                id: f.trade_id.to_string(),
                tenant_id: f.tenant_id.to_string(),
                instrument_id: f.instrument_id.to_string(),
                buy_order_id: "".to_string(), // Not strictly needed for candles
                sell_order_id: "".to_string(),
                price: f.price.to_string(),
                quantity: f.quantity.to_string(),
                meta: f.meta.to_string(),
                created_at: f.created_at.timestamp_millis(),
                updated_at: f.created_at.timestamp_millis(),
            })
            .collect();

        Ok(Response::new(GetTradesResponse { trades }))
    }
}
