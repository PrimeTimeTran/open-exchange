#![allow(dead_code)]
use crate::helpers::FundedAccount;
use rust_decimal::Decimal;
use sqlx::{
    postgres::{PgConnectOptions, PgPoolOptions},
    ConnectOptions, Executor, PgPool,
};
use std::fs;
use std::path::PathBuf;
use std::str::FromStr;
use std::sync::Arc;
use uuid::Uuid;

use ledger::domain::accounts::repository::AccountRepository;
use ledger::domain::accounts::Account;
use ledger::domain::assets::AssetService;
use ledger::domain::fees::service::StandardFeeService;
use ledger::domain::fills::service::FillService;
use ledger::domain::ledger::service::LedgerService;
use ledger::domain::orders::service::OrderService;
use ledger::domain::settlement::service::SettlementService;
use ledger::domain::transaction::TransactionManager;
use ledger::domain::wallets::WalletService;
use ledger::infra::repositories::{
    PostgresAccountRepository, PostgresAssetRepository, PostgresFillRepository,
    PostgresInstrumentRepository, PostgresLedgerRepository, PostgresOrderRepository,
    PostgresTradeRepository, PostgresWalletRepository,
};

pub struct PostgresTestContext {
    pub pool: PgPool,
    pub db_name: String,
    pub tenant_id: String,

    // Services
    pub order_service: Arc<OrderService>,
    pub wallet_service: Arc<WalletService>,
    pub asset_service: Arc<AssetService>,
    pub settlement_service: Arc<SettlementService>,
    pub tx_manager: Arc<dyn TransactionManager>,

    // Repositories
    pub account_repo: Arc<PostgresAccountRepository>,

    pub admin_conn_options: PgConnectOptions,
}

impl PostgresTestContext {
    /// Creates a new PostgresTestContext.
    /// If `isolated` is true, it creates a brand new database.
    /// If `isolated` is false, it uses the shared test database and truncates tables.
    pub async fn new(isolated: bool) -> Self {
        let (pool, db_name, admin_conn_options) = if isolated {
            Self::setup_new_db().await
        } else {
            let pool = Self::get_shared_pool().await;
            Self::clean_db(&pool).await;
            (
                pool,
                "open-exchange-test".to_string(),
                PgConnectOptions::default(),
            ) // dummy options for shared
        };

        let tenant_id = Self::create_tenant(&pool).await.to_string();
        let (
            order_service,
            wallet_service,
            asset_service,
            settlement_service,
            account_repo,
            tx_manager,
        ) = Self::setup_services(&pool, &tenant_id).await;

        Self {
            pool,
            db_name,
            tenant_id,
            order_service,
            wallet_service,
            asset_service,
            settlement_service,
            tx_manager,
            account_repo,
            admin_conn_options,
        }
    }

