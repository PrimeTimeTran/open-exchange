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
/// ## Unsafe Inner Pointer
/// The `get_inner_ptr()` method is a necessary workaround to allow downcasting `&mut dyn RepositoryTransaction` back to a concrete
/// `sqlx::Transaction` within Postgres repositories. This bypasses lifetime limitations of Rust's `Any` trait for mutable references.
/// It is safe as long as the `TransactionManager` and Repositories are wired correctly (e.g., Postgres Manager with Postgres Repos).

use async_trait::async_trait;
use std::any::Any;
use crate::error::Result;

pub trait RepositoryTransaction: Send {
    fn as_any(&mut self) -> &mut dyn Any;
    /// Unsafe because strict type checking is bypassed.
    /// Implementations must return a raw pointer to the underlying transaction object.
    /// Callers must know what type to cast it back to.
    unsafe fn get_inner_ptr(&mut self) -> *mut ();
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
