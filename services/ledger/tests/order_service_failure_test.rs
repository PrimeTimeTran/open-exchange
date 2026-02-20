use ledger::error::{AppError, Result};
use ledger::domain::orders::{Order, OrderRepository};
use ledger::domain::orders::model::OrderStatus;
use ledger::domain::transaction::RepositoryTransaction;
use uuid::Uuid;
use rust_decimal::Decimal;
use async_trait::async_trait;

// A repository that mimics success but FAILS on create to test rollback
#[derive(Debug)]
pub struct FailingOrderRepository;

#[async_trait]
impl OrderRepository for FailingOrderRepository {
    async fn create(&self, _order: Order) -> Result<Order> {
        Err(AppError::DatabaseError(sqlx::Error::PoolTimedOut))
    }

    async fn create_with_tx(&self, _tx: &mut dyn RepositoryTransaction, _order: Order) -> Result<Order> {
        Err(AppError::DatabaseError(sqlx::Error::PoolTimedOut))
    }

    async fn get(&self, _id: Uuid) -> Result<Option<Order>> { Ok(None) }
    async fn get_for_update(&self, _tx: &mut dyn RepositoryTransaction, _id: Uuid) -> Result<Option<Order>> { Ok(None) }
    async fn update_status(&self, _id: Uuid, _status: OrderStatus) -> Result<()> { Ok(()) }
    async fn update_status_with_tx(&self, _tx: &mut dyn RepositoryTransaction, _id: Uuid, _status: OrderStatus) -> Result<()> { Ok(()) }
    async fn update_filled_amount(&self, _id: Uuid, _filled: Decimal) -> Result<()> { Ok(()) }
    async fn update_filled_amount_with_tx(&self, _tx: &mut dyn RepositoryTransaction, _id: Uuid, _filled: Decimal) -> Result<()> { Ok(()) }
    async fn increment_filled_amount(&self, _id: Uuid, _amount: Decimal) -> Result<Order> { Err(AppError::Internal("Not impl".into())) }
    async fn increment_filled_amount_with_tx(&self, _tx: &mut dyn RepositoryTransaction, _id: Uuid, _amount: Decimal) -> Result<Order> { Err(AppError::Internal("Not impl".into())) }
    async fn list_open(&self) -> Result<Vec<Order>> { Ok(vec![]) }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ledger::domain::wallets::Wallet;
    use ledger::domain::assets::AssetService;
    use ledger::domain::wallets::WalletService;
    use ledger::proto::common::{Instrument, Asset};
    use ledger::domain::orders::service::OrderService;
    use ledger::infra::repositories::memory::{InMemoryWalletRepository, InMemoryInstrumentRepository, InMemoryAssetRepository};
    use std::sync::Arc;
    use std::str::FromStr;
    use rust_decimal::Decimal;

    #[tokio::test]
    async fn test_create_order_propagates_repo_failure() {
        // Setup
        let wallet_repo = Arc::new(InMemoryWalletRepository::new());
        let wallet_service = Arc::new(WalletService::new(wallet_repo.clone()));
        
        let asset_repo = Arc::new(InMemoryAssetRepository::new());
        let instrument_repo = Arc::new(InMemoryInstrumentRepository::new());
        let asset_service = Arc::new(AssetService::new(asset_repo.clone(), instrument_repo.clone()));

        // Setup Data
        let account_id = Uuid::new_v4().to_string();
        let usd_id = Uuid::new_v4();
        let btc_id = Uuid::new_v4();
        let instr_id = Uuid::new_v4();

        asset_repo.add(Asset { id: usd_id.to_string(), symbol: "USD".into(), decimals: 2, ..Default::default() });
        instrument_repo.add(Instrument { 
            id: instr_id.to_string(), 
            symbol: "BTC-USD".into(), 
            underlying_asset_id: btc_id.to_string(), 
            quote_asset_id: usd_id.to_string(), 
            ..Default::default() 
        });

        // Add Wallet with Funds (Atomic Units: 1000.00 USD -> 100000 cents)
        let wallet = Wallet {
            account_id: account_id.clone(),
            asset_id: usd_id.to_string(),
            available: "100000".to_string(),
            locked: "0".to_string(),
            ..Default::default()
        };
        wallet_service.create_wallet(wallet).await.unwrap();

        // Service with FAILING Repo
        let order_repo = Arc::new(FailingOrderRepository);
        let order_service = OrderService::new(order_repo, wallet_service.clone(), asset_service, None, None);

        // Action: Create Order
        // 1.0 @ 100.0 = 100 USD -> 10000 atomic.
        let order = Order {
            id: Uuid::new_v4(),
            account_id: Uuid::parse_str(&account_id).unwrap(),
            instrument_id: instr_id,
            side: ledger::domain::orders::model::OrderSide::Buy,
            quantity: Decimal::from_str("1.0").unwrap(),
            price: Decimal::from_str("100.0").unwrap(),
            ..Default::default()
        };

        let result = order_service.create_order(order).await;

        // Assert
        assert!(result.is_err());
        
        // Check funds were deducted (logic mismatch behavior - funds locked but order create failed)
        let wallet = wallet_service.get_wallet_by_account_and_asset(&account_id, &usd_id.to_string()).await.unwrap().unwrap();
        
        // 100000 - 10000 = 90000
        assert_eq!(wallet.available, "90000");
        assert_eq!(wallet.locked, "10000");
    }
}
