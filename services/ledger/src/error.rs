use std::fmt;
use std::error::Error;

#[derive(Debug)]
pub enum AppError {
    NotFound(String),
    DatabaseError(sqlx::Error),
    ValidationError(String),
    Internal(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::NotFound(msg) => write!(f, "Not Found: {}", msg),
            AppError::DatabaseError(err) => write!(f, "Database Error: {}", err),
            AppError::ValidationError(msg) => write!(f, "Validation Error: {}", msg),
            AppError::Internal(msg) => write!(f, "Internal Error: {}", msg),
        }
    }
}

impl Error for AppError {}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        AppError::DatabaseError(err)
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
