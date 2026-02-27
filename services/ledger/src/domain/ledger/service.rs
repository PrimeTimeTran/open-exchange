use crate::domain::accounts::repository::AccountRepository;
use crate::domain::ledger::model::{LedgerEntry, LedgerEvent};
use crate::domain::orders::model::{Order, OrderSide};
use crate::domain::orders::repository::OrderRepository;
use crate::domain::trade::model::Trade;
use crate::error::{AppError, Result};
use crate::infra::repositories::InstrumentRepository;
use chrono::Utc;
use rust_decimal::Decimal;
use rust_decimal::MathematicalOps;

use std::sync::Arc;
use uuid::Uuid;

struct TradeData {
    buy_order: Order,
    sell_order: Order,
    base_asset_id: String,
    quote_asset_id: String,
    base_decimals: i32,
    quote_decimals: i32,
    fees_account_id: String,
}

struct TradeAmounts {
    qty_atomic: Decimal,
    total_atomic: Decimal,
    buyer_fee_atomic: Decimal,
    seller_fee_atomic: Decimal,
}

struct OrderLockData {
    asset_id: String,
    amount_atomic: Decimal,
}

pub struct LedgerService {
    order_repo: Arc<dyn OrderRepository>,
    instrument_repo: Arc<dyn InstrumentRepository>,
    asset_repo: Arc<dyn crate::infra::repositories::AssetRepository>,
    account_repo: Arc<dyn AccountRepository>,
}

impl LedgerService {
    pub fn new(
        order_repo: Arc<dyn OrderRepository>,
        instrument_repo: Arc<dyn InstrumentRepository>,
        asset_repo: Arc<dyn crate::infra::repositories::AssetRepository>,
        account_repo: Arc<dyn AccountRepository>,
    ) -> Self {
        Self {
            order_repo,
            instrument_repo,
            asset_repo,
            account_repo,
        }
    }

    fn create_entry(
        tenant_id: Uuid,
        event_id: Uuid,
        account_id: Uuid,
        amount: Decimal,
        asset: &str,
        entry_type: &str,
    ) -> LedgerEntry {
        let timestamp = Utc::now();
        let meta = serde_json::json!({
            "asset": asset,
            "type": entry_type
        });

        LedgerEntry {
            id: Uuid::new_v4(),
            tenant_id,
            event_id,
            account_id,
            amount,
            meta,
            created_at: timestamp,
            updated_at: timestamp,
        }
    }

    fn create_event(
        tenant_id: Uuid,
        event_id: Uuid,
        event_type: &str,
        reference_id: Uuid,
        reference_type: &str,
        description: &str,
    ) -> LedgerEvent {
        let timestamp = Utc::now();
        LedgerEvent {
            id: event_id,
            tenant_id,
            r#type: event_type.to_string(),
            reference_id,
            reference_type: reference_type.to_string(),
            status: "completed".to_string(),
            description: Some(description.to_string()),
            meta: serde_json::json!({}),
            created_at: timestamp,
            updated_at: timestamp,
        }
    }

    pub async fn process_trade(
        &self,
        trade: Trade,
        buyer_fee: Decimal,
        seller_fee: Decimal,
    ) -> Result<(LedgerEvent, Vec<LedgerEntry>)> {
        let event_id = Uuid::new_v4();
        let tenant_id = trade.tenant_id;
        let trade_id = trade.id;

        // 1. Fetch context data
        let data = self.fetch_trade_data(&trade).await?;

        // 2. Calculate amounts
        let amounts = self.calculate_trade_amounts(
            &trade,
            data.base_decimals,
            data.quote_decimals,
            buyer_fee,
            seller_fee,
        )?;

        // 3. Create Ledger Event
        let event = Self::create_event(
            tenant_id,
            event_id,
            "trade",
            trade_id,
            "Trade",
            "Trade execution",
        );

        // 4. Generate Ledger Entries
        let entries = self.generate_trade_entries(tenant_id, event_id, &data, &amounts)?;

        Ok((event, entries))
    }

