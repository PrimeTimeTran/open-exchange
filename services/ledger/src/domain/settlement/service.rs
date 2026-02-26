use crate::domain::fees::service::FeeService;
use crate::domain::fills::service::FillService;
use crate::domain::fills::Fill;
use crate::domain::ledger::repository::LedgerRepository;
use crate::domain::ledger::service::LedgerService;
use crate::domain::orders::service::OrderService;
use crate::domain::trade::TradeRepository;
use crate::domain::transaction::Transaction;
use crate::domain::transaction::TransactionManager;
use crate::domain::wallets::WalletService;
use crate::error::{AppError, Result};
use crate::infra::mappers::match_mapper::MatchMapper;
use crate::infra::repositories::InstrumentRepository;
use crate::proto::common::{LedgerEntry, LedgerEvent, Trade};
use crate::proto::ledger::Match;
use rust_decimal::Decimal;
use std::str::FromStr;
use std::sync::Arc;
use uuid::Uuid;

pub struct SettlementService {
    tx_manager: Option<Arc<dyn TransactionManager>>,
    fill_service: Arc<FillService>,
    fee_service: Arc<dyn FeeService>,
    order_service: Arc<OrderService>,
    ledger_service: Arc<LedgerService>,
    wallet_service: Arc<WalletService>,
    trade_repo: Arc<dyn TradeRepository>,
    ledger_repo: Arc<dyn LedgerRepository>,
    instrument_repo: Arc<dyn InstrumentRepository>,
}