    async fn setup_new_db() -> (PgPool, String, PgConnectOptions) {
        dotenv::dotenv().ok();
        let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");
        let options = PgConnectOptions::from_str(&database_url).expect("Invalid DATABASE_URL");

        let mut admin_options = options.clone();
        admin_options = admin_options.database("postgres");

        let mut conn = admin_options
            .connect()
            .await
            .expect("Failed to connect to postgres admin DB");
        let db_name = format!("open_exchange_test_{}", Uuid::new_v4().simple());
        conn.execute(format!(r#"CREATE DATABASE "{}";"#, db_name).as_str())
            .await
            .expect("Failed to create test database");

        let mut postgres_options = options.clone();
        postgres_options = postgres_options.database(&db_name);

        let pool = PgPoolOptions::new()
            .max_connections(5)
            .after_connect(|conn, _meta| {
                Box::pin(async move {
                    let sql = r#"
                    SET check_function_bodies = false;
                    SET session "app.current_user_id" = '';
                    SET session "app.current_tenant_id" = '';
                    SET session "app.current_membership_id" = '';
                "#;
                    conn.execute(sql).await?;
                    Ok(())
                })
            })
            .connect_with(postgres_options)
            .await
            .expect("Failed to connect to test database");

        let ctx = Self {
            pool: pool.clone(),
            db_name: db_name.clone(),
            tenant_id: "".to_string(),
            order_service: Arc::new(
                OrderService::builder(
                    Arc::new(PostgresOrderRepository::new(pool.clone())),
                    Arc::new(WalletService::new(Arc::new(PostgresWalletRepository::new(
                        pool.clone(),
                    )))),
                    Arc::new(AssetService::new(
                        Arc::new(PostgresAssetRepository::new(pool.clone())),
                        Arc::new(PostgresInstrumentRepository::new(pool.clone())),
                    )),
                )
                .build(),
            ), // Dummy service initialization just to call apply_migrations
            wallet_service: Arc::new(WalletService::new(Arc::new(PostgresWalletRepository::new(
                pool.clone(),
            )))),
            asset_service: Arc::new(AssetService::new(
                Arc::new(PostgresAssetRepository::new(pool.clone())),
                Arc::new(PostgresInstrumentRepository::new(pool.clone())),
            )),
            settlement_service: Arc::new(SettlementService::new(
                None,
                Arc::new(
                    OrderService::builder(
                        Arc::new(PostgresOrderRepository::new(pool.clone())),
                        Arc::new(WalletService::new(Arc::new(PostgresWalletRepository::new(
                            pool.clone(),
                        )))),
                        Arc::new(AssetService::new(
                            Arc::new(PostgresAssetRepository::new(pool.clone())),
                            Arc::new(PostgresInstrumentRepository::new(pool.clone())),
                        )),
                    )
                    .build(),
                ),
                Arc::new(PostgresInstrumentRepository::new(pool.clone())),
                Arc::new(LedgerService::new(
                    Arc::new(PostgresOrderRepository::new(pool.clone())),
                    Arc::new(PostgresInstrumentRepository::new(pool.clone())),
                    Arc::new(PostgresAssetRepository::new(pool.clone())),
                    Arc::new(PostgresAccountRepository::new(pool.clone())),
                )),
                Arc::new(WalletService::new(Arc::new(PostgresWalletRepository::new(
                    pool.clone(),
                )))),
                Arc::new(FillService::new(Arc::new(PostgresFillRepository::new(
                    pool.clone(),
                )))),
                Arc::new(StandardFeeService::new()),
                Arc::new(PostgresLedgerRepository::new(pool.clone())),
                Arc::new(PostgresTradeRepository::new(pool.clone())),
            )),
            account_repo: Arc::new(PostgresAccountRepository::new(pool.clone())),
            tx_manager: Arc::new(ledger::infra::transaction::PostgresTransactionManager::new(
                pool.clone(),
            )),
            admin_conn_options: admin_options.clone(),
        };

        ctx.apply_migrations().await;
        (pool, db_name, admin_options)
    }

    async fn get_shared_pool() -> PgPool {
        let url = std::env::var("DATABASE_URL_TEST").unwrap_or_else(|_| {
            "postgres://postgres@localhost:5432/open-exchange-test".to_string()
        });

        PgPoolOptions::new()
            .after_connect(|conn, _meta| {
                Box::pin(async move {
                    conn.execute("SELECT set_config('app.current_user_id', '', false)")
                        .await?;
                    conn.execute("SELECT set_config('app.current_tenant_id', '', false)")
                        .await?;
                    conn.execute("SELECT set_config('app.current_membership_id', '', false)")
                        .await?;
                    conn.execute("SELECT set_config('app.bypass_rls', 'on', false)")
                        .await?;
                    Ok(())
                })
            })
            .connect(&url)
            .await
            .expect("Failed to connect to shared test database")
    }

    async fn clean_db(pool: &PgPool) {
        let tables = vec![
            "\"Order\"",
            "\"Trade\"",
            "\"Fill\"",
            "\"LedgerEntry\"",
            "\"LedgerEvent\"",
            "\"Wallet\"",
            "\"Account\"",
            "\"Membership\"",
            "\"User\"",
            "\"Asset\"",
            "\"Instrument\"",
            "\"Tenant\"",
        ];
        let query = format!(
            "TRUNCATE TABLE {} RESTART IDENTITY CASCADE;",
            tables.join(", ")
        );
        sqlx::query(&query)
            .execute(pool)
            .await
            .expect("Failed to clean database");
    }

    async fn create_tenant(pool: &PgPool) -> Uuid {
        let id = Uuid::new_v4();
        sqlx::query(
            r#"INSERT INTO "Tenant" (id, name, "createdAt", "updatedAt") VALUES ($1, 'Test Tenant', NOW(), NOW())"#
        )
            .bind(id)
            .execute(pool).await
            .expect("Create Tenant");
        id
    }

    async fn apply_migrations(&self) {
        let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        path.push("../../services/client/src/prisma/migrations");

        let mut entries: Vec<_> = fs::read_dir(&path)
            .expect(&format!("Failed to read migrations dir: {:?}", path))
            .map(|res| res.unwrap().path())
            .filter(|p| p.is_dir())
            .collect();

        entries.sort();

        for entry in entries {
            let migration_file = entry.join("migration.sql");
            if migration_file.exists() {
                let sql =
                    fs::read_to_string(&migration_file).expect("Failed to read migration file");
                if let Err(e) = self.pool.execute(sql.as_str()).await {
                    panic!("Failed to apply migration {:?}: {:?}", migration_file, e);
                }
            }
        }
    }

    async fn setup_services(
        pool: &sqlx::PgPool,
        tenant_id: &str,
    ) -> (
        Arc<OrderService>,
        Arc<WalletService>,
        Arc<AssetService>,
        Arc<SettlementService>,
        Arc<PostgresAccountRepository>,
        Arc<dyn TransactionManager>,
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
        let asset_service = Arc::new(AssetService::new(
            asset_repo.clone(),
            instrument_repo.clone(),
        ));

        let tx_manager = Arc::new(ledger::infra::transaction::PostgresTransactionManager::new(
            pool.clone(),
        ));
        let order_service = Arc::new(
            OrderService::builder(
                order_repo.clone(),
                wallet_service.clone(),
                asset_service.clone(),
            )
            .with_transaction_manager(tx_manager.clone())
            .build(),
        );

        let ledger_service = Arc::new(LedgerService::new(
            order_repo.clone(),
            instrument_repo.clone(),
            asset_repo.clone(),
            account_repo.clone(),
        ));

        let fill_service = Arc::new(FillService::new(fill_repo.clone()));
        let fee_service = Arc::new(StandardFeeService::new());

        let settlement_service = Arc::new(SettlementService::new(
            Some(tx_manager.clone()),
            order_service.clone(),
            instrument_repo.clone(),
            ledger_service.clone(),
            wallet_service.clone(),
            fill_service.clone(),
            fee_service.clone(),
            ledger_repo.clone(),
            trade_repo.clone(),
        ));

        if account_repo
            .get_by_name("fees_account")
            .await
            .unwrap()
            .is_none()
        {
            let sys_user_id = Self::create_dummy_user(pool, tenant_id).await;
            let sys_mem_id = Self::create_dummy_membership(pool, tenant_id, &sys_user_id).await;

            account_repo
                .create(Account {
                    id: Uuid::new_v4(),
                    name: "fees_account".into(),
                    tenant_id: tenant_id.to_string(),
                    user_id: sys_mem_id,
                    ..Default::default()
                })
                .await
                .ok();
        }

        (
            order_service,
            wallet_service,
            asset_service,
            settlement_service,
            account_repo,
            tx_manager,
        )
    }

    pub async fn create_user(&self) -> String {
        Self::create_dummy_user(&self.pool, &self.tenant_id).await
    }

    pub async fn create_account(&self, user_id: &str) -> String {
        let membership_id =
            Self::create_dummy_membership(&self.pool, &self.tenant_id, user_id).await;
        Self::create_dummy_account(&self.pool, &self.tenant_id, &membership_id).await
    }

    pub async fn create_asset(&self, symbol: &str, decimals: i32) -> String {
        Self::create_dummy_asset(&self.pool, &self.tenant_id, symbol, decimals).await
    }

    pub async fn create_instrument(&self, symbol: &str, base_id: &str, quote_id: &str) -> String {
        let id = Uuid::new_v4();
        sqlx::query(
            r#"INSERT INTO "Instrument" (id, "tenantId", symbol, type, status, "underlyingAssetId", "quoteAssetId", meta, "createdAt", "updatedAt") VALUES ($1, $2, $3, 'spot', 'active', $4, $5, '{}', NOW(), NOW())"#
        )
            .bind(id)
            .bind(Uuid::parse_str(&self.tenant_id).unwrap())
            .bind(symbol)
            .bind(Uuid::parse_str(base_id).unwrap())
            .bind(Uuid::parse_str(quote_id).unwrap())
            .execute(&self.pool).await
            .expect("Create Instrument");
        id.to_string()
    }

    async fn create_dummy_user(pool: &PgPool, _tenant_id: &str) -> String {
        let id = Uuid::new_v4();
        sqlx::query(
            r#"INSERT INTO "User" (id, email, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())"#
        )
            .bind(id)
            .bind(format!("user-{}@test.com", id))
            .execute(pool).await
            .expect("Create User");
        id.to_string()
    }

    async fn create_dummy_membership(pool: &PgPool, tenant_id: &str, user_id: &str) -> String {
        let id = Uuid::new_v4();
        sqlx::query(
            r#"INSERT INTO "Membership" (id, "tenantId", "userId", status, "createdAt", "updatedAt") VALUES ($1, $2, $3, 'active', NOW(), NOW())"#
        )
            .bind(id)
            .bind(Uuid::parse_str(tenant_id).unwrap())
            .bind(Uuid::parse_str(user_id).unwrap())
            .execute(pool).await
            .expect("Create Membership");
        id.to_string()
    }

    async fn create_dummy_account(pool: &PgPool, tenant_id: &str, membership_id: &str) -> String {
        let id = Uuid::new_v4();
        sqlx::query(
            r#"INSERT INTO "Account" (id, "tenantId", "userId", name, type, status, meta, "createdAt", "updatedAt") VALUES ($1, $2, $3, 'Test Acc', 'cash', 'active', '{}', NOW(), NOW())"#
        )
            .bind(id)
            .bind(Uuid::parse_str(tenant_id).unwrap())
            .bind(Uuid::parse_str(membership_id).unwrap())
            .execute(pool).await
            .expect("Create Account");
        id.to_string()
    }

    async fn create_dummy_asset(
        pool: &PgPool,
        tenant_id: &str,
        symbol: &str,
        decimals: i32,
    ) -> String {
        let id = Uuid::new_v4();
        sqlx::query(
            r#"INSERT INTO "Asset" (id, "tenantId", symbol, klass, precision, "isFractional", decimals, meta, "createdAt", "updatedAt") VALUES ($1, $2, $3, 'crypto', $4, true, $4, '{}', NOW(), NOW())"#
        )
            .bind(id)
            .bind(Uuid::parse_str(tenant_id).unwrap())
            .bind(symbol)
            .bind(decimals)
            .execute(pool).await
            .expect("Create Asset");
        id.to_string()
    }

    /// Creates a new account funded with `amount` of `asset_id`.
    /// Mirrors the Object Mother primitive on `InMemoryTestContext`, giving
    /// Postgres integration tests the same one-line setup ergonomics.
    pub async fn funded_account(&self, asset_id: Uuid, amount: &str) -> FundedAccount {
        let amount_dec =
            Decimal::from_str(amount).unwrap_or_else(|_| panic!("Invalid amount: {}", amount));

        let user_id = self.create_user().await;
        let account_id_str = self.create_account(&user_id).await;
        let account_id = Uuid::parse_str(&account_id_str).unwrap();

        let wallet = self
            .wallet_service
            .create_wallet(ledger::domain::wallets::Wallet {
                id: Uuid::new_v4(),
                tenant_id: Uuid::parse_str(&self.tenant_id).unwrap(),
                account_id,
                asset_id,
                available: amount_dec,
                total: amount_dec,
                ..Default::default()
            })
            .await
            .expect("funded_account: failed to create wallet");

        FundedAccount {
            account_id,
            wallet_id: wallet.id,
        }
    }
}

// Clean up isolated databases
impl Drop for PostgresTestContext {
    fn drop(&mut self) {
        if self.db_name.starts_with("open_exchange_test_") && !self.db_name.contains("shared") {
            // We cannot easily run async in Drop.
            // In a real scenario, we might spawn a thread or use a blocking connection if available.
            // For now, logging.
            println!("Teardown: Created isolated DB {}", self.db_name);
        }
    }
}

pub fn atomic(amount: &str, decimals: u32) -> rust_decimal::Decimal {
    let d = rust_decimal::Decimal::from_str(amount).unwrap();
    let m = rust_decimal::Decimal::from((10u64).pow(decimals));
    (d * m).round()
}
