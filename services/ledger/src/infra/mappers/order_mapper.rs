use crate::domain::orders::model::{Order, OrderSide, OrderType, OrderStatus};
use crate::proto::common;
use rust_decimal::Decimal;
use std::str::FromStr;
use tonic::Status;
use uuid::Uuid;

pub struct OrderMapper;

impl OrderMapper {
    pub fn to_proto(order: Order) -> common::Order {
        let side = match order.side {
            OrderSide::Buy => common::OrderSide::Buy,
            OrderSide::Sell => common::OrderSide::Sell,
        } as i32;

        let status = match order.status {
            OrderStatus::New => common::OrderStatus::Unspecified,
            OrderStatus::Open => common::OrderStatus::Open,
            OrderStatus::PartialFill => common::OrderStatus::PartialFill,
            OrderStatus::Filled => common::OrderStatus::Filled,
            OrderStatus::Cancelled => common::OrderStatus::Cancelled,
            OrderStatus::Rejected => common::OrderStatus::Rejected,
        } as i32;

        let order_type = match order.r#type {
            OrderType::Limit => common::OrderType::Limit,
            OrderType::Market => common::OrderType::Market,
        } as i32;

        common::Order {
            id: order.id.to_string(),
            tenant_id: order.tenant_id.to_string(),
            account_id: order.account_id.to_string(),
            instrument_id: order.instrument_id.to_string(),
            side,
            r#type: order_type,
            price: order.price.to_string(),
            quantity: order.quantity.to_string(),
            quantity_filled: order.filled_quantity.to_string(),
            time_in_force: common::TimeInForce::Gtc as i32,
            status,
            meta: order.meta.to_string(),
            created_at: order.created_at.timestamp_millis(),
            updated_at: order.updated_at.timestamp_millis(),
        }
    }

    pub fn to_domain(proto_order: &common::Order) -> Result<Order, Status> {
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

        let side_enum = common::OrderSide::try_from(proto_order.side)
            .map_err(|_| Status::invalid_argument("Invalid side"))?;
        let side = match side_enum {
            common::OrderSide::Buy => OrderSide::Buy,
            common::OrderSide::Sell => OrderSide::Sell,
            _ => return Err(Status::invalid_argument("Unspecified side")),
        };

        let status_enum = common::OrderStatus::try_from(proto_order.status)
            .map_err(|_| Status::invalid_argument("Invalid status"))?;
        let status = match status_enum {
            common::OrderStatus::Open => OrderStatus::Open,
            common::OrderStatus::PartialFill => OrderStatus::PartialFill,
            common::OrderStatus::Filled => OrderStatus::Filled,
            common::OrderStatus::Cancelled => OrderStatus::Cancelled,
            common::OrderStatus::Rejected => OrderStatus::Rejected,
            _ => OrderStatus::New,
        };

        let type_enum = common::OrderType::try_from(proto_order.r#type)
            .map_err(|_| Status::invalid_argument("Invalid order type"))?;
        let order_type = match type_enum {
            common::OrderType::Limit => OrderType::Limit,
            common::OrderType::Market => OrderType::Market,
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
}
