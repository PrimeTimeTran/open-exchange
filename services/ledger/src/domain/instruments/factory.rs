use super::handler::InstrumentHandler;
use super::option::OptionHandler;
use super::spot::SpotHandler;

pub struct InstrumentHandlerFactory;

impl InstrumentHandlerFactory {
    pub fn get_handler(instrument_type: &str) -> Box<dyn InstrumentHandler> {
        match instrument_type.to_lowercase().as_str() {
            "option" => Box::new(OptionHandler),
            // Future extensions:
            // "future" | "perpetual" => Box::new(FuturesHandler),
            _ => Box::new(SpotHandler), // Default to Spot
        }
    }
}
