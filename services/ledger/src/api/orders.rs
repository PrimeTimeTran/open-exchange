use uuid::Uuid;
use std::sync::Arc;
use tonic::transport::Channel;
use tonic::{Request, Response, Status};

use crate::proto::ledger::*;
use crate::proto::common::{OrderSide, OrderStatus};
use crate::proto::ledger::order_service_server::OrderService;
use crate::proto::matching::matching_client::MatchingClient;
use crate::domain::orders::{OrderService as OrderDomainService, Order};
use crate::domain::assets::AssetService;
use crate::domain::fills::repository::FillRepository;
use rust_decimal::Decimal;
use std::str::FromStr;

pub struct OrderServiceImpl {
    order_service: Arc<OrderDomainService>,
    asset_service: Arc<AssetService>,
    fill_repo: Arc<dyn FillRepository>,
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
}

#[tonic::async_trait]
impl OrderService for OrderServiceImpl {
    async fn record_order(
        &self,
        request: Request<RecordOrderRequest>,
    ) -> Result<Response<RecordOrderResponse>, Status> {
        let req = request.into_inner();
        
        if let Some(proto_order) = req.order {
            let order_id = if proto_order.id.is_empty() {
                Uuid::new_v4()
            } else {
                Uuid::parse_str(&proto_order.id).map_err(|_| Status::invalid_argument("Invalid order ID"))?
            };

            let tenant_id = Uuid::parse_str(&proto_order.tenant_id).map_err(|_| Status::invalid_argument("Invalid tenant ID"))?;
            let account_id = Uuid::parse_str(&proto_order.account_id).map_err(|_| Status::invalid_argument("Invalid account ID"))?;
            let instrument_id = Uuid::parse_str(&proto_order.instrument_id).map_err(|_| Status::invalid_argument("Invalid instrument ID"))?;

            // Fetch instrument to validate it exists, but we trust the client's precision for now.
            // In a real system, we might want to enforce precision (e.g. round to 8 decimal places).
            let _ = self.asset_service.get_instrument(&proto_order.instrument_id).await.map_err(|e| Status::internal(e.to_string()))?
                .ok_or_else(|| Status::not_found(format!("Instrument {} not found", proto_order.instrument_id)))?;

            let quantity_scaled = Decimal::from_str(&proto_order.quantity)
                .map_err(|_| Status::invalid_argument("Invalid quantity format"))?;
            let price_scaled = Decimal::from_str(&proto_order.price)
                .map_err(|_| Status::invalid_argument("Invalid price format"))?;

            // Convert Proto Enum (i32) to Domain String
            let side_str = match OrderSide::try_from(proto_order.side).unwrap_or(OrderSide::Unspecified) {
                OrderSide::Buy => "buy",
                OrderSide::Sell => "sell",
                _ => "unspecified",
            }.to_string();

            let status_str = match OrderStatus::try_from(proto_order.status).unwrap_or(OrderStatus::Unspecified) {
                OrderStatus::Open => "open",
                OrderStatus::PartiallyFilled => "partial",
                OrderStatus::Filled => "filled",
                OrderStatus::Cancelled => "cancelled",
                OrderStatus::Rejected => "rejected",
                _ => "unspecified",
            }.to_string();

            let type_str = match crate::proto::common::OrderType::try_from(proto_order.r#type).unwrap_or(crate::proto::common::OrderType::Unspecified) {
                crate::proto::common::OrderType::Limit => "limit",
                crate::proto::common::OrderType::Market => "market",
                _ => "unspecified",
            }.to_string();

            let order = Order {
                id: order_id,
                tenant_id,
                account_id,
                instrument_id,
                side: side_str,
                r#type: type_str,
                quantity: quantity_scaled,
                price: price_scaled,
                status: status_str,
                filled_quantity: Decimal::from_str(&proto_order.quantity_filled).unwrap_or(Decimal::ZERO),
                average_fill_price: Decimal::ZERO,
                meta: serde_json::from_str(&proto_order.meta).unwrap_or(serde_json::json!({})),
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            };

            let order_for_matching = crate::proto::common::Order {
                id: order.id.to_string(),
                tenant_id: order.tenant_id.to_string(),
                account_id: order.account_id.to_string(),
                instrument_id: order.instrument_id.to_string(),
                side: proto_order.side,
                r#type: proto_order.r#type,
                price: order.price.to_string(),
                quantity: order.quantity.to_string(),
                quantity_filled: order.filled_quantity.to_string(),
                time_in_force: proto_order.time_in_force,
                status: OrderStatus::Open as i32,
                meta: order.meta.to_string(),
                created_at: order.created_at.timestamp_millis(),
                updated_at: order.updated_at.timestamp_millis(),
            };

            // OrderService handles validation and reservation internally now
            match self.order_service.create_order(order).await {
                Ok(_) => {
                    // Call Matching Engine
                    if let Some(client) = &self.matching_client {
                        let mut matching_client = client.clone();
                        let request = tonic::Request::new(crate::proto::matching::PlaceOrderRequest {
                            order: Some(order_for_matching),
                        });

                        tokio::spawn(async move {
                            match matching_client.place_order(request).await {
                                Ok(response) => println!("Successfully forwarded order to matching engine: {:?}", response),
                                Err(e) => eprintln!("Failed to forward order to matching engine: {}", e),
                            }
                        });
                    }
                },
                Err(crate::error::AppError::ValidationError(msg)) => return Err(Status::failed_precondition(msg)),
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
            // Fetch instrument to validate, but do NOT scale.
            // We return exactly what is stored in the DB (Human Readable).
            let _ = self.asset_service.get_instrument(&o.instrument_id.to_string()).await.map_err(|e| Status::internal(e.to_string()))?;

            let quantity = o.quantity.to_string();
            let price = o.price.to_string();
            let quantity_filled = o.filled_quantity.to_string();

            let side_enum = match o.side.as_str() {
                "buy" => OrderSide::Buy,
                "sell" => OrderSide::Sell,
                _ => OrderSide::Unspecified,
            };
            
            let status_enum = match o.status.as_str() {
                "open" => OrderStatus::Open,
                "partial" => OrderStatus::PartiallyFilled,
                "filled" => OrderStatus::Filled,
                "cancelled" => OrderStatus::Cancelled,
                "rejected" => OrderStatus::Rejected,
                _ => OrderStatus::Unspecified,
            };

            let type_enum = match o.r#type.as_str() {
                "ORDER_TYPE_LIMIT" | "limit" => crate::proto::common::OrderType::Limit,
                "ORDER_TYPE_MARKET" | "market" => crate::proto::common::OrderType::Market,
                _ => crate::proto::common::OrderType::Unspecified,
            };
            let time_in_force_enum = crate::proto::common::TimeInForce::Gtc;

            proto_orders.push(crate::proto::common::Order {
                id: o.id.to_string(),
                tenant_id: o.tenant_id.to_string(),
                account_id: o.account_id.to_string(),
                instrument_id: o.instrument_id.to_string(),
                side: side_enum as i32,
                quantity,
                price,
                status: status_enum as i32,
                quantity_filled,
                meta: o.meta.to_string(),
                created_at: o.created_at.timestamp_millis(),
                updated_at: o.updated_at.timestamp_millis(),
                r#type: type_enum as i32, 
                time_in_force: time_in_force_enum as i32, 
            });
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
