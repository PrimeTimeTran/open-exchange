use serde::Deserialize;
use std::env;

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub database_url: String,
    pub port: u16,
    pub log_level: String,
    pub db_max_connections: u32,
}

impl Config {
    pub fn from_env() -> Result<Self, config::ConfigError> {
        // Load .env file if it exists
        dotenv::dotenv().ok();

        let database_url = env::var("DATABASE_URL")
            .map_err(|e| config::ConfigError::Message(format!("DATABASE_URL missing: {}", e)))?;
        let port = env::var("PORT")
            .unwrap_or_else(|_| "50052".to_string())
            .parse()
            .unwrap_or(50052);
        let log_level = env::var("RUST_LOG").unwrap_or_else(|_| "info".to_string());
        let db_max_connections = env::var("DATABASE_MAX_CONNECTIONS")
            .unwrap_or_else(|_| "50".to_string())
            .parse()
            .unwrap_or(50);

        Ok(Config {
            database_url,
            port,
            log_level,
            db_max_connections,
        })
    }
}

// Temporary error type if we don't use the config crate yet, or just implement manually
pub mod config {
    use std::fmt;

    #[derive(Debug)]
    pub enum ConfigError {
        Message(String),
    }

    impl fmt::Display for ConfigError {
        fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
            match self {
                ConfigError::Message(msg) => write!(f, "Config Error: {}", msg),
            }
        }
    }

    impl std::error::Error for ConfigError {}
}
