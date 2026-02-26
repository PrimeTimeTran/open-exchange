use crate::domain::ledger::model::{LedgerEntry, LedgerEvent};
use crate::domain::ledger::repository::LedgerRepository;
use crate::domain::trade::model::Trade;
use crate::domain::transaction::RepositoryTransaction;
use crate::error::Result;
use crate::infra::transaction::PostgresTransaction;
use async_trait::async_trait;
use sqlx::{PgPool, Postgres, QueryBuilder};

#[derive(Debug, Clone)]
pub struct PostgresLedgerRepository {
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
        sqlx
            ::query(
                r#"
            INSERT INTO "LedgerEvent" (
                id, "tenantId", type, "referenceId", "referenceType", status, description, meta, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            "#
            )
            .bind(event.id)
            .bind(event.tenant_id)
            .bind(&event.r#type)
            .bind(event.reference_id)
            .bind(&event.reference_type)
            .bind(&event.status)
            .bind(&event.description)
            .bind(&event.meta)
            .bind(event.created_at)
            .bind(event.updated_at)
            .execute(&self.pool).await
            .map_err(crate::error::AppError::DatabaseError)?;

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

        sqlx
            ::query(
                r#"
            INSERT INTO "LedgerEvent" (
                id, "tenantId", type, "referenceId", "referenceType", status, description, meta, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            "#
            )
            .bind(event.id)
            .bind(event.tenant_id)
            .bind(&event.r#type)
            .bind(event.reference_id)
            .bind(&event.reference_type)
            .bind(&event.status)
            .bind(&event.description)
            .bind(&event.meta)
            .bind(event.created_at)
            .bind(event.updated_at)
            .execute(&mut **tx).await
            .map_err(crate::error::AppError::DatabaseError)?;

        Ok(event)
    }

    async fn save_entries(&self, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>> {
        if entries.is_empty() {
            return Ok(entries);
        }

        let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(
            "INSERT INTO \"LedgerEntry\" (id, \"tenantId\", \"eventId\", \"accountId\", amount, meta, \"createdAt\", \"updatedAt\") "
        );

        query_builder.push_values(&entries, |mut b, entry| {
            b.push_bind(entry.id)
                .push_bind(entry.tenant_id)
                .push_bind(entry.event_id)
                .push_bind(entry.account_id)
                .push_bind(entry.amount)
                .push_bind(&entry.meta)
                .push_bind(entry.created_at)
                .push_bind(entry.updated_at);
        });

        let query = query_builder.build();
        query
            .execute(&self.pool)
            .await
            .map_err(crate::error::AppError::DatabaseError)?;

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

        let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(
            "INSERT INTO \"LedgerEntry\" (id, \"tenantId\", \"eventId\", \"accountId\", amount, meta, \"createdAt\", \"updatedAt\") "
        );

        query_builder.push_values(&entries, |mut b, entry| {
            b.push_bind(entry.id)
                .push_bind(entry.tenant_id)
                .push_bind(entry.event_id)
                .push_bind(entry.account_id)
                .push_bind(entry.amount)
                .push_bind(&entry.meta)
                .push_bind(entry.created_at)
                .push_bind(entry.updated_at);
        });

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
