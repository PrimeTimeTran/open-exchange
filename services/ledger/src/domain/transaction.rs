/// # Transaction Abstraction
///
/// This module defines traits for abstracting over database transactions.
///
/// ## Purpose
/// 1. **Decouple Domain from Infrastructure**: Domain services (e.g., `OrderService`) can control transaction boundaries (Unit of Work)
///    without depending directly on `sqlx` or specific database technologies.
/// 2. **Testability**: Enables the use of `InMemoryTransactionManager` for fast unit tests without requiring a real database connection.
///
/// ## Key Components
/// - **`TransactionManager`**: Factory trait for starting new transactions. Services hold this instead of a `PgPool`.
/// - **`RepositoryTransaction`**: Trait object representing an active transaction. Passed to repositories.
/// - **`Transaction`**: Extension of `RepositoryTransaction` that adds `commit()` and `rollback()` control for the Service layer.
///
/// ## Downcasting
/// `as_any()` is provided to allow repositories to safely downcast the transaction object to their concrete implementation (e.g., `PostgresTransaction`) at runtime.
use crate::error::Result;
use async_trait::async_trait;
use std::any::Any;

pub trait RepositoryTransaction: Send {
    fn as_any(&mut self) -> &mut dyn Any;
}

#[async_trait]
pub trait TransactionManager: Send + Sync {
    async fn begin(&self) -> Result<Box<dyn Transaction>>;
}

#[async_trait]
pub trait Transaction: RepositoryTransaction {
    async fn commit(self: Box<Self>) -> Result<()>;
    async fn rollback(self: Box<Self>) -> Result<()>;
    fn as_repository_transaction(&mut self) -> &mut dyn RepositoryTransaction;
}
