use async_trait::async_trait;
use sqlx::{PgPool, Transaction, Postgres};
use uuid::Uuid;
use crate::error::Result;
use crate::domain::fills::{Fill, FillRepository};

#[derive(Debug, Clone)]
pub struct PostgresFillRepository {
    #[allow(dead_code)]
    pool: PgPool,
}

impl PostgresFillRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl FillRepository for PostgresFillRepository {
    async fn create(&self, fill: Fill) -> Result<Fill> {
        // TODO: Implement actual DB persistence
        // sqlx::query_as!(Fill, "INSERT INTO fills ...")
        println!("PERSIST: Fill created {:?}", fill);
        Ok(fill)
    }

    async fn create_with_tx(&self, _tx: &mut Transaction<'_, Postgres>, fill: Fill) -> Result<Fill> {
        // TODO: Implement actual DB persistence with transaction
        println!("PERSIST (TX): Fill created {:?}", fill);
        Ok(fill)
    }

    async fn list_by_order(&self, _order_id: Uuid) -> Result<Vec<Fill>> {
        // TODO: Implement actual DB query
        Ok(vec![])
    }
}
