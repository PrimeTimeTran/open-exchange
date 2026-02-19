use std::fmt;
use uuid::Uuid;
use std::str::FromStr;
use rust_decimal::Decimal;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};


#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OrderSide {
    Buy,
    Sell,
}

impl Default for OrderSide {
    fn default() -> Self {
        OrderSide::Buy
    }
}

impl fmt::Display for OrderSide {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            OrderSide::Buy => write!(f, "buy"),
            OrderSide::Sell => write!(f, "sell"),
        }
    }
}

impl FromStr for OrderSide {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "buy" => Ok(OrderSide::Buy),
            "sell" => Ok(OrderSide::Sell),
            _ => Err(format!("Invalid OrderSide: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OrderType {
    Limit,
    Market,
}

impl Default for OrderType {
    fn default() -> Self {
        OrderType::Limit
    }
}

impl fmt::Display for OrderType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            OrderType::Limit => write!(f, "limit"),
            OrderType::Market => write!(f, "market"),
        }
    }
}

impl FromStr for OrderType {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "limit" => Ok(OrderType::Limit),
            "market" => Ok(OrderType::Market),
            _ => Err(format!("Invalid OrderType: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OrderStatus {
    New,
    Open,
    Filled,
    Cancelled,
    PartialFill,
    Rejected,
}

impl Default for OrderStatus {
    fn default() -> Self {
        OrderStatus::New
    }
}

impl fmt::Display for OrderStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            OrderStatus::New => write!(f, "new"),
            OrderStatus::Open => write!(f, "open"),
            OrderStatus::Filled => write!(f, "filled"),
            OrderStatus::Cancelled => write!(f, "cancelled"),
            OrderStatus::PartialFill => write!(f, "partial_fill"),
            OrderStatus::Rejected => write!(f, "rejected"),
        }
    }
}

impl FromStr for OrderStatus {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "new" => Ok(OrderStatus::New),
            "open" => Ok(OrderStatus::Open),
            "filled" => Ok(OrderStatus::Filled),
            "cancelled" => Ok(OrderStatus::Cancelled),
            "partial_fill" | "partialfill" => Ok(OrderStatus::PartialFill),
            "rejected" => Ok(OrderStatus::Rejected),
            _ => Err(format!("Invalid OrderStatus: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Order {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub account_id: Uuid,
    pub instrument_id: Uuid,
    pub side: OrderSide,
    pub r#type: OrderType,
    pub quantity: Decimal,
    pub price: Decimal,
    pub status: OrderStatus,
    pub filled_quantity: Decimal,
    pub average_fill_price: Decimal,
    pub meta: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Order {
    pub fn new(
        tenant_id: Uuid,
        account_id: Uuid,
        instrument_id: Uuid,
        side: OrderSide,
        r#type: OrderType,
        quantity: Decimal,
        price: Decimal,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            tenant_id,
            account_id,
            instrument_id,
            side,
            r#type,
            quantity,
            price,
            status: OrderStatus::New,
            filled_quantity: Decimal::ZERO,
            average_fill_price: Decimal::ZERO,
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }
}
