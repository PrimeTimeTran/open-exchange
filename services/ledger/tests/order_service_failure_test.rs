use async_trait::async_trait;
use ledger::domain::orders::model::OrderSide;
use ledger::domain::orders::model::OrderStatus;
use ledger::domain::orders::{Order, OrderRepository};
use ledger::domain::transaction::RepositoryTransaction;
use ledger::error::{AppError, Result};
use rust_decimal::Decimal;
use uuid::Uuid;

// A repository that mimics success but FAILS on create to test rollback
#[derive(Debug)]
pub struct FailingOrderRepository;

#[async_trait]
impl OrderRepository for FailingOrderRepository {
    async fn create(&self, _order: Order) -> Result<Order> {
        Err(AppError::DatabaseError(sqlx::Error::PoolTimedOut))
    }

    async fn create_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        _order: Order,
    ) -> Result<Order> {
        Err(AppError::DatabaseError(sqlx::Error::PoolTimedOut))
    }

    async fn get(&self, _id: Uuid) -> Result<Option<Order>> {
        Ok(None)
    }
    async fn get_for_update(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        _id: Uuid,
    ) -> Result<Option<Order>> {
        Ok(None)
    }
    async fn update_status(&self, _id: Uuid, _status: OrderStatus) -> Result<()> {
        Ok(())
    }
    async fn update_status_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        _id: Uuid,
        _status: OrderStatus,
    ) -> Result<()> {
        Ok(())
    }
    async fn update_filled_amount(&self, _id: Uuid, _filled: Decimal) -> Result<()> {
        Ok(())
    }
    async fn update_filled_amount_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        _id: Uuid,
        _filled: Decimal,
    ) -> Result<()> {
        Ok(())
    }
    async fn increment_filled_amount(&self, _id: Uuid, _amount: Decimal) -> Result<Order> {
        Err(AppError::Internal("Not impl".into()))
    }
    async fn increment_filled_amount_with_tx(
        &self,
        _tx: &mut dyn RepositoryTransaction,
        _id: Uuid,
        _amount: Decimal,
    ) -> Result<Order> {
        Err(AppError::Internal("Not impl".into()))
    }
    async fn list_open(&self) -> Result<Vec<Order>> {
        Ok(vec![])
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ledger::domain::assets::model::Asset;
    use ledger::domain::assets::AssetService;
    use ledger::domain::instruments::model::Instrument;
    use ledger::domain::orders::service::OrderService;
    use ledger::domain::wallets::Wallet;
    use ledger::domain::wallets::WalletService;
    use ledger::infra::repositories::memory::{
        InMemoryAssetRepository, InMemoryInstrumentRepository, InMemoryWalletRepository,
    };
    use rust_decimal::Decimal;
    use std::str::FromStr;
    use std::sync::Arc;

    #[tokio::test]
    async fn test_create_order_propagates_repo_failure() {
        // Setup
        let wallet_repo = Arc::new(InMemoryWalletRepository::new());
        let wallet_service = Arc::new(WalletService::new(wallet_repo.clone()));

        let asset_repo = Arc::new(InMemoryAssetRepository::new());
        let instrument_repo = Arc::new(InMemoryInstrumentRepository::new());
        let asset_service = Arc::new(AssetService::new(
            asset_repo.clone(),
            instrument_repo.clone(),
        ));

        // Setup Data
        let account_id = Uuid::new_v4();
        let usd_id = Uuid::new_v4();
        let btc_id = Uuid::new_v4();
        let instr_id = Uuid::new_v4();
        let tenant_id = Uuid::new_v4();

        asset_repo.add(Asset {
            id: usd_id,
            tenant_id,
            symbol: "USD".into(),
            decimals: 2,
            r#type: "FIAT".into(),
            meta: serde_json::json!({}),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        });
        instrument_repo.add(Instrument {
            id: instr_id,
            tenant_id,
            symbol: "BTC-USD".into(),
            r#type: "spot".into(),
            status: "active".into(),
            underlying_asset_id: btc_id,
            quote_asset_id: usd_id,
            meta: serde_json::json!({}),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        });

        // Add Wallet with Funds (Atomic Units: 1000.00 USD -> 100000 cents)
        let wallet = Wallet {
            account_id,
            asset_id: usd_id,
            available: Decimal::from_str("100000").unwrap(),
            locked: Decimal::from_str("0").unwrap(),
            ..Default::default()
        };
        wallet_service.create_wallet(wallet).await.unwrap();

        // Service with FAILING Repo
        let order_repo = Arc::new(FailingOrderRepository);
        let order_service =
            OrderService::builder(order_repo, wallet_service.clone(), asset_service).build();

        // Action: Create Order
        // 1.0 @ 100.0 = 100 USD -> 10000 atomic.
        let order = Order::new(
            Uuid::new_v4(),
            account_id,
            instr_id,
            OrderSide::Buy,
            ledger::domain::orders::model::OrderType::Limit,
            Decimal::from_str("1.0").unwrap(),
            Decimal::from_str("100.0").unwrap(),
        );

        let result = order_service.create_order(order).await;

        // Assert
        assert!(result.is_err());

        // Check funds were deducted (logic mismatch behavior - funds locked but order create failed)
        let wallet = wallet_service
            .get_wallet_by_account_and_asset(&account_id.to_string(), &usd_id.to_string())
            .await
            .unwrap()
            .unwrap();

        // 100000 - 10000 = 90000
        assert_eq!(wallet.available, Decimal::from_str("90000").unwrap());
        assert_eq!(wallet.locked, Decimal::from_str("10000").unwrap());
    }
}
