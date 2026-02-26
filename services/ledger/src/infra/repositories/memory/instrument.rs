use crate::domain::instruments::model::Instrument;
use crate::error::{AppError, Result};
use crate::infra::repositories::InstrumentRepository;
use async_trait::async_trait;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Clone, Default, Debug)]
pub struct InMemoryInstrumentRepository {
    instruments: Arc<Mutex<Vec<Instrument>>>,
}

impl InMemoryInstrumentRepository {
    pub fn new() -> Self {
        Self {
            instruments: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn add(&self, instrument: Instrument) {
        if let Ok(mut instruments) = self.instruments.lock() {
            instruments.push(instrument);
        }
    }
}

#[async_trait]
impl InstrumentRepository for InMemoryInstrumentRepository {
    async fn get(&self, id: Uuid) -> Result<Option<Instrument>> {
        let instruments = self
            .instruments
            .lock()
            .map_err(|_| AppError::Internal("Failed to lock instruments".into()))?;
        Ok(instruments.iter().find(|i| i.id == id).cloned())
    }

    async fn get_by_symbol(&self, symbol: &str) -> Result<Option<Instrument>> {
        let instruments = self
            .instruments
            .lock()
            .map_err(|_| AppError::Internal("Failed to lock instruments".into()))?;
        Ok(instruments.iter().find(|i| i.symbol == symbol).cloned())
    }

    async fn list(&self) -> Result<Vec<Instrument>> {
        let instruments = self
            .instruments
            .lock()
            .map_err(|_| AppError::Internal("Failed to lock instruments".into()))?;
        Ok(instruments.clone())
    }

    async fn create(&self, instrument: Instrument) -> Result<Instrument> {
        let mut instruments = self
            .instruments
            .lock()
            .map_err(|_| AppError::Internal("Failed to lock instruments".into()))?;
        instruments.push(instrument.clone());
        Ok(instrument)
    }
}
