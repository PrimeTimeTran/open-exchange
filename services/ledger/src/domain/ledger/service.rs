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
        let meta = serde_json::json!({
            "asset": asset,
            "type": entry_type
        }).to_string();

        LedgerEntry {
            id: Uuid::new_v4().to_string(),
            tenant_id: tenant_id.to_string(),
            event_id: event_id.to_string(),
            account_id: account_id.to_string(),
            amount,
            meta,
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
        // Use Nil UUID for exchange account for now to pass validation
        let exchange_account_id = Uuid::nil().to_string(); 
        entries.push(Self::create_entry(
            &trade.tenant_id, &event_id, &exchange_account_id,
            format!("{}", fee_amount), &quote_asset_id, "revenue"
        ));

        Ok((event, entries))
    }

    pub async fn process_order_placed(&self, order: Order) -> Result<(LedgerEvent, Vec<LedgerEntry>)> {
        let event_id = Uuid::new_v4().to_string();

        // 1. Fetch Instrument to determine Asset
        let instrument_id = order.instrument_id;
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
            let mut meta_json: serde_json::Value = serde_json::from_str(&entry.meta)
                .map_err(|e| AppError::Internal(format!("Failed to parse meta json: {}", e)))?;
            
            if let Some(obj) = meta_json.as_object_mut() {
                obj.insert("action".to_string(), serde_json::json!("lock"));
            }
            entry.meta = meta_json.to_string();
        }

        Ok((event, entries))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::infra::repositories::{InMemoryOrderRepository, InMemoryInstrumentRepository};
    use crate::proto::common::Instrument;
    use crate::domain::orders::model::Order;
    use rust_decimal::Decimal;

    #[tokio::test]
    async fn test_process_trade_events() {
        let order_repo = Arc::new(InMemoryOrderRepository::new());
        let instrument_repo = Arc::new(InMemoryInstrumentRepository::new());
        let service = LedgerService::new(order_repo.clone(), instrument_repo.clone());

        // Setup Data
        let tenant_id = Uuid::new_v4();
        let instrument_id = Uuid::new_v4();
        let account_a = Uuid::new_v4(); // Buyer
        let account_b = Uuid::new_v4(); // Seller
        
        let instrument = Instrument {
            id: instrument_id.to_string(),
            tenant_id: tenant_id.to_string(),
            symbol: "BTC-USD".to_string(),
            underlying_asset_id: "BTC".to_string(),
            quote_asset_id: "USD".to_string(),
            ..Default::default()
        };
        instrument_repo.create(instrument).await.unwrap();

        let buy_order = Order {
            id: Uuid::new_v4(),
            tenant_id,
            account_id: account_a,
            instrument_id,
            side: "buy".to_string(),
            r#type: "limit".to_string(),
            quantity: Decimal::new(10, 1),
            price: Decimal::from(50000),
            status: "new".to_string(),
            filled_quantity: Decimal::ZERO,
            average_fill_price: Decimal::ZERO,
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        
        let sell_order = Order {
             id: Uuid::new_v4(),
             tenant_id,
             account_id: account_b,
             instrument_id,
             side: "sell".to_string(),
             r#type: "limit".to_string(),
             quantity: Decimal::new(10, 1),
             price: Decimal::from(50000),
             status: "new".to_string(),
             filled_quantity: Decimal::ZERO,
             average_fill_price: Decimal::ZERO,
             meta: serde_json::json!({}),
             created_at: Utc::now(),
             updated_at: Utc::now(),
        };

        order_repo.create(buy_order.clone()).await.unwrap();
        order_repo.create(sell_order.clone()).await.unwrap();

        let trade = Trade {
            id: Uuid::new_v4().to_string(),
            tenant_id: tenant_id.to_string(),
            instrument_id: instrument_id.to_string(),
            buy_order_id: buy_order.id.to_string(),
            sell_order_id: sell_order.id.to_string(),
            price: "50000".to_string(),
            quantity: "1.0".to_string(),
            ..Default::default()
        };

        let result = service.process_trade(trade).await;
        assert!(result.is_ok());
        
        let (event, entries) = result.unwrap();
        assert_eq!(event.r#type, "trade");
        
        assert_eq!(entries.len(), 6);
        
        let buyer_btc = entries.iter().find(|e| e.account_id == account_a.to_string() && e.meta.contains("BTC") && e.meta.contains("credit"));
        assert!(buyer_btc.is_some());
        assert_eq!(buyer_btc.unwrap().amount, "1.0");

        let buyer_usd = entries.iter().find(|e| e.account_id == account_a.to_string() && e.meta.contains("USD") && e.meta.contains("debit"));
        assert!(buyer_usd.is_some());
        assert_eq!(buyer_usd.unwrap().amount, "-50000.0");
    }
}
