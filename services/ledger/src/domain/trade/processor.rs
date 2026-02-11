use uuid::Uuid;
use std::sync::Arc;
use crate::error::Result;
use crate::proto::ledger::Match;
use crate::proto::common::{Trade, OrderSide};
use crate::domain::wallets::WalletService;
use crate::infra::repositories::InstrumentRepository;
use crate::domain::ledger::service::LedgerService;
use crate::domain::orders::repository::OrderRepository;
use crate::domain::fills::{Fill, FillRepository};
use crate::domain::ledger::repository::LedgerRepository;
use rust_decimal::Decimal;
use std::str::FromStr;

pub struct TradeProcessor {
    #[allow(dead_code)]
    order_repo: Arc<dyn OrderRepository>,
    #[allow(dead_code)]
    instrument_repo: Arc<dyn InstrumentRepository>,
    ledger_service: Arc<LedgerService>,
    wallet_service: Arc<WalletService>,
    fill_repo: Arc<dyn FillRepository>,
    ledger_repo: Arc<dyn LedgerRepository>,
}

impl TradeProcessor {
    pub fn new(
        order_repo: Arc<dyn OrderRepository>,
        instrument_repo: Arc<dyn InstrumentRepository>,
        ledger_service: Arc<LedgerService>,
        wallet_service: Arc<WalletService>,
        fill_repo: Arc<dyn FillRepository>,
        ledger_repo: Arc<dyn LedgerRepository>,
    ) -> Self {
        Self {
            order_repo,
            instrument_repo,
            ledger_service,
            wallet_service,
            fill_repo,
            ledger_repo,
        }
    }

    pub async fn process_matches(&self, matches: Vec<Match>, tenant_id: String) -> (Vec<String>, Vec<String>) {
        let mut trade_ids = Vec::new();
        let mut errors = Vec::new();

        for match_data in matches {
            let trade_id = Uuid::new_v4().to_string();

            let taker_side = OrderSide::try_from(match_data.taker_side).unwrap_or(OrderSide::Unspecified);
            let (buy_order_id, sell_order_id) = match taker_side {
                OrderSide::Buy => (match_data.taker_order_id.clone(), match_data.maker_order_id.clone()),
                OrderSide::Sell => (match_data.maker_order_id.clone(), match_data.taker_order_id.clone()),
                _ => {
                    let msg = format!("Invalid Taker Side for match {}", match_data.match_id);
                    log::error!("{}", msg);
                    errors.push(msg);
                    continue;
                }
            };

            let trade = Trade {
                id: trade_id.clone(),
                tenant_id: tenant_id.clone(),
                instrument_id: match_data.instrument_id.clone(),
                buy_order_id,
                sell_order_id,
                price: match_data.price.clone(),
                quantity: match_data.quantity.clone(),
                meta: "{}".to_string(),
                created_at: match_data.matched_at,
                updated_at: chrono::Utc::now().timestamp_millis(),
            };

            match self.process_trade_event(trade).await {
                Ok(_) => trade_ids.push(trade_id),
                Err(e) => {
                    log::error!("Failed to process trade: {:?}", e);
                    errors.push(e.to_string());
                },
            }
        }
        
        (trade_ids, errors)
    }

    async fn update_order_status(&self, order_id_str: &str, trade_qty: Decimal) -> Result<()> {
        if let Ok(order_uuid) = Uuid::parse_str(order_id_str) {
            if let Some(order) = self.order_repo.get(order_uuid).await? {
                let current_filled = order.filled_quantity;
                let new_filled = current_filled + trade_qty;
                self.order_repo.update_filled_amount(order_uuid, new_filled).await?;
                
                let original_qty = order.quantity;
                if new_filled >= original_qty {
                    self.order_repo.update_status(order_uuid, "FILLED".to_string()).await?;
                } else {
                    self.order_repo.update_status(order_uuid, "PARTIALLY_FILLED".to_string()).await?;
                }
            }
        }
        Ok(())
    }

    pub async fn process_trade_event(&self, trade: Trade) -> Result<()> {
        log::info!("Processing trade event: {}", trade.id);
        let (event, entries) = self.ledger_service.process_trade(trade.clone()).await?;
        self.ledger_repo.save_event(event).await?;
        self.ledger_repo.save_entries(entries.clone()).await?;
        log::info!("Generated and Persisted {} ledger entries for trade {}", entries.len(), trade.id);
        for entry in entries {
            self.wallet_service.process_ledger_entry(entry).await?;
        }

        let trade_qty = Decimal::from_str(&trade.quantity).unwrap_or(Decimal::ZERO);
        self.update_order_status(&trade.buy_order_id, trade_qty).await?;
        self.update_order_status(&trade.sell_order_id, trade_qty).await?;

        // 5. Create Fills
        // Assuming Maker/Taker logic:
        // Since we don't have explicit maker/taker info on the Trade object itself (it was on the Match),
        // we might need to assume or pass it down.
        // For simplicity, let's just create generic fills.
        // Ideally, we'd pass the Match info deeper or enrich the Trade object.
        
        let buy_fill = Self::create_fill(&trade, &trade.buy_order_id, "buy", "taker", trade_qty);
        let sell_fill = Self::create_fill(&trade, &trade.sell_order_id, "sell", "maker", trade_qty);

        self.fill_repo.create(buy_fill).await?;
        self.fill_repo.create(sell_fill).await?;

        Ok(())
    }

    fn create_fill(trade: &Trade, order_id: &str, side: &str, role: &str, quantity: Decimal) -> Fill {
        Fill {
            id: Uuid::new_v4(),
            trade_id: Uuid::parse_str(&trade.id).unwrap_or_default(),
            order_id: Uuid::parse_str(order_id).unwrap_or_default(),
            tenant_id: Uuid::parse_str(&trade.tenant_id).unwrap_or_default(),
            instrument_id: Uuid::parse_str(&trade.instrument_id).unwrap_or_default(),
            price: Decimal::from_str(&trade.price).unwrap_or(Decimal::ZERO),
            quantity,
            fee: Decimal::ZERO, // TODO: Calculate fee
            fee_currency: "USD".to_string(),
            role: role.to_string(),
            side: side.to_string(),
            meta: serde_json::json!({}),
            created_at: chrono::Utc::now(),
        }
    }
}
