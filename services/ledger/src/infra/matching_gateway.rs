use crate::domain::orders::model::{Order, OrderSide, OrderStatus, OrderType};
use crate::domain::orders::service::MatchingGateway;
use crate::proto::matching::matching_client::MatchingClient;
use tonic::transport::Channel;

pub struct GrpcMatchingGateway {
    client: Option<MatchingClient<Channel>>,
}

impl GrpcMatchingGateway {
    pub fn new(client: Option<MatchingClient<Channel>>) -> Self {
        Self { client }
    }

    fn map_domain_to_proto(order: Order) -> crate::proto::common::Order {
        let side = (match order.side {
            OrderSide::Buy => crate::proto::common::OrderSide::Buy,
            OrderSide::Sell => crate::proto::common::OrderSide::Sell,
        }) as i32;

        let status = (match order.status {
            OrderStatus::New => crate::proto::common::OrderStatus::Unspecified,
            OrderStatus::Open => crate::proto::common::OrderStatus::Open,
            OrderStatus::PartialFill => crate::proto::common::OrderStatus::PartialFill,
            OrderStatus::Filled => crate::proto::common::OrderStatus::Filled,
            OrderStatus::Cancelled => crate::proto::common::OrderStatus::Cancelled,
            OrderStatus::Rejected => crate::proto::common::OrderStatus::Rejected,
        }) as i32;

        let order_type = (match order.r#type {
            OrderType::Limit => crate::proto::common::OrderType::Limit,
            OrderType::Market => crate::proto::common::OrderType::Market,
        }) as i32;

        crate::proto::common::Order {
            id: order.id.to_string(),
            tenant_id: order.tenant_id.to_string(),
            account_id: order.account_id.to_string(),
            instrument_id: order.instrument_id.to_string(),
            side,
            r#type: order_type,
            price: order.price.to_string(),
            quantity: order.quantity.to_string(),
            quantity_filled: order.filled_quantity.to_string(),
            time_in_force: crate::proto::common::TimeInForce::Gtc as i32,
            status,
            meta: order.meta.to_string(),
            created_at: order.created_at.timestamp_millis(),
            updated_at: order.updated_at.timestamp_millis(),
        }
    }
}

#[tonic::async_trait]
impl MatchingGateway for GrpcMatchingGateway {
    async fn place_order(&self, order: &Order) -> crate::error::Result<()> {
        if let Some(client) = &self.client {
            let mut matching_client = client.clone();
            let proto_order = Self::map_domain_to_proto(order.clone());

            // Fire and forget with retry strategy
            tokio::spawn(async move {
                let mut attempts = 0;
                let max_attempts = 5;
                let mut backoff = std::time::Duration::from_millis(100);

                loop {
                    // Re-create request for each attempt since tonic::Request consumes ownership
                    let request = tonic::Request::new(crate::proto::matching::PlaceOrderRequest {
                        order: Some(proto_order.clone()),
                    });

                    match matching_client.place_order(request).await {
                        Ok(response) => {
                            tracing::info!(
                                ?response,
                                "Successfully forwarded order to matching engine"
                            );
                            break;
                        }
                        Err(e) => {
                            attempts += 1;
                            if attempts >= max_attempts {
                                tracing::error!(
                                    error = %e,
                                    "Failed to forward order to matching engine after {} attempts. Giving up.",
                                    max_attempts
                                );
                                // TODO: Push to Dead Letter Queue (DLQ) or alert system
                                break;
                            }
                            tracing::warn!(
                                error = %e,
                                "Failed to forward order to matching engine (attempt {}/{}), retrying in {:?}...",
                                attempts,
                                max_attempts,
                                backoff
                            );
                            tokio::time::sleep(backoff).await;
                            backoff = std::cmp::min(backoff * 2, std::time::Duration::from_secs(5));
                        }
                    }
                }
            });
        }
        Ok(())
    }
}