impl SettlementService {
    pub fn new(
        tx_manager: Option<Arc<dyn TransactionManager>>,
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
            tx_manager,
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

    pub async fn process_matches(
        &self,
        matches: Vec<Match>,
        tenant_id: String,
    ) -> (Vec<String>, Vec<String>) {
        let mut trade_ids = Vec::new();
        let mut errors = Vec::new();

        for match_data in matches {
            match MatchMapper::to_trade(match_data, &tenant_id) {
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

    pub async fn process_trade_event(&self, trade: Trade) -> Result<()> {
        log::info!("Processing trade event: {}", trade.id);

        if let Some(_) = self.trade_repo.get(&trade.id).await? {
            log::warn!(
                "Trade {} already exists. Skipping processing (Idempotency).",
                trade.id
            );
            return Ok(());
        }

        // Validation and Preparation
        let instrument_id = Uuid::parse_str(&trade.instrument_id)
            .map_err(|_| AppError::MalformedRequest("Invalid instrument ID".into()))?;

        let instrument = self
            .instrument_repo
            .get(instrument_id)
            .await?
            .ok_or_else(|| {
                AppError::NotFound(format!("Instrument {} not found", trade.instrument_id))
            })?;

        let trade_qty = Decimal::from_str(&trade.quantity)
            .map_err(|_| AppError::MalformedRequest("Invalid trade quantity".into()))?;

        // Wash-trade detection
        let buy_order_id = Uuid::parse_str(&trade.buy_order_id)
            .map_err(|_| AppError::MalformedRequest("Invalid buy_order_id".into()))?;
        let sell_order_id = Uuid::parse_str(&trade.sell_order_id)
            .map_err(|_| AppError::MalformedRequest("Invalid sell_order_id".into()))?;

        if let (Some(buy_order), Some(sell_order)) = (
            self.order_service.get_order(buy_order_id).await?,
            self.order_service.get_order(sell_order_id).await?,
        ) {
            // Same account on both sides
            if buy_order.account_id == sell_order.account_id {
                return Err(AppError::ValidationError(
                    "Self-trade detected: buy and sell orders belong to the same account".into(),
                ));
            }

            // Same user_id embedded in order meta (cross-account wash trade)
            let buy_user = buy_order.meta.get("user_id").and_then(|v| v.as_str());
            let sell_user = sell_order.meta.get("user_id").and_then(|v| v.as_str());
            if let (Some(b), Some(s)) = (buy_user, sell_user) {
                if !b.is_empty() && b == s {
                    return Err(AppError::ValidationError(
                        "Wash trade detected: buy and sell orders belong to the same user".into(),
                    ));
                }
            }
        }

        // Transaction Management
        let tx = self.begin_transaction().await?;
        let mut ctx = SettlementContext::new(self, tx);

        // Core Business Logic
        // 1. Persist Trade (needed for FKs)
        ctx.save_trade(trade.clone()).await?;

        // Calculate Fees
        let price_decimal = Decimal::from_str(&trade.price).unwrap_or_default();
        let buy_fee = self
            .fee_service
            .calculate_fee(trade_qty, price_decimal, "taker");
        let sell_fee = self
            .fee_service
            .calculate_fee(trade_qty, price_decimal, "maker");

        // 2. Generate and persist ledger events/entries
        let (event, entries) = self
            .ledger_service
            .process_trade(trade.clone(), buy_fee, sell_fee)
            .await?;
        ctx.save_ledger_event(event).await?;
        ctx.save_ledger_entries(entries.clone()).await?;

        log::info!(
            "Generated {} ledger entries for trade {}",
            entries.len(),
            trade.id
        );

        // 3. Process wallet updates
        for entry in entries {
            ctx.process_wallet_entry(entry).await?;
        }

        // 4. Update order statuses
        ctx.update_order_status(&trade.buy_order_id, trade_qty)
            .await?;
        ctx.update_order_status(&trade.sell_order_id, trade_qty)
            .await?;

        // 5. Create and persist fills
        let buy_fill = self.fill_service.create_fill_from_trade(
            &trade,
            &trade.buy_order_id,
            "buy",
            "taker",
            trade_qty,
            buy_fee,
            &instrument.quote_asset_id,
        )?;
        let sell_fill = self.fill_service.create_fill_from_trade(
            &trade,
            &trade.sell_order_id,
            "sell",
            "maker",
            trade_qty,
            sell_fee,
            &instrument.quote_asset_id,
        )?;

        ctx.save_fill(buy_fill).await?;
        ctx.save_fill(sell_fill).await?;

        // 6. Commit
        ctx.commit().await?;

        Ok(())
    }

    async fn begin_transaction(&self) -> Result<Option<Box<dyn Transaction>>> {
        if let Some(manager) = &self.tx_manager {
            let tx = manager.begin().await?;
            Ok(Some(tx))
        } else {
            Ok(None)
        }
    }
}

// Settlement Context helps manage transaction scope and provides helper methods for common operations during settlement processing.
// It abstracts away the details of whether a transaction is being used or not, allowing the core business logic to remain clean and focused on the domain operations.
// This pattern also makes it easier to add additional operations in the future (e.g., logging, metrics) without cluttering the main settlement logic.
struct SettlementContext<'a> {
    tx: Option<Box<dyn Transaction>>,
    service: &'a SettlementService,
}

impl<'a> SettlementContext<'a> {
    fn new(service: &'a SettlementService, tx: Option<Box<dyn Transaction>>) -> Self {
        Self { tx, service }
    }

    async fn commit(self) -> Result<()> {
        if let Some(tx) = self.tx {
            tx.commit().await?;
        }
        Ok(())
    }

    async fn save_ledger_event(&mut self, event: LedgerEvent) -> Result<LedgerEvent> {
        match &mut self.tx {
            Some(tx) => {
                self.service
                    .ledger_repo
                    .save_event_with_tx(tx.as_repository_transaction(), event)
                    .await
            }
            None => self.service.ledger_repo.save_event(event).await,
        }
    }

    async fn save_ledger_entries(&mut self, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>> {
        match &mut self.tx {
            Some(tx) => {
                self.service
                    .ledger_repo
                    .save_entries_with_tx(tx.as_repository_transaction(), entries)
                    .await
            }
            None => self.service.ledger_repo.save_entries(entries).await,
        }
    }

    async fn process_wallet_entry(&mut self, entry: LedgerEntry) -> Result<()> {
        match &mut self.tx {
            Some(tx) => {
                self.service
                    .wallet_service
                    .process_ledger_entry_with_tx(tx.as_repository_transaction(), entry)
                    .await
            }
            None => {
                self.service
                    .wallet_service
                    .process_ledger_entry(entry)
                    .await
            }
        }
    }

    async fn update_order_status(&mut self, order_id: &str, trade_qty: Decimal) -> Result<()> {
        match &mut self.tx {
            Some(tx) => {
                self.service
                    .order_service
                    .update_status_with_tx(tx.as_repository_transaction(), order_id, trade_qty)
                    .await
            }
            None => {
                self.service
                    .order_service
                    .update_status(order_id, trade_qty)
                    .await
            }
        }
    }

    async fn save_fill(&mut self, fill: Fill) -> Result<Fill> {
        match &mut self.tx {
            Some(tx) => {
                self.service
                    .fill_service
                    .save_fill_with_tx(tx.as_repository_transaction(), fill)
                    .await
            }
            None => self.service.fill_service.save_fill(fill).await,
        }
    }

    async fn save_trade(&mut self, trade: Trade) -> Result<Trade> {
        match &mut self.tx {
            Some(tx) => {
                self.service
                    .trade_repo
                    .create_with_tx(tx.as_repository_transaction(), trade)
                    .await
            }
            None => self.service.trade_repo.create(trade).await,
        }
    }
}
