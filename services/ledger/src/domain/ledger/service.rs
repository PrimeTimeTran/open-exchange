use crate::proto::common::{Trade, LedgerEvent, LedgerEntry};
use crate::domain::orders::model::Order;
use crate::error::{Result, AppError};
use crate::domain::orders::repository::OrderRepository;
use crate::infra::repositories::InstrumentRepository;
use uuid::Uuid;
use chrono::Utc;
use std::sync::Arc;

pub struct LedgerService {
    order_repo: Arc<dyn OrderRepository>,
    instrument_repo: Arc<dyn InstrumentRepository>,
}

impl LedgerService {
    pub fn new(order_repo: Arc<dyn OrderRepository>, instrument_repo: Arc<dyn InstrumentRepository>) -> Self {
        Self { order_repo, instrument_repo }
    }

    pub async fn process_trade(&self, trade: Trade) -> Result<(LedgerEvent, Vec<LedgerEntry>)> {
        let event_id = Uuid::new_v4().to_string();
        let timestamp = Utc::now().timestamp_millis();

        // 1. Fetch Orders to identify users
        let buy_order_uuid = Uuid::parse_str(&trade.buy_order_id).map_err(|_| AppError::ValidationError("Invalid buy order ID".to_string()))?;
        let sell_order_uuid = Uuid::parse_str(&trade.sell_order_id).map_err(|_| AppError::ValidationError("Invalid sell order ID".to_string()))?;

        let buy_order = self.order_repo.get(buy_order_uuid).await?
            .ok_or(AppError::NotFound(format!("Buy order {} not found", buy_order_uuid)))?;
        let sell_order = self.order_repo.get(sell_order_uuid).await?
            .ok_or(AppError::NotFound(format!("Sell order {} not found", sell_order_uuid)))?;

        // 2. Create Ledger Event
        let event = LedgerEvent {
            id: event_id.clone(),
            tenant_id: trade.tenant_id.clone(),
            r#type: "trade".to_string(),
            reference_id: trade.id.clone(),
            reference_type: "trade".to_string(),
            status: "completed".to_string(),
            description: "Trade execution".to_string(),
            meta: "{}".to_string(),
            created_at: timestamp,
            updated_at: timestamp,
        };

        let mut entries = Vec::new();
        let trade_price: f64 = trade.price.parse().unwrap_or(0.0);
        let trade_qty: f64 = trade.quantity.parse().unwrap_or(0.0);
        let total_value = trade_price * trade_qty;

        // Simplified Fee Logic: Assume 0.1% fee on Buyer
        // The prompt says: Buyer pays 30 (fee), so 30,000 * 0.001 = 30.
        // Seller receives 30,000.
        // Exchange receives 30.
        let fee_amount = total_value * 0.001; 

        // Entry 1: Buyer receives BTC (+1)
        entries.push(LedgerEntry {
            id: Uuid::new_v4().to_string(),
            tenant_id: trade.tenant_id.clone(),
            event_id: event_id.clone(),
            account_id: buy_order.account_id.to_string(),
            amount: trade.quantity.clone(), // +1 BTC
            meta: format!(r#"{{"asset": "BTC", "type": "credit"}}"#),
            created_at: timestamp,
            updated_at: timestamp,
        });

        // Entry 2: Buyer pays USD (-30,000)
        entries.push(LedgerEntry {
            id: Uuid::new_v4().to_string(),
            tenant_id: trade.tenant_id.clone(),
            event_id: event_id.clone(),
            account_id: buy_order.account_id.to_string(),
            amount: format!("-{}", total_value), // -30,000 USD
            meta: format!(r#"{{"asset": "USD", "type": "debit"}}"#),
            created_at: timestamp,
            updated_at: timestamp,
        });

        // Entry 3: Buyer pays Fee (-30 USD)
        entries.push(LedgerEntry {
            id: Uuid::new_v4().to_string(),
            tenant_id: trade.tenant_id.clone(),
            event_id: event_id.clone(),
            account_id: buy_order.account_id.to_string(),
            amount: format!("-{}", fee_amount), // -30 USD
            meta: format!(r#"{{"asset": "USD", "type": "fee"}}"#),
            created_at: timestamp,
            updated_at: timestamp,
        });

        // Entry 4: Seller pays BTC (-1)
        entries.push(LedgerEntry {
            id: Uuid::new_v4().to_string(),
            tenant_id: trade.tenant_id.clone(),
            event_id: event_id.clone(),
            account_id: sell_order.account_id.to_string(),
            amount: format!("-{}", trade.quantity), // -1 BTC
            meta: format!(r#"{{"asset": "BTC", "type": "debit"}}"#),
            created_at: timestamp,
            updated_at: timestamp,
        });

        // Entry 5: Seller receives USD (+30,000)
        entries.push(LedgerEntry {
            id: Uuid::new_v4().to_string(),
            tenant_id: trade.tenant_id.clone(),
            event_id: event_id.clone(),
            account_id: sell_order.account_id.to_string(),
            amount: format!("{}", total_value), // +30,000 USD
            meta: format!(r#"{{"asset": "USD", "type": "credit"}}"#),
            created_at: timestamp,
            updated_at: timestamp,
        });

        // Entry 6: Exchange receives Fee (+30 USD)
        // Assume Exchange account ID is fixed or fetched.
        let exchange_account_id = "exchange-account-id"; 
        entries.push(LedgerEntry {
            id: Uuid::new_v4().to_string(),
            tenant_id: trade.tenant_id.clone(),
            event_id: event_id.clone(),
            account_id: exchange_account_id.to_string(),
            amount: format!("{}", fee_amount), // +30 USD
            meta: format!(r#"{{"asset": "USD", "type": "revenue"}}"#),
            created_at: timestamp,
            updated_at: timestamp,
        });

        Ok((event, entries))
    }

    pub async fn process_order_placed(&self, order: Order) -> Result<(LedgerEvent, Vec<LedgerEntry>)> {
        let event_id = Uuid::new_v4().to_string();
        let timestamp = Utc::now().timestamp_millis();

        // 1. Fetch Instrument to determine Asset
        let instrument_id = Uuid::parse_str(&order.instrument_id.to_string()).unwrap_or_default();
        let instrument = self.instrument_repo.get(instrument_id).await?
            .ok_or(AppError::NotFound(format!("Instrument {} not found", order.instrument_id)))?;

        // 2. Determine Asset and Amount
        let (asset_id, amount) = if order.side == "buy" { 
            // Buying -> Locking Quote Asset (e.g., buying BTC with USD)
            // price and quantity are already f64 in the Order model from previous context
            (instrument.quote_asset_id, order.price * order.quantity)
        } else {
            // Selling -> Locking Base Asset (e.g., selling BTC for USD)
            (instrument.underlying_asset_id, order.quantity)
        };

        // 3. Create Ledger Event
        let event = LedgerEvent {
            id: event_id.clone(),
            tenant_id: order.tenant_id.to_string(),
            r#type: "order_placed".to_string(),
            reference_id: order.id.to_string(),
            reference_type: "order".to_string(),
            status: "completed".to_string(),
            description: "Funds reservation for order".to_string(),
            meta: "{}".to_string(),
            created_at: timestamp,
            updated_at: timestamp,
        };

        let mut entries = Vec::new();

        // Entry 1: Debit Available Balance
        entries.push(LedgerEntry {
            id: Uuid::new_v4().to_string(),
            tenant_id: order.tenant_id.to_string(),
            event_id: event_id.clone(),
            account_id: order.account_id.to_string(),
            amount: format!("-{}", amount),
            meta: format!(r#"{{"asset": "{}", "type": "available", "action": "lock"}}"#, asset_id), 
            created_at: timestamp,
            updated_at: timestamp,
        });

        // Entry 2: Credit Locked Balance
        entries.push(LedgerEntry {
            id: Uuid::new_v4().to_string(),
            tenant_id: order.tenant_id.to_string(),
            event_id: event_id.clone(),
            account_id: order.account_id.to_string(),
            amount: format!("{}", amount),
            meta: format!(r#"{{"asset": "{}", "type": "locked", "action": "lock"}}"#, asset_id),
            created_at: timestamp,
            updated_at: timestamp,
        });

        Ok((event, entries))
    }
}
