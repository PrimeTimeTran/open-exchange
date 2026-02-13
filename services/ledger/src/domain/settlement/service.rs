use sqlx::{Transaction, Postgres, PgPool};
use rust_decimal::Decimal;
use std::str::FromStr;
use crate::domain::ledger::repository::LedgerRepository;
use uuid::Uuid;
use std::sync::Arc;
use crate::error::{Result, AppError};
use crate::proto::ledger::Match;
use crate::proto::common::{Trade, OrderSide, LedgerEvent, LedgerEntry};
use crate::domain::wallets::WalletService;
use crate::infra::repositories::InstrumentRepository;
use crate::domain::ledger::service::LedgerService;
use crate::domain::orders::service::OrderService;
use crate::domain::fills::service::FillService;
use crate::domain::fills::Fill;

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

// Helper struct to abstract over Transaction vs No-Transaction
struct SettlementContext<'a> {
    tx: Option<Transaction<'a, Postgres>>,
    service: &'a SettlementService,
}

impl<'a> SettlementContext<'a> {
    fn new(service: &'a SettlementService, tx: Option<Transaction<'a, Postgres>>) -> Self {
        Self { tx, service }
    }

    async fn commit(self) -> Result<()> {
        if let Some(tx) = self.tx {
            tx.commit().await.map_err(AppError::DatabaseError)?;
        }
        Ok(())
    }

    async fn save_ledger_event(&mut self, event: LedgerEvent) -> Result<LedgerEvent> {
        if let Some(tx) = &mut self.tx {
            self.service.ledger_repo.save_event_with_tx(tx, event).await
        } else {
            self.service.ledger_repo.save_event(event).await
        }
    }

    async fn save_ledger_entries(&mut self, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>> {
        if let Some(tx) = &mut self.tx {
            self.service.ledger_repo.save_entries_with_tx(tx, entries).await
        } else {
            self.service.ledger_repo.save_entries(entries).await
        }
    }

    async fn process_wallet_entry(&mut self, entry: LedgerEntry) -> Result<()> {
        if let Some(tx) = &mut self.tx {
            self.service.wallet_service.process_ledger_entry_with_tx(tx, entry).await
        } else {
            self.service.wallet_service.process_ledger_entry(entry).await
        }
    }

    async fn update_order_status(&mut self, order_id: &str, trade_qty: Decimal) -> Result<()> {
        if let Some(tx) = &mut self.tx {
            self.service.order_service.update_status_with_tx(tx, order_id, trade_qty).await
        } else {
            self.service.order_service.update_status(order_id, trade_qty).await
        }
    }

    async fn save_fill(&mut self, fill: Fill) -> Result<Fill> {
        if let Some(tx) = &mut self.tx {
            self.service.fill_service.save_fill_with_tx(tx, fill).await
        } else {
            self.service.fill_service.save_fill(fill).await
        }
    }
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

    pub async fn process_trade_event(&self, trade: Trade) -> Result<()> {
        log::info!("Processing trade event: {}", trade.id);
        
        // Fetch instrument to get quote asset for fee currency
        let instrument_id = Uuid::parse_str(&trade.instrument_id).map_err(|_| AppError::ValidationError("Invalid instrument ID".into()))?;
        let instrument = self.instrument_repo.get(instrument_id).await?
            .ok_or(AppError::NotFound(format!("Instrument {} not found", trade.instrument_id)))?;

        let trade_qty = Decimal::from_str(&trade.quantity).map_err(|_| AppError::ValidationError("Invalid trade quantity".into()))?;

        // Initialize Context (Transactional or Non-Transactional)
        let tx = if let Some(pool) = &self.pool {
            Some(pool.begin().await.map_err(AppError::DatabaseError)?)
        } else {
            None
        };
        
        let mut ctx = SettlementContext::new(self, tx);

        // Core Business Logic (Linear Flow)
        let (event, entries) = self.ledger_service.process_trade(trade.clone()).await?;
        
        ctx.save_ledger_event(event).await?;
        ctx.save_ledger_entries(entries.clone()).await?;
        
        log::info!("Generated and Persisted {} ledger entries for trade {}", entries.len(), trade.id);
        for entry in entries {
            ctx.process_wallet_entry(entry).await?;
        }

        ctx.update_order_status(&trade.buy_order_id, trade_qty).await?;
        ctx.update_order_status(&trade.sell_order_id, trade_qty).await?;

        let buy_fill = self.fill_service.create_fill_from_trade(&trade, &trade.buy_order_id, "buy", "taker", trade_qty, &instrument.quote_asset_id)?;
        let sell_fill = self.fill_service.create_fill_from_trade(&trade, &trade.sell_order_id, "sell", "maker", trade_qty, &instrument.quote_asset_id)?;

        ctx.save_fill(buy_fill).await?;
        ctx.save_fill(sell_fill).await?;

        // Commit Transaction (if any)
        ctx.commit().await?;

        Ok(())
    }
}
