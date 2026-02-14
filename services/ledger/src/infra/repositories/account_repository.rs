use crate::error::{AppError, Result};
use crate::domain::accounts::{Account, AccountRepository};
use uuid::Uuid;
use sqlx::{PgPool, FromRow};
use chrono::{DateTime, Utc};
use async_trait::async_trait;

pub struct PostgresAccountRepository {
    pool: PgPool,
}

impl PostgresAccountRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(FromRow)]
struct AccountRow {
    id: Uuid,
    #[sqlx(rename = "tenantId")]
    tenant_id: Uuid,
    #[sqlx(rename = "userId")]
    user_id: Option<Uuid>,
    name: String,
    r#type: String,
    status: String,
    meta: Option<serde_json::Value>,
    #[sqlx(rename = "createdAt")]
    created_at: DateTime<Utc>,
    #[sqlx(rename = "updatedAt")]
    updated_at: DateTime<Utc>,
}

impl From<AccountRow> for Account {
    fn from(row: AccountRow) -> Self {
        Self {
            id: row.id,
            tenant_id: row.tenant_id.to_string(),
            user_id: row.user_id.map(|u| u.to_string()).unwrap_or_default(),
            name: row.name,
            r#type: row.r#type,
            status: row.status,
            meta: row.meta.unwrap_or(serde_json::json!({})),
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[async_trait]
impl AccountRepository for PostgresAccountRepository {
    async fn create(&self, account: Account) -> Result<Account> {
        let tenant_id = Uuid::parse_str(&account.tenant_id).unwrap_or_default();
        let user_id = Uuid::parse_str(&account.user_id).map_err(|_| AppError::ValidationError("Invalid user_id".into()))?;

        let rec: AccountRow = sqlx::query_as(
            r#"
            INSERT INTO "Account" (id, "tenantId", "userId", name, type, status, meta, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, "tenantId", "userId", name, type, status, meta, "createdAt", "updatedAt"
            "#
        )
        .bind(account.id)
        .bind(tenant_id)
        .bind(user_id)
        .bind(account.name)
        .bind(account.r#type)
        .bind(account.status)
        .bind(account.meta)
        .bind(account.created_at)
        .bind(account.updated_at)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.into())
    }

    async fn get(&self, id: Uuid) -> Result<Option<Account>> {
        let rec: Option<AccountRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "userId", name, type, status, meta, "createdAt", "updatedAt"
            FROM "Account"
            WHERE id = $1
            "#
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }

    async fn update(&self, account: Account) -> Result<Account> {
        let tenant_id = Uuid::parse_str(&account.tenant_id).unwrap_or_default();
        let user_id = Uuid::parse_str(&account.user_id).map_err(|_| AppError::ValidationError("Invalid user_id".into()))?;

        let rec: AccountRow = sqlx::query_as(
            r#"
            UPDATE "Account"
            SET "tenantId" = $2, "userId" = $3, name = $4, type = $5, status = $6, meta = $7, "updatedAt" = $8
            WHERE id = $1
            RETURNING id, "tenantId", "userId", name, type, status, meta, "createdAt", "updatedAt"
            "#
        )
        .bind(account.id)
        .bind(tenant_id)
        .bind(user_id)
        .bind(account.name)
        .bind(account.r#type)
        .bind(account.status)
        .bind(account.meta)
        .bind(chrono::Utc::now())
        .fetch_one(&self.pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => AppError::NotFound(format!("Account {} not found", account.id)),
            _ => AppError::DatabaseError(e),
        })?;

        Ok(rec.into())
    }

    async fn delete(&self, id: Uuid) -> Result<()> {
        let result = sqlx::query(
            r#"DELETE FROM "Account" WHERE id = $1"#
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(format!("Account {} not found", id)));
        }

        Ok(())
    }

    async fn list_by_user(&self, user_id: &str) -> Result<Vec<Account>> {
        log::info!("Listing accounts for user_id: {}", user_id);
        let user_uuid = Uuid::parse_str(user_id).map_err(|_| AppError::ValidationError("Invalid user_id".into()))?;

        let recs: Vec<AccountRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "userId", name, type, status, meta, "createdAt", "updatedAt"
            FROM "Account"
            WHERE "userId" = $1
            "#
        )
        .bind(user_uuid)
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(recs.into_iter().map(|r| r.into()).collect())
    }
    async fn get_by_name(&self, name: &str) -> Result<Option<Account>> {
        let rec: Option<AccountRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "userId", name, type, status, meta, "createdAt", "updatedAt"
            FROM "Account"
            WHERE name = $1
            "#
        )
        .bind(name)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(rec.map(|r| r.into()))
    }}
