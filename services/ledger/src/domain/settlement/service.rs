use sqlx::{Transaction, Postgres, PgPool};
use rust_decimal::Decimal;
use std::str::FromStr;
use crate::domain::ledger::repository::LedgerRepository;
use uuid::Uuid;
use std::sync::Arc;
use crate::error::{Result, AppError};
use crate::proto::ledger::Match;
use crate::proto::common::{Trade, OrderSide};
use crate::domain::wallets::WalletService;
use crate::infra::repositories::InstrumentRepository;
use crate::domain::ledger::service::LedgerService;
use crate::domain::orders::service::OrderService;
use crate::domain::fills::service::FillService;

pub struct SettlementService {
    pool: Option<PgPool>,
    #[allow(dead_code)]
    order_service: Arc<OrderService>,
    #[allow(dead_code)]
    instrument_repo: Arc<dyn InstrumentRepository>,
    ledger_service: Arc<LedgerService>,
    wallet_service: Arc<WalletService>,
    fill_service: Arc<FillService>,
    ledger_repo: Arc<dyn LedgerRepository>,
}

impl SettlementService {
    pub fn new(
        pool: Option<PgPool>,
        order_service: Arc<OrderService>,
        instrument_repo: Arc<dyn InstrumentRepository>,
        ledger_service: Arc<LedgerService>,
        wallet_service: Arc<WalletService>,
        fill_service: Arc<FillService>,
        ledger_repo: Arc<dyn LedgerRepository>,
    ) -> Self {
        Self {
            pool,
            order_service,
            instrument_repo,
            ledger_service,
            wallet_service,
            fill_service,
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
        self.order_service.update_status(order_id_str, trade_qty).await
    }

    async fn update_order_status_with_tx(&self, tx: &mut Transaction<'_, Postgres>, order_id_str: &str, trade_qty: Decimal) -> Result<()> {
        self.order_service.update_status_with_tx(tx, order_id_str, trade_qty).await
    }

    pub async fn process_trade_event(&self, trade: Trade) -> Result<()> {
        log::info!("Processing trade event: {}", trade.id);
        
        // Fetch instrument to get quote asset for fee currency
        let instrument_id = Uuid::parse_str(&trade.instrument_id).map_err(|_| AppError::ValidationError("Invalid instrument ID".into()))?;
        let instrument = self.instrument_repo.get(instrument_id).await?
            .ok_or(AppError::NotFound(format!("Instrument {} not found", trade.instrument_id)))?;

        let trade_qty = Decimal::from_str(&trade.quantity).map_err(|_| AppError::ValidationError("Invalid trade quantity".into()))?;

        if let Some(pool) = &self.pool {
            // Transactional Path
            let mut tx = pool.begin().await.map_err(AppError::DatabaseError)?;

            let (event, entries) = self.ledger_service.process_trade(trade.clone()).await?;
            
            self.ledger_repo.save_event_with_tx(&mut tx, event).await?;
            self.ledger_repo.save_entries_with_tx(&mut tx, entries.clone()).await?;
            
            log::info!("Generated and Persisted {} ledger entries for trade {}", entries.len(), trade.id);
            for entry in entries {
                self.wallet_service.process_ledger_entry_with_tx(&mut tx, entry).await?;
            }

            self.update_order_status_with_tx(&mut tx, &trade.buy_order_id, trade_qty).await?;
            self.update_order_status_with_tx(&mut tx, &trade.sell_order_id, trade_qty).await?;

            let buy_fill = self.fill_service.create_fill_from_trade(&trade, &trade.buy_order_id, "buy", "taker", trade_qty, &instrument.quote_asset_id)?;
            let sell_fill = self.fill_service.create_fill_from_trade(&trade, &trade.sell_order_id, "sell", "maker", trade_qty, &instrument.quote_asset_id)?;

            self.fill_service.save_fill_with_tx(&mut tx, buy_fill).await?;
            self.fill_service.save_fill_with_tx(&mut tx, sell_fill).await?;

            tx.commit().await.map_err(AppError::DatabaseError)?;
        } else {
            // Non-Transactional Path (for tests with mocks)
            let (event, entries) = self.ledger_service.process_trade(trade.clone()).await?;
            
            self.ledger_repo.save_event(event).await?;
            self.ledger_repo.save_entries(entries.clone()).await?;
            
            log::info!("Generated and Persisted {} ledger entries for trade {}", entries.len(), trade.id);
            for entry in entries {
                self.wallet_service.process_ledger_entry(entry).await?;
            }

            self.update_order_status(&trade.buy_order_id, trade_qty).await?;
            self.update_order_status(&trade.sell_order_id, trade_qty).await?;

            let buy_fill = self.fill_service.create_fill_from_trade(&trade, &trade.buy_order_id, "buy", "taker", trade_qty, &instrument.quote_asset_id)?;
            let sell_fill = self.fill_service.create_fill_from_trade(&trade, &trade.sell_order_id, "sell", "maker", trade_qty, &instrument.quote_asset_id)?;

            self.fill_service.save_fill(buy_fill).await?;
            self.fill_service.save_fill(sell_fill).await?;
        }

        Ok(())
    }
}
