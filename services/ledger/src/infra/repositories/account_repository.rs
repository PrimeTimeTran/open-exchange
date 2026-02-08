use async_trait::async_trait;
use sqlx::{PgPool, FromRow};
use uuid::Uuid;
use crate::domain::accounts::{Account, AccountRepository};
use crate::error::{AppError, Result};
use chrono::{DateTime, Utc};

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
    tenant_id: String,
    #[sqlx(rename = "userId")]
    user_id: String,
    r#type: String,
    status: String,
    meta: serde_json::Value,
    #[sqlx(rename = "createdAt")]
    created_at: DateTime<Utc>,
    #[sqlx(rename = "updatedAt")]
    updated_at: DateTime<Utc>,
}

impl From<AccountRow> for Account {
    fn from(row: AccountRow) -> Self {
        Self {
            id: row.id,
            tenant_id: row.tenant_id,
            user_id: row.user_id,
            r#type: row.r#type,
            status: row.status,
            meta: row.meta,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[async_trait]
impl AccountRepository for PostgresAccountRepository {
    async fn create(&self, account: Account) -> Result<Account> {
        let rec: AccountRow = sqlx::query_as(
            r#"
            INSERT INTO "Account" (id, "tenantId", "userId", type, status, meta, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, "tenantId", "userId", type, status, meta, "createdAt", "updatedAt"
            "#
        )
        .bind(account.id)
        .bind(account.tenant_id)
        .bind(account.user_id)
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
            SELECT id, "tenantId", "userId", type, status, meta, "createdAt", "updatedAt"
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
        let rec: AccountRow = sqlx::query_as(
            r#"
            UPDATE "Account"
            SET "tenantId" = $2, "userId" = $3, type = $4, status = $5, meta = $6, "updatedAt" = $7
            WHERE id = $1
            RETURNING id, "tenantId", "userId", type, status, meta, "createdAt", "updatedAt"
            "#
        )
        .bind(account.id)
        .bind(account.tenant_id)
        .bind(account.user_id)
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
        let recs: Vec<AccountRow> = sqlx::query_as(
            r#"
            SELECT id, "tenantId", "userId", type, status, meta, "createdAt", "updatedAt"
            FROM "Account"
            WHERE "userId" = $1
            "#
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(recs.into_iter().map(|r| r.into()).collect())
    }
}
