use async_trait::async_trait;
use std::sync::{Arc, Mutex};
use uuid::Uuid;
use crate::proto::common;
use crate::error::Result;
use crate::infra::repositories::InstrumentRepository;

#[derive(Clone, Default, Debug)]
pub struct InMemoryInstrumentRepository {
    instruments: Arc<Mutex<Vec<common::Instrument>>>,
}

impl InMemoryInstrumentRepository {
    pub fn new() -> Self {
        Self {
            instruments: Arc::new(Mutex::new(Vec::new())),
        }
    }
}

#[async_trait]
impl InstrumentRepository for InMemoryInstrumentRepository {
    async fn get(&self, id: Uuid) -> Result<Option<common::Instrument>> {
        let instruments = self.instruments.lock().unwrap();
        Ok(instruments.iter().find(|i| i.id == id.to_string()).cloned())
    }

    async fn get_by_symbol(&self, symbol: &str) -> Result<Option<common::Instrument>> {
        let instruments = self.instruments.lock().unwrap();
        Ok(instruments.iter().find(|i| i.symbol == symbol).cloned())
    }

    async fn list(&self) -> Result<Vec<common::Instrument>> {
        let instruments = self.instruments.lock().unwrap();
        Ok(instruments.clone())
    }

    async fn create(&self, instrument: common::Instrument) -> Result<common::Instrument> {
        let mut instruments = self.instruments.lock().unwrap();
        instruments.push(instrument.clone());
        Ok(instrument)
    }
}
