use std::fs;
use uuid::Uuid;
use std::str::FromStr;
use std::path::PathBuf;
use sqlx::{postgres::{PgPoolOptions, PgConnectOptions}, ConnectOptions, Executor, PgPool};

pub struct TestDb {
    pub pool: PgPool,
    pub db_name: String,
    #[allow(dead_code)]
    pub admin_conn_options: PgConnectOptions,
}

impl TestDb {
    pub async fn new() -> Self {
        dotenv::dotenv().ok();
        let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");
        
        let options = PgConnectOptions::from_str(&database_url).expect("Invalid DATABASE_URL");
        
        // Connect to 'postgres' database to create the new test database
        let mut admin_options = options.clone();
        admin_options = admin_options.database("postgres");
        
        let mut conn = admin_options.connect().await.expect("Failed to connect to postgres admin DB");
        
        let db_name = format!("open_exchange_test_{}", Uuid::new_v4().simple());
        conn.execute(format!(r#"CREATE DATABASE "{}";"#, db_name).as_str()).await.expect("Failed to create test database");

        // Connect to the new database
        let mut test_db_options = options.clone();
        test_db_options = test_db_options.database(&db_name);
        
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .after_connect(|conn, _meta| Box::pin(async move {
                // Initialize session variables required by RLS/Defaults in Schema
                // Using SET LOCAL would be for transaction, SET is session.
                // We likely need to just ensure they don't error.
                // We might need to run `SET check_function_bodies = false` if migrations use functions?
                
                // We define empty strings for these IDs to satisfy the schema defaults (which use NULLIF(..., ''))
                let sql = r#"
                    SET check_function_bodies = false;
                    SET session "app.current_user_id" = '';
                    SET session "app.current_tenant_id" = '';
                    SET session "app.current_membership_id" = '';
                "#;
                conn.execute(sql).await?;
                Ok(())
            }))
            .connect_with(test_db_options)
            .await
            .expect("Failed to connect to test database");

        let tdb = Self { pool, db_name, admin_conn_options: admin_options };
        tdb.apply_migrations().await;
        tdb
    }

    async fn apply_migrations(&self) {
        let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        // Adjust path to point to client service migrations
        path.push("../../services/client/src/prisma/migrations");
        
        // Read directory and collect migration folders
        let mut entries: Vec<_> = fs::read_dir(&path)
            .expect(&format!("Failed to read migrations dir: {:?}", path))
            .map(|res| res.unwrap().path())
            .filter(|p| p.is_dir())
            .collect();
            
        // Sort to ensure correct order (YYYYMMDD...)
        entries.sort();

        for entry in entries {
            let migration_file = entry.join("migration.sql");
            if migration_file.exists() {
                let sql = fs::read_to_string(&migration_file).expect("Failed to read migration file");
                // Execute migration
                if let Err(e) = self.pool.execute(sql.as_str()).await {
                    panic!("Failed to apply migration {:?}: {:?}", migration_file, e);
                }
            }
        }
    }
}

// Ensure we clean up the database when the test structure is dropped
// Note: This won't run if the test panics and aborts immediately, but helpful for success cases.
// For robust cleanup, an external script or using Testcontainers is better.
impl Drop for TestDb {
    fn drop(&mut self) {
        // We cannot call async methods in Drop easily without a runtime handle.
        // For now, we just log the name so it can be cleaned up manually if needed.
        println!("Test DB created: {}", self.db_name);
        println!("TIP: Run 'docker compose exec postgres psql -U postgres -c \"DROP DATABASE \\\"{}\\\";\"' to clean up manually if needed.", self.db_name);
    }
}
