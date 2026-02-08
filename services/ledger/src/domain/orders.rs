use crate::proto::common;
use std::sync::{Arc, Mutex};
use sqlx::{PgPool, Row};
use uuid::Uuid;
use std::str::FromStr;

#[derive(Debug, Default, Clone)]
pub struct OrderService {
    orders: Arc<Mutex<Vec<common::Order>>>,
    db_pool: Option<PgPool>,
}

impl OrderService {
    pub fn new(db_pool: Option<PgPool>) -> Self {
        Self {
            orders: Arc::new(Mutex::new(Vec::new())),
            db_pool,
        }
    }

    pub async fn record_order(&self, order: common::Order) {
        // Update memory
        {
            let mut orders = self.orders.lock().unwrap();
            orders.push(order.clone());
        }

        // Update DB
        if let Some(pool) = &self.db_pool {
            let tenant_id = Uuid::from_str(&order.tenant_id).unwrap_or_default();
            let account_id = Uuid::from_str(&order.account_id).unwrap_or_default();
            
            // Resolve Instrument ID from Symbol
            let instrument_id_str = order.instrument_id.clone();
            let mut resolved_instrument_id = Uuid::default();
            
            // Try to find the instrument by symbol within the tenant
            let instrument_lookup = sqlx::query(
                r#"SELECT id FROM "Instrument" WHERE symbol = $1 AND "tenantId" = $2"#
            )
            .bind(&instrument_id_str)
            .bind(tenant_id)
            .fetch_optional(pool)
            .await;

            if let Ok(Some(row)) = instrument_lookup {
                resolved_instrument_id = row.get("id");
            } else {
                // Fallback: If it's already a UUID string, try to parse it
                if let Ok(uuid) = Uuid::from_str(&instrument_id_str) {
                    resolved_instrument_id = uuid;
                }
            }

            let id = Uuid::from_str(&order.id).unwrap_or(Uuid::new_v4());

            let side = match order.side {
                1 => "buy",
                2 => "sell",
                _ => "unknown",
            };
            let type_ = match order.r#type {
                1 => "limit",
                2 => "market",
                _ => "unknown",
            };
            let status = match order.status {
                1 => "open",
                2 => "partially_filled",
                3 => "filled",
                4 => "cancelled",
                5 => "rejected",
                _ => "unknown",
            };
            let tif = match order.time_in_force {
                1 => "gtc",
                2 => "ioc",
                3 => "fok",
                _ => "unknown",
            };

            let _ = sqlx::query(
                r#"
                INSERT INTO "Order" (
                    id, "tenantId", "accountId", "instrumentId",
                    side, type, status, "timeInFore",
                    price, quantity, "quantityFilled"
                ) VALUES (
                    $1, $2, $3, $4,
                    $5, $6, $7, $8,
                    $9::decimal, $10::decimal, $11::decimal
                )
                ON CONFLICT (id) DO UPDATE SET
                    status = EXCLUDED.status,
                    "quantityFilled" = EXCLUDED."quantityFilled",
                    "updatedAt" = NOW()
                "#,
            )
            .bind(id)
            .bind(tenant_id)
            .bind(account_id)
            .bind(resolved_instrument_id)
            .bind(side)
            .bind(type_)
            .bind(status)
            .bind(tif)
            .bind(&order.price)
            .bind(&order.quantity)
            .bind(&order.quantity_filled)
            .execute(pool)
            .await;
        }
    }

    pub async fn cancel_order(&self, order_id: &str) -> bool {
        // Update memory
        let mut found = false;
        {
            let mut orders = self.orders.lock().unwrap();
            if let Some(pos) = orders.iter().position(|x| x.id == order_id) {
                orders.remove(pos);
                found = true;
            }
        }

        // Update DB
        if let Some(pool) = &self.db_pool {
             if let Ok(uuid) = Uuid::from_str(order_id) {
                 let res = sqlx::query(
                     r#"UPDATE "Order" SET status = 'cancelled' WHERE id = $1"#
                 )
                 .bind(uuid)
                 .execute(pool)
                 .await;
                 
                 if let Ok(rows) = res {
                     if rows.rows_affected() > 0 {
                         found = true;
                     }
                 }
             }
        }
        
        found
    }

    pub async fn get_open_orders(&self) -> Vec<common::Order> {
        if let Some(pool) = &self.db_pool {
             let rows = sqlx::query(
                 r#"
                 SELECT 
                    O.id, O."tenantId", O."accountId",
                    COALESCE(I.symbol, O."instrumentId"::text) as "instrumentId",
                    O.side, O.type, O.status, O."timeInFore",
                    O.price::text, O.quantity::text, O."quantityFilled"::text
                 FROM "Order" O
                 LEFT JOIN "Instrument" I ON O."instrumentId" = I.id
                 WHERE O.status = 'open' OR O.status = 'partially_filled'
                 "#
             )
             .fetch_all(pool)
             .await;

             if let Ok(rows) = rows {
                 let mut orders = Vec::new();
                 for row in rows {
                     let id: Uuid = row.get("id");
                     let tenant_id: Uuid = row.get("tenantId");
                     let account_id: Uuid = row.get("accountId");
                     let instrument_id: String = row.get("instrumentId");
                     let side: String = row.get("side");
                     let type_: String = row.get("type");
                     let status: String = row.get("status");
                     let tif: String = row.get("timeInFore");
                     let price: String = row.get("price");
                     let quantity: String = row.get("quantity");
                     let quantity_filled: String = row.get("quantityFilled");

                     let side_enum = match side.as_str() {
                         "buy" => 1,
                         "sell" => 2,
                         _ => 0,
                     };
                     let type_enum = match type_.as_str() {
                         "limit" => 1,
                         "market" => 2,
                         _ => 0,
                     };
                     let status_enum = match status.as_str() {
                         "open" => 1,
                         "partially_filled" => 2,
                         "filled" => 3,
                         "cancelled" => 4,
                         "rejected" => 5,
                         _ => 0,
                     };
                     let tif_enum = match tif.as_str() {
                         "gtc" => 1,
                         "ioc" => 2,
                         "fok" => 3,
                         _ => 0,
                     };

                     orders.push(common::Order {
                         id: id.to_string(),
                         tenant_id: tenant_id.to_string(),
                         account_id: account_id.to_string(),
                         instrument_id: instrument_id.to_string(),
                         side: side_enum,
                         r#type: type_enum,
                         status: status_enum,
                         time_in_force: tif_enum,
                         price,
                         quantity,
                         quantity_filled,
                         // Fill other fields with defaults
                         created_at: 0,
                         updated_at: 0,
                         meta: "".to_string(),
                     });
                 }
                 return orders;
             }
        }
        
        let orders = self.orders.lock().unwrap();
        orders.clone()
    }
}