    pub async fn process_order_placed(
        &self,
        order: Order,
    ) -> Result<(LedgerEvent, Vec<LedgerEntry>)> {
        let event_id = Uuid::new_v4();

        // 1. Prepare Lock Data (Asset & Amount)
        let lock_data = self.prepare_order_lock(&order).await?;

        // 2. Create Ledger Event
        let event = Self::create_event(
            order.tenant_id,
            event_id,
            "order_placed",
            order.id,
            "order",
            "Funds reservation for order",
        );

        // 3. Generate Entries
        let entries =
            self.generate_lock_entries(order.tenant_id, event_id, order.account_id, &lock_data)?;

        Ok((event, entries))
    }

    async fn fetch_trade_data(&self, trade: &Trade) -> Result<TradeData> {
        let buy_order_uuid = trade.buy_order_id;
        let sell_order_uuid = trade.sell_order_id;

        let buy_order = self
            .order_repo
            .get(buy_order_uuid)
            .await?
            .ok_or(AppError::NotFound(format!(
                "Buy order {} not found",
                buy_order_uuid
            )))?;
        let sell_order = self
            .order_repo
            .get(sell_order_uuid)
            .await?
            .ok_or(AppError::NotFound(format!(
                "Sell order {} not found",
                sell_order_uuid
            )))?;

        let instrument_id = trade.instrument_id;
        let instrument =
            self.instrument_repo
                .get(instrument_id)
                .await?
                .ok_or(AppError::NotFound(format!(
                    "Instrument {} not found",
                    trade.instrument_id
                )))?;

        let base_asset_id = instrument.underlying_asset_id;
        let quote_asset_id = instrument.quote_asset_id;

        let base_asset = self
            .asset_repo
            .get(base_asset_id)
            .await?
            .ok_or(AppError::NotFound(format!(
                "Base asset {} not found",
                base_asset_id
            )))?;
        let quote_asset = self
            .asset_repo
            .get(quote_asset_id)
            .await?
            .ok_or(AppError::NotFound(format!(
                "Quote asset {} not found",
                quote_asset_id
            )))?;

        let fees_account =
            self.account_repo
                .get_by_name("fees_account")
                .await?
                .ok_or(AppError::NotFound(
                    "System fees_account not found".to_string(),
                ))?;

        Ok(TradeData {
            buy_order,
            sell_order,
            base_asset_id: base_asset_id.to_string(),
            quote_asset_id: quote_asset_id.to_string(),
            base_decimals: base_asset.decimals,
            quote_decimals: quote_asset.decimals,
            fees_account_id: fees_account.id.to_string(),
        })
    }

    fn calculate_trade_amounts(
        &self,
        trade: &Trade,
        base_decimals: i32,
        quote_decimals: i32,
        buyer_fee: Decimal,
        seller_fee: Decimal,
    ) -> Result<TradeAmounts> {
        let trade_price = trade.price;
        let trade_qty = trade.quantity;
        let total_value = trade_price * trade_qty;

        // Scale Amounts (to Atomic Units)
        let base_scale = Decimal::from(10).powi(base_decimals as i64);
        let quote_scale = Decimal::from(10).powi(quote_decimals as i64);

        Ok(TradeAmounts {
            qty_atomic: (trade_qty * base_scale).floor(),
            total_atomic: (total_value * quote_scale).floor(),
            buyer_fee_atomic: (buyer_fee * quote_scale).floor(),
            seller_fee_atomic: (seller_fee * quote_scale).floor(),
        })
    }

