use sqlx::postgres::PgPoolOptions;
use sqlx::{PgPool, Executor};
use std::env;
use uuid::Uuid;
use std::sync::Arc;
use rust_decimal::Decimal;
use std::str::FromStr;
use rust_decimal::MathematicalOps;

use ledger::domain::orders::service::OrderService;
use ledger::domain::wallets::WalletService;
use ledger::domain::assets::AssetService;
use ledger::domain::ledger::service::LedgerService;
use ledger::domain::settlement::service::SettlementService;
use ledger::domain::fees::service::StandardFeeService;
use ledger::domain::fills::service::FillService;
use ledger::infra::repositories::{
    PostgresOrderRepository, PostgresWalletRepository, PostgresAssetRepository, PostgresInstrumentRepository,
    PostgresLedgerRepository, PostgresTradeRepository, PostgresFillRepository, PostgresAccountRepository
};
use ledger::domain::accounts::repository::AccountRepository;
use ledger::domain::accounts::Account;

pub struct IntegrationTestContext {
    pub pool: PgPool,
    pub tenant_id: String,
    pub order_service: Arc<OrderService>,
    pub wallet_service: Arc<WalletService>,
    #[allow(dead_code)]
    pub asset_service: Arc<AssetService>,
    pub settlement_service: Arc<SettlementService>,
    pub account_repo: Arc<PostgresAccountRepository>,
}

impl IntegrationTestContext {
    pub async fn new() -> Self {
        let pool = get_test_pool().await;
        clean_db(&pool).await;
        let tenant_id = create_tenant(&pool).await.to_string();
        
        let (order_service, wallet_service, asset_service, settlement_service, account_repo) = setup_services(&pool, &tenant_id).await;

        Self {
            pool,
            tenant_id,
            order_service,
            wallet_service,
            asset_service,
            settlement_service,
            account_repo,
        }
    }

    pub async fn create_user(&self) -> String {
        create_dummy_user(&self.pool, &self.tenant_id).await
    }

    pub async fn create_account(&self, user_id: &str) -> String {
        let membership_id = create_dummy_membership(&self.pool, &self.tenant_id, user_id).await;
        create_dummy_account(&self.pool, &self.tenant_id, &membership_id).await
    }

    pub async fn create_asset(&self, symbol: &str, decimals: i32) -> String {
        create_dummy_asset(&self.pool, &self.tenant_id, symbol, decimals).await
    }
    
