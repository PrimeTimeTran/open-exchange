use crate::domain::ledger::repository::LedgerRepository;
use crate::domain::transaction::RepositoryTransaction;
use crate::error::Result;
use crate::infra::transaction::PostgresTransaction;
use crate::proto::common::{LedgerEntry, LedgerEvent, Trade};
use async_trait::async_trait;
use chrono::TimeZone;
use chrono::Utc;
use rust_decimal::Decimal;
use sqlx::{PgPool, Postgres, QueryBuilder};
use std::str::FromStr;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct PostgresLedgerRepository {
    #[allow(dead_code)]
    pool: PgPool,
}

impl PostgresLedgerRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl LedgerRepository for PostgresLedgerRepository {
    async fn save_event(&self, event: LedgerEvent) -> Result<LedgerEvent> {
        // TODO: Implement actual DB persistence
        tracing::info!(?event, "PERSIST: Ledger Event created");
        Ok(event)
    }

    async fn save_event_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        event: LedgerEvent,
    ) -> Result<LedgerEvent> {
        let tx = tx
            .as_any()
            .downcast_mut::<PostgresTransaction>()
            .ok_or_else(|| {
                crate::error::AppError::Internal("Transaction is not a PostgresTransaction".into())
            })?;
        let tx = &mut tx.conn;

        let created_at = Utc
            .timestamp_millis_opt(event.created_at)
            .single()
            .ok_or_else(|| {
                crate::error::AppError::ValidationError("Invalid created_at timestamp".to_string())
            })?;

        let updated_at = Utc
            .timestamp_millis_opt(event.updated_at)
            .single()
            .ok_or_else(|| {
                crate::error::AppError::ValidationError("Invalid updated_at timestamp".to_string())
            })?;

        sqlx
            ::query(
                r#"
            INSERT INTO "LedgerEvent" (
                id, "tenantId", type, "referenceId", "referenceType", status, description, meta, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
            "#
            )
            .bind(
                Uuid::parse_str(&event.id).map_err(|_| {
                    crate::error::AppError::ValidationError("Invalid event ID".to_string())
                })?
            )
            .bind(
                Uuid::parse_str(&event.tenant_id).map_err(|_| {
                    crate::error::AppError::ValidationError("Invalid tenant ID".to_string())
                })?
            )
            .bind(event.r#type.clone())
            .bind(event.reference_id.clone())
            .bind(event.reference_type.clone())
            .bind(event.status.clone())
            .bind(event.description.clone())
            .bind(
                serde_json
                    ::from_str::<serde_json::Value>(&event.meta)
                    .unwrap_or(serde_json::json!({}))
            )
            .bind(created_at)
            .bind(updated_at)
            .execute(&mut **tx).await
            .map_err(crate::error::AppError::DatabaseError)?;

        Ok(event)
    }

    async fn save_entries(&self, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>> {
        // TODO: Implement actual DB persistence
        tracing::info!(count = entries.len(), "PERSIST: Ledger Entries created");
        Ok(entries)
    }

    async fn save_entries_with_tx(
        &self,
        tx: &mut dyn RepositoryTransaction,
        entries: Vec<LedgerEntry>,
    ) -> Result<Vec<LedgerEntry>> {
        let tx = tx
            .as_any()
            .downcast_mut::<PostgresTransaction>()
            .ok_or_else(|| {
                crate::error::AppError::Internal("Transaction is not a PostgresTransaction".into())
            })?;
        let tx = &mut tx.conn;
        if entries.is_empty() {
            return Ok(entries);
        }

        // Pre-validate and parse all entries to avoid unwrap() inside query builder
        let mut parsed_entries = Vec::with_capacity(entries.len());
        for entry in &entries {
            let created_at = Utc
                .timestamp_millis_opt(entry.created_at)
                .single()
                .ok_or_else(|| {
                    crate::error::AppError::ValidationError(format!(
                        "Invalid created_at for entry {}",
                        entry.id
                    ))
                })?;

            let updated_at = Utc
                .timestamp_millis_opt(entry.updated_at)
                .single()
                .ok_or_else(|| {
                    crate::error::AppError::ValidationError(format!(
                        "Invalid updated_at for entry {}",
                        entry.id
                    ))
                })?;

            let amount = Decimal::from_str(&entry.amount).map_err(|_| {
                crate::error::AppError::ValidationError(format!(
                    "Invalid amount for entry {}",
                    entry.id
                ))
            })?;

            let id = Uuid::parse_str(&entry.id).map_err(|_| {
                crate::error::AppError::ValidationError(format!(
                    "Invalid ID for entry {}",
                    entry.id
                ))
            })?;

            let tenant_id = Uuid::parse_str(&entry.tenant_id).map_err(|_| {
                crate::error::AppError::ValidationError(format!(
                    "Invalid tenant ID for entry {}",
                    entry.id
                ))
            })?;

            let event_id = Uuid::parse_str(&entry.event_id).map_err(|_| {
                crate::error::AppError::ValidationError(format!(
                    "Invalid event ID for entry {}",
                    entry.id
                ))
            })?;

            let account_id = Uuid::parse_str(&entry.account_id).map_err(|_| {
                crate::error::AppError::ValidationError(format!(
                    "Invalid account ID for entry {}",
                    entry.id
                ))
            })?;

            let meta = serde_json::from_str::<serde_json::Value>(&entry.meta)
                .unwrap_or(serde_json::json!({}));

            parsed_entries.push((
                id, tenant_id, event_id, account_id, amount, meta, created_at, updated_at,
            ));
        }

        let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(
            "INSERT INTO \"LedgerEntry\" (id, \"tenantId\", \"eventId\", \"accountId\", amount, meta, \"createdAt\", \"updatedAt\") "
        );

        query_builder.push_values(
            parsed_entries,
            |mut b, (id, tenant_id, event_id, account_id, amount, meta, created_at, updated_at)| {
                b.push_bind(id)
                    .push_bind(tenant_id)
                    .push_bind(event_id)
                    .push_bind(account_id)
                    .push_bind(amount)
                    .push_bind(meta)
                    .push_bind(created_at)
                    .push_bind(updated_at);
            },
        );

        let query = query_builder.build();
        query
            .execute(&mut **tx)
            .await
            .map_err(crate::error::AppError::DatabaseError)?;

        tracing::info!(
            count = entries.len(),
            "PERSIST (TX): Ledger Entries created (Bulk)"
        );
        Ok(entries)
    }

    async fn save_trade_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        trade: Trade,
    ) -> Result<Trade> {
        // TODO: Implement actual DB persistence
        tracing::info!(?trade, "PERSIST (TX): Trade created");
        Ok(trade)
    }

    async fn save_trade(&self, trade: Trade) -> Result<Trade> {
        // TODO: Implement actual DB persistence
        tracing::info!(?trade, "PERSIST: Trade created");
        Ok(trade)
    }

    async fn list_events(&self) -> Result<Vec<LedgerEvent>> {
        // Implement listing for tests/admin
        Ok(vec![])
    }

    async fn list_entries(&self) -> Result<Vec<LedgerEntry>> {
        // Implement listing for tests/admin
        Ok(vec![])
    }
}
