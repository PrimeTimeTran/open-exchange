use crate::domain::fills::Fill;
use crate::proto::ledger::Match;
use crate::error::{Result, AppError};
use crate::domain::trade::TradeRepository;
use crate::domain::wallets::WalletService;
use crate::domain::fees::service::FeeService;
use crate::domain::fills::service::FillService;
use crate::domain::orders::service::OrderService;
use crate::domain::ledger::service::LedgerService;
use crate::infra::repositories::InstrumentRepository;
use crate::domain::ledger::repository::LedgerRepository;
use crate::proto::common::{Trade, OrderSide, LedgerEvent, LedgerEntry};
use uuid::Uuid;
use std::sync::Arc;
use std::str::FromStr;
use rust_decimal::Decimal;
use sqlx::{Transaction, Postgres, PgPool};


pub struct SettlementService {
    pool: Option<PgPool>,
    #[allow(dead_code)]
    fill_service: Arc<FillService>,
    fee_service: Arc<dyn FeeService>,
    order_service: Arc<OrderService>,
    ledger_service: Arc<LedgerService>,
    wallet_service: Arc<WalletService>,
    trade_repo: Arc<dyn TradeRepository>,
    ledger_repo: Arc<dyn LedgerRepository>,
    #[allow(dead_code)]
    instrument_repo: Arc<dyn InstrumentRepository>,
}

impl SettlementService {
    pub fn new(
        pool: Option<PgPool>,
        order_service: Arc<OrderService>,
        instrument_repo: Arc<dyn InstrumentRepository>,
        ledger_service: Arc<LedgerService>,
        wallet_service: Arc<WalletService>,
        fill_service: Arc<FillService>,
        fee_service: Arc<dyn FeeService>,
        ledger_repo: Arc<dyn LedgerRepository>,
        trade_repo: Arc<dyn TradeRepository>,
    ) -> Self {
        Self {
            pool,
            order_service,
            instrument_repo,
            ledger_service,
            wallet_service,
            fill_service,
            fee_service,
            ledger_repo,
            trade_repo,
        }
    }

    pub async fn process_matches(&self, matches: Vec<Match>, tenant_id: String) -> (Vec<String>, Vec<String>) {
        let mut trade_ids = Vec::new();
        let mut errors = Vec::new();

        for match_data in matches {
            match self.convert_match_to_trade(match_data, &tenant_id) {
                Ok(trade) => {
                    let trade_id = trade.id.clone();
                    match self.process_trade_event(trade).await {
                        Ok(_) => trade_ids.push(trade_id),
                        Err(e) => {
                            let msg = format!("Failed to settle trade {}: {:?}", trade_id, e);
                            log::error!("{}", msg);
                            errors.push(msg);
                        }
                    }
                }
                Err(e) => {
                    log::error!("{}", e);
                    errors.push(e);
                }
            }
        }
        
        (trade_ids, errors)
    }

    fn convert_match_to_trade(&self, match_data: Match, tenant_id: &str) -> std::result::Result<Trade, String> {
        let taker_side_enum = OrderSide::try_from(match_data.taker_side)
            .map_err(|_| format!("Invalid Taker Side value: {}", match_data.taker_side))?;

        let (buy_order_id, sell_order_id) = match taker_side_enum {
            OrderSide::Buy => (match_data.taker_order_id.clone(), match_data.maker_order_id.clone()),
            OrderSide::Sell => (match_data.maker_order_id.clone(), match_data.taker_order_id.clone()),
            _ => return Err(format!("Invalid Taker Side for match {}: {:?}", match_data.match_id, taker_side_enum)),
        };

        Ok(Trade {
            id: Uuid::new_v4().to_string(),
            tenant_id: tenant_id.to_string(),
            instrument_id: match_data.instrument_id,
            buy_order_id,
            sell_order_id,
            price: match_data.price,
            quantity: match_data.quantity,
            meta: "{}".to_string(),
            created_at: match_data.matched_at,
            updated_at: chrono::Utc::now().timestamp_millis(),
        })
    }

