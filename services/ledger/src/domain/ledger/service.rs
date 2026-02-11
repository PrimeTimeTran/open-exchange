use crate::proto::common::{Trade, LedgerEvent, LedgerEntry};
use crate::domain::orders::model::Order;
use crate::error::{Result, AppError};
use crate::domain::orders::repository::OrderRepository;
use crate::infra::repositories::InstrumentRepository;
use uuid::Uuid;
use chrono::Utc;
use std::sync::Arc;
use rust_decimal::Decimal;
use std::str::FromStr;

pub struct LedgerService {
    order_repo: Arc<dyn OrderRepository>,
    instrument_repo: Arc<dyn InstrumentRepository>,
}

impl LedgerService {
    pub fn new(order_repo: Arc<dyn OrderRepository>, instrument_repo: Arc<dyn InstrumentRepository>) -> Self {
        Self { order_repo, instrument_repo }
    }

    fn create_entry(
        tenant_id: &str,
        event_id: &str,
        account_id: &str,
        amount: String,
        asset: &str,
        entry_type: &str,
    ) -> LedgerEntry {
        let timestamp = Utc::now().timestamp_millis();
        LedgerEntry {
            id: Uuid::new_v4().to_string(),
            tenant_id: tenant_id.to_string(),
            event_id: event_id.to_string(),
            account_id: account_id.to_string(),
            amount,
            meta: format!(r#"{{"asset": "{}", "type": "{}"}}"#, asset, entry_type),
            created_at: timestamp,
            updated_at: timestamp,
        }
    }

    fn create_event(
        tenant_id: &str,
        event_id: &str,
        event_type: &str,
        reference_id: &str,
        reference_type: &str,
        description: &str,
    ) -> LedgerEvent {
        let timestamp = Utc::now().timestamp_millis();
        LedgerEvent {
            id: event_id.to_string(),
            tenant_id: tenant_id.to_string(),
            r#type: event_type.to_string(),
            reference_id: reference_id.to_string(),
            reference_type: reference_type.to_string(),
            status: "completed".to_string(),
            description: description.to_string(),
            meta: "{}".to_string(),
            created_at: timestamp,
            updated_at: timestamp,
        }
    }

    pub async fn process_trade(&self, trade: Trade) -> Result<(LedgerEvent, Vec<LedgerEntry>)> {
        let event_id = Uuid::new_v4().to_string();

        // 1. Fetch Orders to identify users
        let buy_order_uuid = Uuid::parse_str(&trade.buy_order_id).map_err(|_| AppError::ValidationError("Invalid buy order ID".to_string()))?;
        let sell_order_uuid = Uuid::parse_str(&trade.sell_order_id).map_err(|_| AppError::ValidationError("Invalid sell order ID".to_string()))?;

        let buy_order = self.order_repo.get(buy_order_uuid).await?
            .ok_or(AppError::NotFound(format!("Buy order {} not found", buy_order_uuid)))?;
        let sell_order = self.order_repo.get(sell_order_uuid).await?
            .ok_or(AppError::NotFound(format!("Sell order {} not found", sell_order_uuid)))?;

        // Fetch Instrument to determine assets
        let instrument_id = Uuid::parse_str(&trade.instrument_id).map_err(|_| AppError::ValidationError("Invalid instrument ID".to_string()))?;
        let instrument = self.instrument_repo.get(instrument_id).await?
            .ok_or(AppError::NotFound(format!("Instrument {} not found", trade.instrument_id)))?;
            
        let base_asset_id = instrument.underlying_asset_id;
        let quote_asset_id = instrument.quote_asset_id;

        // 2. Create Ledger Event
        let event = Self::create_event(
            &trade.tenant_id,
            &event_id,
            "trade",
            &trade.id,
            "trade",
            "Trade execution",
        );

        let mut entries = Vec::new();
        let trade_price = Decimal::from_str(&trade.price).map_err(|_| AppError::ValidationError("Invalid trade price".into()))?;
        let trade_qty = Decimal::from_str(&trade.quantity).map_err(|_| AppError::ValidationError("Invalid trade quantity".into()))?;
        let total_value = trade_price * trade_qty;

        // Simplified Fee Logic: Assume 0.1% fee on Buyer
        let fee_rate = Decimal::new(1, 3);
        let fee_amount = total_value * fee_rate; 

        // Entry 1: Buyer receives Base Asset (+Qty)
        entries.push(Self::create_entry(
            &trade.tenant_id, &event_id, &buy_order.account_id.to_string(),
            trade.quantity.clone(), &base_asset_id, "credit"
        ));

        // Entry 2: Buyer pays Quote Asset (-Total)
        entries.push(Self::create_entry(
            &trade.tenant_id, &event_id, &buy_order.account_id.to_string(),
            format!("-{}", total_value), &quote_asset_id, "debit"
        ));

        // Entry 3: Buyer pays Fee (-FeeAmount)
        entries.push(Self::create_entry(
            &trade.tenant_id, &event_id, &buy_order.account_id.to_string(),
            format!("-{}", fee_amount), &quote_asset_id, "fee"
        ));

        // Entry 4: Seller pays Base Asset (-Qty)
        entries.push(Self::create_entry(
            &trade.tenant_id, &event_id, &sell_order.account_id.to_string(),
            format!("-{}", trade.quantity), &base_asset_id, "debit"
        ));

        // Entry 5: Seller receives Quote Asset (+Total)
        entries.push(Self::create_entry(
            &trade.tenant_id, &event_id, &sell_order.account_id.to_string(),
            format!("{}", total_value), &quote_asset_id, "credit"
        ));

        // Entry 6: Exchange receives Fee (+FeeAmount)
        let exchange_account_id = "exchange-account-id"; 
        entries.push(Self::create_entry(
            &trade.tenant_id, &event_id, exchange_account_id,
            format!("{}", fee_amount), &quote_asset_id, "revenue"
        ));

        Ok((event, entries))
    }

    pub async fn process_order_placed(&self, order: Order) -> Result<(LedgerEvent, Vec<LedgerEntry>)> {
        let event_id = Uuid::new_v4().to_string();

        // 1. Fetch Instrument to determine Asset
        let instrument_id = Uuid::parse_str(&order.instrument_id.to_string()).unwrap_or_default();
        let instrument = self.instrument_repo.get(instrument_id).await?
            .ok_or(AppError::NotFound(format!("Instrument {} not found", order.instrument_id)))?;

        // 2. Determine Asset and Amount
        let (asset_id, amount) = if order.side == "buy" { 
            // Buying -> Locking Quote Asset (e.g., buying BTC with USD)
            let price = order.price;
            let quantity = order.quantity;
            (instrument.quote_asset_id, price * quantity)
        } else {
            // Selling -> Locking Base Asset (e.g., selling BTC for USD)
            (instrument.underlying_asset_id, order.quantity)
        };

        // 3. Create Ledger Event
        let event = Self::create_event(
            &order.tenant_id.to_string(),
            &event_id,
            "order_placed",
            &order.id.to_string(),
            "order",
            "Funds reservation for order",
        );

        let mut entries = Vec::new();

        // Entry 1: Debit Available Balance
        entries.push(Self::create_entry(
            &order.tenant_id.to_string(), &event_id, &order.account_id.to_string(),
            format!("-{}", amount), &asset_id, "available"
        ));

        // Entry 2: Credit Locked Balance
        entries.push(Self::create_entry(
            &order.tenant_id.to_string(), &event_id, &order.account_id.to_string(),
            format!("{}", amount), &asset_id, "locked"
        ));

        // Override meta to include action: lock
        for entry in &mut entries {
            let mut meta_json: serde_json::Value = serde_json::from_str(&entry.meta).unwrap();
            meta_json["action"] = serde_json::json!("lock");
            entry.meta = meta_json.to_string();
        }

        Ok((event, entries))
    }
}
