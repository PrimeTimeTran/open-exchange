use crate::proto::common;
use std::sync::{Arc, Mutex};

#[derive(Debug, Default, Clone)]
pub struct OrderService {
    orders: Arc<Mutex<Vec<common::Order>>>,
}

impl OrderService {
    pub fn new() -> Self {
        Self {
            orders: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn record_order(&self, order: common::Order) {
        let mut orders = self.orders.lock().unwrap();
        orders.push(order);
    }

    pub fn cancel_order(&self, order_id: &str) -> bool {
        let mut orders = self.orders.lock().unwrap();
        if let Some(pos) = orders.iter().position(|x| x.id == order_id) {
            orders.remove(pos);
            true
        } else {
            false
        }
    }

    pub fn get_open_orders(&self) -> Vec<common::Order> {
        let orders = self.orders.lock().unwrap();
        orders.clone()
    }
}