    pub async fn process_trade_event(&self, trade: Trade) -> Result<()> {
        log::info!("Processing trade event: {}", trade.id);

        // Idempotency Check
        // If the trade already exists, we skip processing and return OK.
        // This is safe because if it exists, it means the transaction that created it (and did the ledger updates)
        // must have committed successfully (atomicity).
        if let Some(_) = self.trade_repo.get(&trade.id).await? {
            log::warn!("Trade {} already exists. Skipping processing (Idempotency).", trade.id);
            return Ok(());
        }
        
        // Validation and Preparation
        let instrument_id = Uuid::parse_str(&trade.instrument_id)
            .map_err(|_| AppError::ValidationError("Invalid instrument ID".into()))?;
            
        let instrument = self.instrument_repo.get(instrument_id).await?
            .ok_or_else(|| AppError::NotFound(format!("Instrument {} not found", trade.instrument_id)))?;

        let trade_qty = Decimal::from_str(&trade.quantity)
            .map_err(|_| AppError::ValidationError("Invalid trade quantity".into()))?;

        // Transaction Management
        let tx = self.begin_system_transaction().await?;
        let mut ctx = SettlementContext::new(self, tx);

        // Core Business Logic
        // 1. Persist Trade (needed for FKs)
        ctx.save_trade(trade.clone()).await?;

        // Calculate Fees
        let price_decimal = Decimal::from_str(&trade.price).unwrap_or_default();
        let buy_fee = self.fee_service.calculate_fee(trade_qty, price_decimal, "taker");
        let sell_fee = self.fee_service.calculate_fee(trade_qty, price_decimal, "maker");

        // 2. Generate and persist ledger events/entries
        let (event, entries) = self.ledger_service.process_trade(trade.clone(), buy_fee, sell_fee).await?;
        ctx.save_ledger_event(event).await?;
        ctx.save_ledger_entries(entries.clone()).await?;
        
        log::info!("Generated {} ledger entries for trade {}", entries.len(), trade.id);
        
        // 3. Process wallet updates
        for entry in entries {
            ctx.process_wallet_entry(entry).await?;
        }

        // 4. Update order statuses
        ctx.update_order_status(&trade.buy_order_id, trade_qty).await?;
        ctx.update_order_status(&trade.sell_order_id, trade_qty).await?;

        // 5. Create and persist fills
        let buy_fill = self.fill_service.create_fill_from_trade(
            &trade, &trade.buy_order_id, "buy", "taker", trade_qty, buy_fee, &instrument.quote_asset_id
        )?;
        let sell_fill = self.fill_service.create_fill_from_trade(
            &trade, &trade.sell_order_id, "sell", "maker", trade_qty, sell_fee, &instrument.quote_asset_id
        )?;

        ctx.save_fill(buy_fill).await?;
        ctx.save_fill(sell_fill).await?;

        // 6. Commit
        ctx.commit().await?;

        Ok(())
    }

    async fn begin_system_transaction(&self) -> Result<Option<Transaction<'_, Postgres>>> {
        if let Some(pool) = &self.pool {
            let mut tx = pool.begin().await.map_err(AppError::DatabaseError)?;
            
            // Bypass RLS for system operations
            sqlx::query("SET app.bypass_rls = 'on'").execute(&mut *tx).await.map_err(AppError::DatabaseError)?;
            sqlx::query("SET app.current_user_id = ''").execute(&mut *tx).await.map_err(AppError::DatabaseError)?;
            sqlx::query("SET app.current_tenant_id = ''").execute(&mut *tx).await.map_err(AppError::DatabaseError)?;
            sqlx::query("SET app.current_membership_id = ''").execute(&mut *tx).await.map_err(AppError::DatabaseError)?;
            
            Ok(Some(tx))
        } else {
            Ok(None)
        }
    }
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
        match &mut self.tx {
            Some(tx) => self.service.ledger_repo.save_event_with_tx(tx, event).await,
            None => self.service.ledger_repo.save_event(event).await,
        }
    }

    async fn save_ledger_entries(&mut self, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>> {
        match &mut self.tx {
            Some(tx) => self.service.ledger_repo.save_entries_with_tx(tx, entries).await,
            None => self.service.ledger_repo.save_entries(entries).await,
        }
    }

    async fn process_wallet_entry(&mut self, entry: LedgerEntry) -> Result<()> {
        match &mut self.tx {
            Some(tx) => self.service.wallet_service.process_ledger_entry_with_tx(tx, entry).await,
            None => self.service.wallet_service.process_ledger_entry(entry).await,
        }
    }

    async fn update_order_status(&mut self, order_id: &str, trade_qty: Decimal) -> Result<()> {
        match &mut self.tx {
            Some(tx) => self.service.order_service.update_status_with_tx(tx, order_id, trade_qty).await,
            None => self.service.order_service.update_status(order_id, trade_qty).await,
        }
    }

    async fn save_fill(&mut self, fill: Fill) -> Result<Fill> {
        match &mut self.tx {
            Some(tx) => self.service.fill_service.save_fill_with_tx(tx, fill).await,
            None => self.service.fill_service.save_fill(fill).await,
        }
    }

    async fn save_trade(&mut self, trade: Trade) -> Result<Trade> {
        match &mut self.tx {
            Some(tx) => self.service.trade_repo.create_with_tx(tx, trade).await,
            None => self.service.trade_repo.create(trade).await,
        }
    }
}
