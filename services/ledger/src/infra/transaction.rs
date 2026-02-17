use std::any::Any;
use async_trait::async_trait;
use sqlx::{Transaction, Postgres, PgPool};
use crate::error::Result;
use crate::domain::transaction::{Transaction as TransactionTrait, TransactionManager, RepositoryTransaction};

pub struct PostgresTransaction<'c> {
    pub tx: Transaction<'c, Postgres>,
}

impl<'c> RepositoryTransaction for PostgresTransaction<'c> {
    fn as_any(&mut self) -> &mut dyn Any {
        panic!("as_any not supported for PostgresTransaction with non-static lifetime");
    }

    unsafe fn get_inner_ptr(&mut self) -> *mut () {
        &mut self.tx as *mut Transaction<'c, Postgres> as *mut ()
    }
}

#[async_trait]
impl<'c> TransactionTrait for PostgresTransaction<'c> {
    async fn commit(self: Box<Self>) -> Result<()> {
        self.tx.commit().await.map_err(crate::error::AppError::DatabaseError)
    }

    async fn rollback(self: Box<Self>) -> Result<()> {
        self.tx.rollback().await.map_err(crate::error::AppError::DatabaseError)
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
        let tx = self.pool.begin().await.map_err(crate::error::AppError::DatabaseError)?;
        Ok(Box::new(PostgresTransaction { tx }))
    }
}

pub struct InMemoryTransaction;

impl RepositoryTransaction for InMemoryTransaction {
    fn as_any(&mut self) -> &mut dyn Any {
        self
    }

    unsafe fn get_inner_ptr(&mut self) -> *mut () {
        std::ptr::null_mut()
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
