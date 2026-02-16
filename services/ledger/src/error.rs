use std::fmt;
use std::error::Error;

#[derive(Debug)]
pub enum AppError {
    NotFound(String),
    DatabaseError(sqlx::Error),
    ValidationError(String),
    Internal(String),
    OptimisticLockingError(String),
    // Specific Domain Errors
    InsufficientFunds { asset: String, required: String, available: String },
    InvalidInstrument(String),
    MalformedRequest(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::NotFound(msg) => write!(f, "Not Found: {}", msg),
            AppError::DatabaseError(err) => write!(f, "Database Error: {}", err),
            AppError::ValidationError(msg) => write!(f, "Validation Error: {}", msg),
            AppError::Internal(msg) => write!(f, "Internal Error: {}", msg),
            AppError::OptimisticLockingError(msg) => write!(f, "Optimistic Locking Error: {}", msg),
            AppError::InsufficientFunds { asset, required, available } => 
                write!(f, "Insufficient Funds for {}: Required {}, Available {}", asset, required, available),
            AppError::InvalidInstrument(id) => write!(f, "Invalid Instrument: {}", id),
            AppError::MalformedRequest(msg) => write!(f, "Malformed Request: {}", msg),
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
