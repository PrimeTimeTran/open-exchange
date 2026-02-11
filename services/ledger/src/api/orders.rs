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
use rust_decimal::Decimal;
use rust_decimal::MathematicalOps;
use std::str::FromStr;

pub struct OrderServiceImpl {
    order_service: Arc<OrderDomainService>,
    asset_service: Arc<AssetService>,
    matching_client: Option<MatchingClient<Channel>>,
}

impl OrderServiceImpl {
    pub fn new(
        order_service: Arc<OrderDomainService>,
        asset_service: Arc<AssetService>,
        matching_client: Option<MatchingClient<Channel>>,
    ) -> Self {
        Self { order_service, asset_service, matching_client }
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

            let tenant_id = Uuid::parse_str(&proto_order.tenant_id).unwrap_or_default();
            let account_id = Uuid::parse_str(&proto_order.account_id).unwrap_or_default();
            let instrument_id = Uuid::parse_str(&proto_order.instrument_id).unwrap_or_default();

            // Fetch instrument and assets for scaling
            let (quantity_scaled, price_scaled) = if let Some(instrument) = self.asset_service.get_instrument(&proto_order.instrument_id).await {
                let base_decimals = self.asset_service.get_asset(&instrument.underlying_asset_id).await.unwrap_or(None).map(|a| a.decimals).unwrap_or(0);
                let quote_decimals = self.asset_service.get_asset(&instrument.quote_asset_id).await.unwrap_or(None).map(|a| a.decimals).unwrap_or(0);
                
                let quantity_raw = Decimal::from_str(&proto_order.quantity).unwrap_or(Decimal::ZERO);
                let price_raw = Decimal::from_str(&proto_order.price).unwrap_or(Decimal::ZERO);
                
                // Scaling logic:
                // Quantity (atomic) = Quantity (major) * 10^base_decimals
                // Price (atomic quote per atomic base) = Price (major) * 10^(quote_decimals - base_decimals)
                
                let base_scale = Decimal::from(10).powi(base_decimals as i64);
                let quote_scale = Decimal::from(10).powi(quote_decimals as i64);
                
                let q_scaled = (quantity_raw * base_scale).round();
                let p_scaled = price_raw * quote_scale / base_scale;
                
                (q_scaled, p_scaled)
            } else {
                    // Fallback if instrument not found
                    (Decimal::from_str(&proto_order.quantity).unwrap_or(Decimal::ZERO), 
                     Decimal::from_str(&proto_order.price).unwrap_or(Decimal::ZERO))
            };

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

            let order = Order {
                id: order_id,
                tenant_id,
                account_id,
                instrument_id,
                side: side_str,
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
            let (quantity, price, quantity_filled) = if let Some(instrument) = self.asset_service.get_instrument(&o.instrument_id.to_string()).await {
                let base_decimals = self.asset_service.get_asset(&instrument.underlying_asset_id).await.unwrap_or(None).map(|a| a.decimals).unwrap_or(0);
                let quote_decimals = self.asset_service.get_asset(&instrument.quote_asset_id).await.unwrap_or(None).map(|a| a.decimals).unwrap_or(0);
                
                let base_scale = Decimal::from(10).powi(base_decimals as i64);
                let quote_scale = Decimal::from(10).powi(quote_decimals as i64);
                
                let q_unscaled = o.quantity / base_scale;
                let p_unscaled = o.price * base_scale / quote_scale;
                let f_unscaled = o.filled_quantity / base_scale;
                
                (q_unscaled.to_string(), p_unscaled.to_string(), f_unscaled.to_string())
            } else {
                (o.quantity.to_string(), o.price.to_string(), o.filled_quantity.to_string())
            };

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
                r#type: 0, 
                time_in_force: 0, 
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
        
        // Fetch instrument and assets for scaling
        let (quantity, price) = if let Some(instrument) = self.asset_service.get_instrument(&req.instrument_id).await {
            let base_decimals = self.asset_service.get_asset(&instrument.underlying_asset_id).await.unwrap_or(None).map(|a| a.decimals).unwrap_or(0);
            let quote_decimals = self.asset_service.get_asset(&instrument.quote_asset_id).await.unwrap_or(None).map(|a| a.decimals).unwrap_or(0);
            
            let quantity_raw = Decimal::from_str(&req.quantity).unwrap_or(Decimal::ZERO);
            let price_raw = Decimal::from_str(&req.price).unwrap_or(Decimal::ZERO);
            
            let base_scale = Decimal::from(10).powi(base_decimals as i64);
            let quote_scale = Decimal::from(10).powi(quote_decimals as i64);
            
            let q_scaled = (quantity_raw * base_scale).round();
            let p_scaled = price_raw * quote_scale / base_scale;
            
            (q_scaled, p_scaled)
        } else {
             // Fallback if instrument not found
             (Decimal::from_str(&req.quantity).unwrap_or(Decimal::ZERO), 
              Decimal::from_str(&req.price).unwrap_or(Decimal::ZERO))
        };

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
}
