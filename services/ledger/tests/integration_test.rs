use ledger::api::ledger::LedgerImpl;
use ledger::proto::ledger::ledger_service_server::LedgerService;
use ledger::proto::ledger::RecordOrderRequest;
use ledger::proto::common::{Order, OrderSide, OrderType, OrderStatus, TimeInForce};
use tonic::Request;

#[tokio::test]
async fn test_record_order_success() {
    // Use the test constructor which doesn't require a DB pool
    let service = LedgerImpl::new_test();
    
    let order = Order {
        id: "order-1".to_string(),
        tenant_id: "tenant-1".to_string(),
        account_id: "acc-1".to_string(),
        instrument_id: "BTC-USD".to_string(),
        side: OrderSide::Buy as i32,
        price: "50000".to_string(),
        quantity: "1".to_string(),
        quantity_filled: "0".to_string(),
        status: OrderStatus::Open as i32,
        time_in_force: TimeInForce::Gtc as i32,
        created_at: 1234567890,
        updated_at: 1234567890,
        r#type: OrderType::Limit as i32,
        meta: "{}".to_string(),
    };

    let request = Request::new(RecordOrderRequest {
        order: Some(order),
    });

    let response = service.record_order(request).await.unwrap();
    let resp = response.into_inner();

    assert!(resp.success);
    assert_eq!(resp.message, "Order recorded in ledger");
}