    fn generate_trade_entries(
        &self,
        tenant_id: Uuid,
        event_id: Uuid,
        data: &TradeData,
        amounts: &TradeAmounts,
    ) -> Result<Vec<LedgerEntry>> {
        let mut entries = Vec::new();

        // Entry 1: Buyer receives Base Asset (+Qty)
        entries.push(Self::create_entry(
            tenant_id,
            event_id,
            data.buy_order.account_id,
            amounts.qty_atomic,
            &data.base_asset_id,
            "credit",
        ));

        // Entry 2: Buyer pays Quote Asset (-Total)
        entries.push(Self::create_entry(
            tenant_id,
            event_id,
            data.buy_order.account_id,
            -amounts.total_atomic,
            &data.quote_asset_id,
            "debit",
        ));

        // Entry 3: Buyer pays Fee (-BuyerFee)
        if !amounts.buyer_fee_atomic.is_zero() {
            entries.push(Self::create_entry(
                tenant_id,
                event_id,
                data.buy_order.account_id,
                -amounts.buyer_fee_atomic,
                &data.quote_asset_id,
                "fee",
            ));
        }

        // Entry 4: Seller pays Base Asset (-Qty)
        entries.push(Self::create_entry(
            tenant_id,
            event_id,
            data.sell_order.account_id,
            -amounts.qty_atomic,
            &data.base_asset_id,
            "debit",
        ));

        // Entry 5: Seller receives Quote Asset (+NetProceeds)
        let seller_proceeds = amounts.total_atomic - amounts.seller_fee_atomic;
        entries.push(Self::create_entry(
            tenant_id,
            event_id,
            data.sell_order.account_id,
            seller_proceeds,
            &data.quote_asset_id,
            "credit",
        ));

        // Entry 6: Exchange receives Fee (+TotalFee)
        let total_fee = amounts.buyer_fee_atomic + amounts.seller_fee_atomic;
        if !total_fee.is_zero() {
            let fee_account_uuid = Uuid::parse_str(&data.fees_account_id)
                .map_err(|_| AppError::Internal("Invalid fee account ID".into()))?;
            entries.push(Self::create_entry(
                tenant_id,
                event_id,
                fee_account_uuid,
                total_fee,
                &data.quote_asset_id,
                "revenue",
            ));
        }

        Ok(entries)
    }

    async fn prepare_order_lock(&self, order: &Order) -> Result<OrderLockData> {
        let instrument_id = order.instrument_id;
        let instrument =
            self.instrument_repo
                .get(instrument_id)
                .await?
                .ok_or(AppError::NotFound(format!(
                    "Instrument {} not found",
                    order.instrument_id
                )))?;

        let (asset_uuid, raw_amount) = if order.side == OrderSide::Buy {
            (instrument.quote_asset_id, order.price * order.quantity)
        } else {
            (instrument.underlying_asset_id, order.quantity)
        };

        let asset = self
            .asset_repo
            .get(asset_uuid)
            .await?
            .ok_or(AppError::NotFound(format!(
                "Asset {} not found",
                asset_uuid
            )))?;

        let scale = Decimal::from(10).powi(asset.decimals as i64);
        let amount_atomic = (raw_amount * scale).floor();

        Ok(OrderLockData {
            asset_id: asset_uuid.to_string(),
            amount_atomic,
        })
    }