    pub async fn create_instrument(&self, symbol: &str, base_id: &str, quote_id: &str) -> String {
         let id = Uuid::new_v4();
         sqlx::query(r#"INSERT INTO "Instrument" (id, "tenantId", symbol, type, status, "underlyingAssetId", "quoteAssetId", meta, "createdAt", "updatedAt") VALUES ($1, $2, $3, 'spot', 'active', $4, $5, '{}', NOW(), NOW())"#)
            .bind(id)
            .bind(Uuid::parse_str(&self.tenant_id).unwrap())
            .bind(symbol)
            .bind(Uuid::parse_str(base_id).unwrap())
            .bind(Uuid::parse_str(quote_id).unwrap())
            .execute(&self.pool).await.expect("Create Instrument");
         id.to_string()
    }
}

pub async fn get_test_pool() -> PgPool {
    let url = env::var("DATABASE_URL_TEST")
        .unwrap_or_else(|_| "postgres://postgres@localhost:5432/open-exchange-test".to_string());
    
    PgPoolOptions::new()
        .after_connect(|conn, _meta| Box::pin(async move {
            conn.execute("SELECT set_config('app.current_user_id', '', false)").await?;
            conn.execute("SELECT set_config('app.current_tenant_id', '', false)").await?;
            conn.execute("SELECT set_config('app.current_membership_id', '', false)").await?;
            conn.execute("SELECT set_config('app.bypass_rls', 'on', false)").await?;
            Ok(())
        }))
        .connect(&url)
        .await
        .expect("Failed to connect to test database")
}

pub async fn clean_db(pool: &PgPool) {
    let tables = vec![
        "\"Order\"", "\"Trade\"", "\"Fill\"", "\"LedgerEntry\"", "\"LedgerEvent\"", 
        "\"Wallet\"", "\"Account\"", "\"Membership\"", "\"User\"", "\"Asset\"", "\"Instrument\"", "\"Tenant\""
    ];
    let query = format!("TRUNCATE TABLE {} RESTART IDENTITY CASCADE;", tables.join(", "));
    sqlx::query(&query).execute(pool).await.expect("Failed to clean database");
}

async fn create_tenant(pool: &PgPool) -> Uuid {
    let id = Uuid::new_v4();
    sqlx::query(r#"INSERT INTO "Tenant" (id, name, "createdAt", "updatedAt") VALUES ($1, 'Test Tenant', NOW(), NOW())"#)
        .bind(id).execute(pool).await.expect("Create Tenant");
    id
}

async fn create_dummy_user(pool: &PgPool, _tenant_id: &str) -> String {
    let id = Uuid::new_v4();
    sqlx::query(r#"INSERT INTO "User" (id, email, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())"#)
        .bind(id).bind(format!("user-{}@test.com", id)).execute(pool).await.expect("Create User");
    id.to_string()
}

async fn create_dummy_membership(pool: &PgPool, tenant_id: &str, user_id: &str) -> String {
    let id = Uuid::new_v4();
    sqlx::query(r#"INSERT INTO "Membership" (id, "tenantId", "userId", status, "createdAt", "updatedAt") VALUES ($1, $2, $3, 'active', NOW(), NOW())"#)
        .bind(id).bind(Uuid::parse_str(tenant_id).unwrap()).bind(Uuid::parse_str(user_id).unwrap()).execute(pool).await.expect("Create Membership");
    id.to_string()
}

async fn create_dummy_account(pool: &PgPool, tenant_id: &str, membership_id: &str) -> String {
    let id = Uuid::new_v4();
    sqlx::query(r#"INSERT INTO "Account" (id, "tenantId", "userId", name, type, status, meta, "createdAt", "updatedAt") VALUES ($1, $2, $3, 'Test Acc', 'cash', 'active', '{}', NOW(), NOW())"#)
        .bind(id).bind(Uuid::parse_str(tenant_id).unwrap()).bind(Uuid::parse_str(membership_id).unwrap()).execute(pool).await.expect("Create Account");
    id.to_string()
}

async fn create_dummy_asset(pool: &PgPool, tenant_id: &str, symbol: &str, decimals: i32) -> String {
    let id = Uuid::new_v4();
    sqlx::query(r#"INSERT INTO "Asset" (id, "tenantId", symbol, klass, precision, "isFractional", decimals, meta, "createdAt", "updatedAt") VALUES ($1, $2, $3, 'crypto', $4, true, $4, '{}', NOW(), NOW())"#)
        .bind(id).bind(Uuid::parse_str(tenant_id).unwrap()).bind(symbol).bind(decimals).execute(pool).await.expect("Create Asset");
    id.to_string()
}

async fn setup_services(pool: &sqlx::PgPool, tenant_id: &str) -> (
    Arc<OrderService>, 
    Arc<WalletService>, 
    Arc<AssetService>,
    Arc<SettlementService>,
    Arc<PostgresAccountRepository>
) {
    let order_repo = Arc::new(PostgresOrderRepository::new(pool.clone()));
    let wallet_repo = Arc::new(PostgresWalletRepository::new(pool.clone()));
    let asset_repo = Arc::new(PostgresAssetRepository::new(pool.clone()));
    let instrument_repo = Arc::new(PostgresInstrumentRepository::new(pool.clone()));
    let ledger_repo = Arc::new(PostgresLedgerRepository::new(pool.clone()));
    let trade_repo = Arc::new(PostgresTradeRepository::new(pool.clone()));
    let fill_repo = Arc::new(PostgresFillRepository::new(pool.clone()));
    let account_repo = Arc::new(PostgresAccountRepository::new(pool.clone()));

    let wallet_service = Arc::new(WalletService::new(wallet_repo.clone()));
    let asset_service = Arc::new(AssetService::new(asset_repo.clone(), instrument_repo.clone()));
    let order_service = Arc::new(OrderService::new(order_repo.clone(), wallet_service.clone(), asset_service.clone(), Some(pool.clone())));
    
    let ledger_service = Arc::new(LedgerService::new(
        order_repo.clone(), 
        instrument_repo.clone(), 
        asset_repo.clone(),
        account_repo.clone()
    ));

    let fill_service = Arc::new(FillService::new(fill_repo.clone()));
    let fee_service = Arc::new(StandardFeeService::new());

    let settlement_service = Arc::new(SettlementService::new(
        Some(pool.clone()),
        order_service.clone(),
        instrument_repo.clone(),
        ledger_service.clone(),
        wallet_service.clone(),
        fill_service.clone(),
        fee_service.clone(),
        ledger_repo.clone(),
        trade_repo.clone(),
    ));

    if account_repo.get_by_name("fees_account").await.unwrap().is_none() {
        let sys_user_id = create_dummy_user(pool, tenant_id).await;
        let sys_mem_id = create_dummy_membership(pool, tenant_id, &sys_user_id).await;
        
        account_repo.create(Account {
            id: Uuid::new_v4(),
            name: "fees_account".into(),
            tenant_id: tenant_id.to_string(), 
            user_id: sys_mem_id, 
            ..Default::default()
        }).await.ok();
    }

    (order_service, wallet_service, asset_service, settlement_service, account_repo)
}

#[allow(dead_code)]
pub fn atomic(amount: &str, decimals: u32) -> String {
    let d = Decimal::from_str(amount).unwrap();
    let scale = Decimal::from(10).powi(decimals as i64);
    (d * scale).trunc().to_string()
}
