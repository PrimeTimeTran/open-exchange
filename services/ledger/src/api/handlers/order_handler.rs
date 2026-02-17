use uuid::Uuid;
use tonic::transport::Channel;
use tonic::{Request, Response, Status};
use crate::proto::ledger::*;
use crate::proto::common::{OrderSide, OrderStatus};
use crate::proto::matching::matching_client::MatchingClient;
use crate::domain::orders::{OrderService, Order};
use crate::domain::assets::AssetService;
use rust_decimal::Decimal;
use std::str::FromStr;
use rust_decimal::prelude::ToPrimitive;

pub async fn record_order(
    order_service: &OrderService,
    asset_service: &AssetService,
    matching_client: &Option<MatchingClient<Channel>>,
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

        // Fetch instrument and assets for scaling
        let (quantity_scaled, price_scaled) = if let Some(instrument) = asset_service.get_instrument(&proto_order.instrument_id).await.map_err(|e| Status::internal(e.to_string()))? {
            let base_asset = asset_service.get_asset(&instrument.underlying_asset_id).await
                .map_err(|e| Status::internal(format!("Failed to fetch base asset: {}", e)))?
                .ok_or_else(|| Status::not_found(format!("Base asset {} not found", instrument.underlying_asset_id)))?;
            
            let quote_asset = asset_service.get_asset(&instrument.quote_asset_id).await
                .map_err(|e| Status::internal(format!("Failed to fetch quote asset: {}", e)))?
                .ok_or_else(|| Status::not_found(format!("Quote asset {} not found", instrument.quote_asset_id)))?;

            let base_decimals = base_asset.decimals;
            let quote_decimals = quote_asset.decimals;
            
            let quantity_raw = Decimal::from_str(&proto_order.quantity).map_err(|_| Status::invalid_argument("Invalid quantity format"))?;
            let price_raw = Decimal::from_str(&proto_order.price).map_err(|_| Status::invalid_argument("Invalid price format"))?;

            tracing::info!(
                instrument_id = %proto_order.instrument_id,
                base_decimals = %base_decimals,
                quote_decimals = %quote_decimals,
                quantity_raw = %quantity_raw,
                price_raw = %price_raw,
                "Ledger [Scaling]: Input parameters"
            );
            
            // Scaling logic:
            // Quantity (atomic) = Quantity (major) * 10^base_decimals
            // Price (atomic quote per atomic base) = Price (major) * 10^(quote_decimals - base_decimals)
            
            let base_multiplier = Decimal::from(10).powi(base_decimals as i64);
            let quote_multiplier = Decimal::from(10).powi((quote_decimals - base_decimals) as i64);

            let q_scaled = (quantity_raw * base_multiplier).round();
            let p_scaled = price_raw * quote_multiplier;
            
            tracing::info!(scaled_quantity = %q_scaled, scaled_price = %p_scaled, "Ledger [Scaling]: Output");

            (q_scaled, p_scaled)
        } else {
                // Fallback if instrument not found
                (Decimal::from_str(&proto_order.quantity).unwrap_or_default(), Decimal::from_str(&proto_order.price).unwrap_or_default())
        };

        // Convert Proto Enum (i32) to Domain String
        let side_str = match OrderSide::try_from(proto_order.side).unwrap_or(OrderSide::Unspecified) {
            OrderSide::Buy => "buy",
            OrderSide::Sell => "sell",
            _ => "unspecified",
        }.to_string();

        let status_str = match OrderStatus::try_from(proto_order.status).unwrap_or(OrderStatus::Unspecified) {
            OrderStatus::Open => "open",
            OrderStatus::PartialFill => "partial_fill",
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
            filled_quantity: Decimal::from_str(&proto_order.quantity_filled).map_err(|_| Status::invalid_argument("Invalid filled quantity"))?,
            average_fill_price: Decimal::default(),
            meta: serde_json::from_str(&proto_order.meta).map_err(|_| Status::invalid_argument("Invalid meta JSON"))?,
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
        match order_service.create_order(order).await {
            Ok(_) => {
                // Call Matching Engine
                if let Some(client) = matching_client {
                    tracing::info!(?order_for_matching, "Ledger [Sending]: Sending order to matching engine");
                    let mut matching_client = client.clone();
                    let request = tonic::Request::new(crate::proto::matching::PlaceOrderRequest {
                        order: Some(order_for_matching),
                    });

                    tokio::spawn(async move {
                        match matching_client.place_order(request).await {
                            Ok(response) => tracing::info!(?response, "Successfully forwarded order to matching engine"),
                            Err(e) => tracing::error!(error = %e, "Failed to forward order to matching engine"),
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

pub async fn cancel_order(
    order_service: &OrderService,
    request: Request<CancelOrderRequest>,
) -> Result<Response<CancelOrderResponse>, Status> {
        let req = request.into_inner();
        let order_id = Uuid::parse_str(&req.order_id).map_err(|_| Status::invalid_argument("Invalid order ID"))?;
        
        match order_service.cancel_order(order_id).await {
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

pub async fn get_open_orders(
    order_service: &OrderService,
    _request: Request<GetOpenOrdersRequest>,
) -> Result<Response<GetOpenOrdersResponse>, Status> {
    let orders = order_service.list_open_orders().await
        .map_err(|e| Status::internal(e.to_string()))?;
        
    let proto_orders = orders.into_iter().map(|o| {
        let side_enum = match o.side.as_str() {
            "buy" => OrderSide::Buy,
            "sell" => OrderSide::Sell,
            _ => OrderSide::Unspecified,
        };
        
        let status_enum = match o.status.as_str() {
            "open" => OrderStatus::Open,
            "partial_fill" => OrderStatus::PartialFill,
            "filled" => OrderStatus::Filled,
            "cancelled" => OrderStatus::Cancelled,
            "rejected" => OrderStatus::Rejected,
            _ => OrderStatus::Unspecified,
        };

        crate::proto::common::Order {
            id: o.id.to_string(),
            tenant_id: o.tenant_id.to_string(),
            account_id: o.account_id.to_string(),
            instrument_id: o.instrument_id.to_string(),
            side: side_enum as i32,
            quantity: o.quantity.to_string(),
            price: o.price.to_string(),
            status: status_enum as i32,
            quantity_filled: o.filled_quantity.to_string(),
            meta: o.meta.to_string(),
            created_at: o.created_at.timestamp_millis(),
            updated_at: o.updated_at.timestamp_millis(),
            r#type: 0, // Default or map if stored
            time_in_force: 0, // Default or map if stored
        }
    }).collect();

    Ok(Response::new(GetOpenOrdersResponse {
        orders: proto_orders,
    }))
}