    fn generate_lock_entries(
        &self,
        tenant_id: Uuid,
        event_id: Uuid,
        account_id: Uuid,
        lock_data: &OrderLockData,
    ) -> Result<Vec<LedgerEntry>> {
        let mut entries = Vec::new();

        // Entry 1: Debit Available Balance
        entries.push(Self::create_entry(
            tenant_id,
            event_id,
            account_id,
            -lock_data.amount_atomic,
            &lock_data.asset_id,
            "available",
        ));

        // Entry 2: Credit Locked Balance
        entries.push(Self::create_entry(
            tenant_id,
            event_id,
            account_id,
            lock_data.amount_atomic,
            &lock_data.asset_id,
            "locked",
        ));

        // Override meta to include action: lock
        for entry in &mut entries {
            if let Some(obj) = entry.meta.as_object_mut() {
                obj.insert("action".to_string(), serde_json::json!("lock"));
            }
        }

        Ok(entries)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::accounts::repository::AccountRepository;
    use crate::domain::accounts::Account;
    use crate::domain::assets::model::Asset;
    use crate::domain::instruments::model::Instrument;
    use crate::domain::orders::model::{Order, OrderStatus, OrderType};
    use crate::infra::repositories::{
        AssetRepository, InMemoryAccountRepository, InMemoryAssetRepository,
        InMemoryInstrumentRepository, InMemoryOrderRepository,
    };
    use rust_decimal::Decimal;
    use std::str::FromStr;

    #[tokio::test]
    async fn test_process_trade_events() {
        let order_repo = Arc::new(InMemoryOrderRepository::new());
        let instrument_repo = Arc::new(InMemoryInstrumentRepository::new());
        let asset_repo = Arc::new(InMemoryAssetRepository::new());
        let account_repo = Arc::new(InMemoryAccountRepository::new());
        let service = LedgerService::new(
            order_repo.clone(),
            instrument_repo.clone(),
            asset_repo.clone(),
            account_repo.clone(),
        );

        // Setup Data
        let tenant_id = Uuid::new_v4();
        let instrument_id = Uuid::new_v4();
        let account_a = Uuid::new_v4(); // Buyer
        let account_b = Uuid::new_v4(); // Seller

        // Setup Assets
        let btc_uuid = Uuid::new_v4();
        let btc_id = btc_uuid.to_string();
        let usd_uuid = Uuid::new_v4();
        let usd_id = usd_uuid.to_string();

        asset_repo
            .create(Asset {
                id: btc_uuid,
                tenant_id,
                symbol: "BTC".to_string(),
                decimals: 8,
                r#type: "CRYPTO".to_string(),
                meta: serde_json::json!({}),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            })
            .await
            .expect("Failed to create BTC asset");

        asset_repo
            .create(Asset {
                id: usd_uuid,
                tenant_id,
                symbol: "USD".to_string(),
                decimals: 2,
                r#type: "FIAT".to_string(),
                meta: serde_json::json!({}),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            })
            .await
            .expect("Failed to create USD asset");

        // Setup Fee Account
        let fees_account_id = Uuid::new_v4();
        account_repo
            .create(Account {
                id: fees_account_id,
                tenant_id: tenant_id.to_string(),
                user_id: "".to_string(),
                name: "fees_account".to_string(),
                r#type: "fees".to_string(),
                status: "active".to_string(),
                meta: serde_json::json!({}),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            })
            .await
            .expect("Failed to create fees account");

        let instrument = Instrument {
            id: instrument_id,
            tenant_id,
            symbol: "BTC-USD".to_string(),
            r#type: "spot".to_string(),
            status: "active".to_string(),
            underlying_asset_id: Uuid::parse_str(&btc_id).expect("Invalid BTC ID"),
            quote_asset_id: Uuid::parse_str(&usd_id).expect("Invalid USD ID"),
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        instrument_repo
            .create(instrument)
            .await
            .expect("Failed to create instrument");

        let buy_order = Order {
            id: Uuid::new_v4(),
            tenant_id,
            account_id: account_a,
            instrument_id,
            side: OrderSide::Buy,
            r#type: OrderType::Limit,
            quantity: Decimal::new(10, 1),
            price: Decimal::from(50000),
            status: OrderStatus::New,
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
            side: OrderSide::Sell,
            r#type: OrderType::Limit,
            quantity: Decimal::new(10, 1),
            price: Decimal::from(50000),
            status: OrderStatus::New,
            filled_quantity: Decimal::ZERO,
            average_fill_price: Decimal::ZERO,
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        order_repo
            .create(buy_order.clone())
            .await
            .expect("Failed to create buy order");
        order_repo
            .create(sell_order.clone())
            .await
            .expect("Failed to create sell order");

        let trade = Trade {
            id: Uuid::new_v4(),
            tenant_id,
            instrument_id,
            buy_order_id: buy_order.id,
            sell_order_id: sell_order.id,
            price: Decimal::new(50000, 0),
            quantity: Decimal::new(10, 1),
            ..Default::default()
        };

        // Pass fees (50 USD Buyer Fee, 0 Seller Fee) to match expected 6 entries
        let buyer_fee = Decimal::new(50, 0);
        let seller_fee = Decimal::ZERO;
        let result = service.process_trade(trade, buyer_fee, seller_fee).await;
        assert!(result.is_ok(), "Process trade failed: {:?}", result.err());

        let (event, entries) = result.expect("Process trade failed");
        assert_eq!(event.r#type, "trade");

        assert_eq!(entries.len(), 6);

        let buyer_btc = entries.iter().find(|e| {
            e.account_id == account_a && e.meta["asset"] == btc_id && e.meta["type"] == "credit"
        });
        assert!(buyer_btc.is_some(), "Buyer BTC entry missing");
        assert_eq!(
            buyer_btc.expect("Buyer BTC missing").amount,
            Decimal::from_str("100000000").expect("Invalid decimal")
        );

        let buyer_usd = entries.iter().find(|e| {
            e.account_id == account_a && e.meta["asset"] == usd_id && e.meta["type"] == "debit"
        });
        assert!(buyer_usd.is_some(), "Buyer USD entry missing");
        assert_eq!(
            buyer_usd.expect("Buyer USD missing").amount,
            Decimal::from_str("-5000000").expect("Invalid decimal")
        );
    }
}
