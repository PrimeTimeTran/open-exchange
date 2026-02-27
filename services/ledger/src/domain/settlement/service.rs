use crate::domain::fees::service::FeeService;
use crate::domain::fills::service::FillService;
use crate::domain::fills::Fill;
use crate::domain::ledger::model::{LedgerEntry, LedgerEvent};
use crate::domain::ledger::repository::LedgerRepository;
use crate::domain::ledger::service::LedgerService;
use crate::domain::orders::service::OrderService;
use crate::domain::trade::model::Trade;
use crate::domain::trade::TradeRepository;
use crate::domain::transaction::{RepositoryTransaction, TransactionManager};
use crate::domain::wallets::WalletService;
use crate::error::{AppError, Result};
use crate::infra::mappers::match_mapper::MatchMapper;
use crate::infra::repositories::InstrumentRepository;
use crate::proto::ledger::Match;
use rust_decimal::Decimal;
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;

#[derive(Clone)]
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
                    let trade_id = trade.id.to_string();
                    match self.process_trade_event(trade).await {
                        Ok(_) => trade_ids.push(trade_id),
                        Err(e) => {
                            let msg = format!("Failed to settle trade {}: {:?}", trade_id, e);
                            tracing::error!("{}", msg);
                            errors.push(msg);
                        }
                    }
                }
                Err(e) => {
                    tracing::error!("{}", e);
                    errors.push(e);
                }
            }
        }

        (trade_ids, errors)
    }

    pub async fn process_trade_event(&self, trade: Trade) -> Result<()> {
        tracing::info!("Processing trade event: {}", trade.id);

        if let Some(_) = self.trade_repo.get(trade.id).await? {
            tracing::warn!(
                "Trade {} already exists. Skipping processing (Idempotency).",
                trade.id
            );
            return Ok(());
        }

        // Validation and Preparation
        let instrument_id = trade.instrument_id;

        let instrument = self
            .instrument_repo
            .get(instrument_id)
            .await?
            .ok_or_else(|| AppError::InvalidInstrument(trade.instrument_id.to_string()))?;

        let trade_qty = trade.quantity;

        // Wash-trade detection
        let buy_order_id = trade.buy_order_id;
        let sell_order_id = trade.sell_order_id;

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

        let this = self.clone();
        self.execute_atomic(move |ctx| {
            Box::pin(async move {
                // Core Business Logic
                // 1. Persist Trade (needed for FKs)
                ctx.save_trade(trade.clone()).await?;

                // Calculate Fees
                let price_decimal = trade.price;
                let buy_fee = this
                    .fee_service
                    .calculate_fee(trade_qty, price_decimal, "taker");
                let sell_fee = this
                    .fee_service
                    .calculate_fee(trade_qty, price_decimal, "maker");

                // 2. Generate and persist ledger events/entries
                let (event, entries) = this
                    .ledger_service
                    .process_trade(trade.clone(), buy_fee, sell_fee)
                    .await?;
                ctx.save_ledger_event(event).await?;
                ctx.save_ledger_entries(entries.clone()).await?;

                tracing::info!(
                    "Generated {} ledger entries for trade {}",
                    entries.len(),
                    trade.id
                );

                // 3. Process wallet updates
                for entry in entries {
                    ctx.process_wallet_entry(entry).await?;
                }

                // 4. Update order statuses
                ctx.update_order_status(&trade.buy_order_id.to_string(), trade_qty)
                    .await?;
                ctx.update_order_status(&trade.sell_order_id.to_string(), trade_qty)
                    .await?;

                // 5. Create and persist fills
                let quote_asset_id_str = instrument.quote_asset_id.to_string();
                let buy_fill = this.fill_service.create_fill_from_trade(
                    &trade,
                    trade.buy_order_id,
                    "buy",
                    "taker",
                    trade_qty,
                    buy_fee,
                    &quote_asset_id_str,
                )?;
                let sell_fill = this.fill_service.create_fill_from_trade(
                    &trade,
                    trade.sell_order_id,
                    "sell",
                    "maker",
                    trade_qty,
                    sell_fee,
                    &quote_asset_id_str,
                )?;

                ctx.save_fill(buy_fill).await?;
                ctx.save_fill(sell_fill).await?;

                Ok(())
            })
        })
        .await
    }

    /// Executes a closure within a database transaction scope.
    ///
    /// This method abstracts away the complexity of transaction management (begin, commit, rollback).
    /// If a transaction manager is present, it starts a transaction, runs the closure, and:
    /// - Commits if the closure returns `Ok`.
    /// - Rolls back if the closure returns `Err`.
    ///
    /// If no transaction manager is configured (e.g., in unit tests or certain deployment modes),
    /// it simply runs the closure without a transaction.
    ///
    /// # Advanced Types Explanation
    ///
    /// The function signature uses Higher-Ranked Trait Bounds (HRTB) `for<'a>` to express that the closure `F`
    /// must be valid for *any* lifetime `'a` of the `SettlementContext`. This is necessary because the context
    /// is created inside `execute_atomic` and passed to the closure by reference.
    ///
    /// The return type `Pin<Box<dyn Future<...>>>` is required to type-erase the future returned by the closure.
    /// Since the future borrows from the temporary `SettlementContext`, its type depends on the lifetime of that
    /// context, which cannot be named in a generic parameter without HRTB. Boxing and pinning allow us to
    /// return a concrete type that implements `Future`.
    async fn execute_atomic<T, F>(&self, f: F) -> Result<T>
    where
        T: Send,
        F: for<'a> FnOnce(
                &'a mut SettlementContext<'_>,
            ) -> Pin<Box<dyn Future<Output = Result<T>> + Send + 'a>>
            + Send,
    {
        if let Some(manager) = &self.tx_manager {
            let mut tx = manager.begin().await?;
            let mut ctx = SettlementContext {
                tx: Some(tx.as_repository_transaction()),
                service: self,
            };

            match f(&mut ctx).await {
                Ok(result) => {
                    tx.commit().await?;
                    Ok(result)
                }
                Err(e) => {
                    let _ = tx.rollback().await;
                    Err(e)
                }
            }
        } else {
            let mut ctx = SettlementContext {
                tx: None,
                service: self,
            };
            f(&mut ctx).await
        }
    }
}

// Settlement Context helps manage transaction scope and provides helper methods for common operations during settlement processing.
// It abstracts away the details of whether a transaction is being used or not, allowing the core business logic to remain clean and focused on the domain operations.
// This pattern also makes it easier to add additional operations in the future (e.g., logging, metrics) without cluttering the main settlement logic.
struct SettlementContext<'a> {
    tx: Option<&'a mut dyn RepositoryTransaction>,
    service: &'a SettlementService,
}

impl<'a> SettlementContext<'a> {
    async fn save_ledger_event(&mut self, event: LedgerEvent) -> Result<LedgerEvent> {
        match &mut self.tx {
            Some(tx) => {
                self.service
                    .ledger_repo
                    .save_event_with_tx(&mut **tx, event)
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
                    .save_entries_with_tx(&mut **tx, entries)
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
                    .process_ledger_entry_with_tx(&mut **tx, entry)
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
                    .update_status_with_tx(&mut **tx, order_id, trade_qty)
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
                    .save_fill_with_tx(&mut **tx, fill)
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
                    .create_with_tx(&mut **tx, trade)
                    .await
            }
            None => self.service.trade_repo.create(trade).await,
        }
    }
}
