use ledger::api::ledger::LedgerImpl;
use ledger::proto::ledger::ledger_service_server::LedgerService;
use ledger::proto::ledger::RecordOrderRequest;
use ledger::proto::common::{Order, OrderSide, OrderType, OrderStatus, TimeInForce};
use tonic::Request;
use uuid::Uuid;

#[tokio::test]
async fn test_record_order_success() {
    // Use the test constructor which doesn't require a DB pool
    let service = LedgerImpl::new_test();
    
    let order_id = Uuid::new_v4().to_string();
    let tenant_id = Uuid::new_v4().to_string();
    let account_id = Uuid::new_v4().to_string();
    let instrument_id = Uuid::new_v4().to_string();

    let order = Order {
        id: order_id,
        tenant_id: tenant_id,
        account_id: account_id,
        instrument_id: instrument_id,
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

#[tokio::test]
async fn test_create_and_get_account() {
    use ledger::proto::ledger::{CreateAccountRequest, GetAccountRequest};
    
    let service = LedgerImpl::new_test();
    let user_id = "user-1".to_string();
    let account_type = "spot".to_string();

    // Create Account
    let create_req = Request::new(CreateAccountRequest {
        user_id: user_id.clone(),
        r#type: account_type.clone(),
    });

    let create_resp = service.create_account(create_req).await.unwrap().into_inner();
    let created_account = create_resp.account.unwrap();
    
    assert_eq!(created_account.user_id, user_id);
    assert_eq!(created_account.r#type, account_type);
    assert!(!created_account.id.is_empty());

    // Get Account
    let get_req = Request::new(GetAccountRequest {
        account_id: created_account.id.clone(),
    });

    let get_resp = service.get_account(get_req).await.unwrap().into_inner();
    let retrieved_account = get_resp.account.unwrap();

    assert_eq!(retrieved_account.id, created_account.id);
    assert_eq!(retrieved_account.user_id, user_id);
}

#[tokio::test]
async fn test_cancel_order() {
    use ledger::proto::ledger::CancelOrderRequest;
    
    let service = LedgerImpl::new_test();
    
    let order_id = Uuid::new_v4().to_string();
    let tenant_id = Uuid::new_v4().to_string();
    let account_id = Uuid::new_v4().to_string();
    let instrument_id = Uuid::new_v4().to_string();

    let order = Order {
        id: order_id.clone(),
        tenant_id,
        account_id,
        instrument_id,
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

    // Record order first
    let _ = service.record_order(Request::new(RecordOrderRequest {
        order: Some(order),
    })).await.unwrap();

    // Cancel order
    let cancel_req = Request::new(CancelOrderRequest {
        order_id: order_id.clone(),
    });

    let cancel_resp = service.cancel_order(cancel_req).await.unwrap().into_inner();
    
    assert!(cancel_resp.success);
    assert_eq!(cancel_resp.message, "Order cancelled");
}

#[tokio::test]
async fn test_get_open_orders() {
    use ledger::proto::ledger::GetOpenOrdersRequest;
    
    let service = LedgerImpl::new_test();
    let order_id = Uuid::new_v4().to_string();
    
    let order = Order {
        id: order_id.clone(),
        tenant_id: Uuid::new_v4().to_string(),
        account_id: Uuid::new_v4().to_string(),
        instrument_id: Uuid::new_v4().to_string(),
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

    // Record an open order
    let _ = service.record_order(Request::new(RecordOrderRequest {
        order: Some(order),
    })).await.unwrap();

    // Get open orders
    let req = Request::new(GetOpenOrdersRequest {
        instrument_id: "".to_string(),
    });
    let resp = service.get_open_orders(req).await.unwrap().into_inner();

    assert_eq!(resp.orders.len(), 1);
    assert_eq!(resp.orders[0].id, order_id);
}

#[tokio::test]
async fn test_delete_order_unimplemented() {
    use ledger::proto::ledger::DeleteOrderRequest;
    
    let service = LedgerImpl::new_test();
    let req = Request::new(DeleteOrderRequest {
        order_id: "any-id".to_string(),
    });

    let result = service.delete_order(req).await;
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().code(), tonic::Code::Unimplemented);
}

#[tokio::test]
async fn test_record_trade_unimplemented() {
    use ledger::proto::ledger::RecordTradeRequest;
    
    let service = LedgerImpl::new_test();
    let req = Request::new(RecordTradeRequest {
        maker_order_id: "order-1".to_string(),
        taker_order_id: "order-2".to_string(),
        price: "50000".to_string(),
        quantity: "1".to_string(),
        timestamp: 1234567890,
        instrument_id: "BTC-USD".to_string(),
    });

    let result = service.record_trade(req).await;
    assert!(result.is_err());
    assert_eq!(result.unwrap_err().code(), tonic::Code::Unimplemented);
}
