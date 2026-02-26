use crate::domain::transaction::{
    RepositoryTransaction, Transaction as TransactionTrait, TransactionManager,
};
use crate::error::Result;
use async_trait::async_trait;
use sqlx::pool::PoolConnection;
use sqlx::{Executor, PgPool, Postgres};
use std::any::Any;

pub struct PostgresTransaction {
    pub conn: PoolConnection<Postgres>,
}

impl RepositoryTransaction for PostgresTransaction {
    fn as_any(&mut self) -> &mut dyn Any {
        self
    }
}

#[async_trait]
impl TransactionTrait for PostgresTransaction {
    async fn commit(mut self: Box<Self>) -> Result<()> {
        self.conn
            .execute("COMMIT")
            .await
            .map_err(crate::error::AppError::DatabaseError)?;
        Ok(())
    }

    async fn rollback(mut self: Box<Self>) -> Result<()> {
        self.conn
            .execute("ROLLBACK")
            .await
            .map_err(crate::error::AppError::DatabaseError)?;
        Ok(())
    }

    fn as_repository_transaction(&mut self) -> &mut dyn RepositoryTransaction {
        self
    }
}

pub struct PostgresTransactionManager {
    pool: PgPool,
}

impl PostgresTransactionManager {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl TransactionManager for PostgresTransactionManager {
    async fn begin(&self) -> Result<Box<dyn TransactionTrait>> {
        let mut conn = self
            .pool
            .acquire()
            .await
            .map_err(crate::error::AppError::DatabaseError)?;

        conn.execute("BEGIN")
            .await
            .map_err(crate::error::AppError::DatabaseError)?;

        Ok(Box::new(PostgresTransaction { conn }))
    }
}

pub struct InMemoryTransaction;

impl RepositoryTransaction for InMemoryTransaction {
    fn as_any(&mut self) -> &mut dyn Any {
        self
    }
}

#[async_trait]
impl TransactionTrait for InMemoryTransaction {
    async fn commit(self: Box<Self>) -> Result<()> {
        Ok(())
    }

    async fn rollback(self: Box<Self>) -> Result<()> {
        Ok(())
    }

    fn as_repository_transaction(&mut self) -> &mut dyn RepositoryTransaction {
        self
    }
}

#[derive(Clone, Default)]
pub struct InMemoryTransactionManager;

#[async_trait]
impl TransactionManager for InMemoryTransactionManager {
    async fn begin(&self) -> Result<Box<dyn TransactionTrait>> {
        Ok(Box::new(InMemoryTransaction))
    }
}
