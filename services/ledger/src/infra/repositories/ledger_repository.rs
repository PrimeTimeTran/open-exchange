use async_trait::async_trait;
use sqlx::{PgPool, Transaction, Postgres};
use crate::error::Result;
use crate::proto::common::{LedgerEvent, LedgerEntry, Trade};
use crate::domain::ledger::repository::LedgerRepository;
use rust_decimal::Decimal;
use std::str::FromStr;
use chrono::Utc;
use chrono::TimeZone;
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
        println!("PERSIST: Ledger Event created {:?}", event);
        Ok(event)
    }

    async fn save_event_with_tx(&self, tx: &mut Transaction<'_, Postgres>, event: LedgerEvent) -> Result<LedgerEvent> {
        let created_at = Utc.timestamp_millis_opt(event.created_at).unwrap();
        let updated_at = Utc.timestamp_millis_opt(event.updated_at).unwrap();

        sqlx::query!(
            r#"
            INSERT INTO "LedgerEvent" (
                id, "tenantId", type, "referenceId", "referenceType", status, description, meta, "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
            "#,
            Uuid::parse_str(&event.id).unwrap(),
            Uuid::parse_str(&event.tenant_id).unwrap(),
            event.r#type,
            event.reference_id,
            event.reference_type,
            event.status,
            event.description,
            serde_json::from_str::<serde_json::Value>(&event.meta).unwrap_or(serde_json::json!({})),
            created_at,
            updated_at
        )
        .execute(&mut **tx)
        .await
        .map_err(crate::error::AppError::DatabaseError)?;

        Ok(event)
    }

    async fn save_entries(&self, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>> {
        // TODO: Implement actual DB persistence
        println!("PERSIST: {} Ledger Entries created", entries.len());
        Ok(entries)
    }

    async fn save_entries_with_tx(&self, tx: &mut Transaction<'_, Postgres>, entries: Vec<LedgerEntry>) -> Result<Vec<LedgerEntry>> {
        for entry in &entries {
            let created_at = Utc.timestamp_millis_opt(entry.created_at).unwrap();
            let updated_at = Utc.timestamp_millis_opt(entry.updated_at).unwrap();
            let amount = Decimal::from_str(&entry.amount).unwrap_or_default();

            sqlx::query!(
                r#"
                INSERT INTO "LedgerEntry" (
                    id, "tenantId", "eventId", "accountId", amount, meta, "createdAt", "updatedAt"
                )
                VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
                "#,
                Uuid::parse_str(&entry.id).unwrap(),
                Uuid::parse_str(&entry.tenant_id).unwrap(),
                Uuid::parse_str(&entry.event_id).unwrap(),
                entry.account_id.to_string(),
                amount,
                serde_json::from_str::<serde_json::Value>(&entry.meta).unwrap_or(serde_json::json!({})),
                created_at,
                updated_at
            )
            .execute(&mut **tx)
            .await
            .map_err(crate::error::AppError::DatabaseError)?;
        }
        
        println!("PERSIST (TX): {} Ledger Entries created", entries.len());
        Ok(entries)
    }

    async fn save_trade_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, trade: Trade) -> Result<Trade> {
        // TODO: Implement actual DB persistence
        println!("PERSIST (TX): Trade created {:?}", trade);
        Ok(trade)
    }

    async fn save_trade(&self, trade: Trade) -> Result<Trade> {
        // TODO: Implement actual DB persistence
        println!("PERSIST: Trade created {:?}", trade);
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
