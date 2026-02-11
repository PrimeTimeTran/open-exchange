use uuid::Uuid;
use tonic::Request;
use ledger::proto::ledger::{RecordOrderRequest, ProcessTradeRequest, GetOpenOrdersRequest};
use ledger::proto::common::{OrderSide, OrderStatus};
use crate::common::{TestContext, create_asset, create_instrument, create_account, create_wallet, deposit_funds, create_order_object};
// Import traits to use service methods
use ledger::proto::ledger::order_service_server::OrderService; 

#[tokio::test]
async fn test_create_order_flow() {
    let ctx = TestContext::new();

    // 1. Setup Assets & Instrument
    let usd_id = create_asset(&ctx.asset_service, "USD", "fiat", 2).await;
    let btc_id = create_asset(&ctx.asset_service, "BTC", "crypto", 8).await;
    let instr_id = create_instrument(&ctx.asset_service, "BTC_USD", &btc_id, &usd_id).await;

    // 2. Setup User A (Buyer)
    let user_a_id = Uuid::new_v4().to_string();
    let account_a_id = create_account(&ctx.account_service, &user_a_id, "spot").await;
    let wallet_a_usd = create_wallet(&ctx.wallet_service, &account_a_id, &usd_id).await;
    
    // Deposit 60,000 USD (6,000,000 cents) to User A
    deposit_funds(&ctx.deposit_service, &wallet_a_usd, "6000000").await;

    // 3. Create Order (Buy 1 BTC @ 50000)
    let mut order = create_order_object(&ctx, &account_a_id, &instr_id, OrderSide::Buy, "1.0", "50000.0").await;
    order.id = Uuid::new_v4().to_string(); // Ensure ID is set
    
    let req = Request::new(RecordOrderRequest { order: Some(order.clone()) });
    let resp = ctx.order_service.record_order(req).await.expect("Failed to record order");
    
    assert!(resp.into_inner().success);

    // Verify Order is Open
    let open_orders = ctx.order_service.get_open_orders(Request::new(GetOpenOrdersRequest::default())).await.unwrap().into_inner().orders;
    assert!(open_orders.iter().any(|o| o.id == order.id && o.status == OrderStatus::Open as i32));
}

#[tokio::test]
async fn test_match_orders_market() {
    let ctx = TestContext::new();

    // 1. Setup Assets & Instrument
    let usd_id = create_asset(&ctx.asset_service, "USD", "fiat", 2).await;
    let btc_id = create_asset(&ctx.asset_service, "BTC", "crypto", 8).await;
    let instr_id = create_instrument(&ctx.asset_service, "BTC_USD", &btc_id, &usd_id).await;

    // 2. Setup User A (Buyer)
    let user_a_id = Uuid::new_v4().to_string();
    let account_a_id = create_account(&ctx.account_service, &user_a_id, "spot").await;
    let wallet_a_usd = create_wallet(&ctx.wallet_service, &account_a_id, &usd_id).await;
    deposit_funds(&ctx.deposit_service, &wallet_a_usd, "6000000").await;

    // 3. Setup User B (Seller)
    let user_b_id = Uuid::new_v4().to_string();
    let account_b_id = create_account(&ctx.account_service, &user_b_id, "spot").await;
    let wallet_b_btc = create_wallet(&ctx.wallet_service, &account_b_id, &btc_id).await;
    deposit_funds(&ctx.deposit_service, &wallet_b_btc, "100000000").await;

    // 4. Create Order A (Buy 1 BTC @ 50000)
    let mut order_a = create_order_object(&ctx, &account_a_id, &instr_id, OrderSide::Buy, "1.0", "50000.0").await;
    order_a.id = Uuid::new_v4().to_string();
    ctx.order_service.record_order(Request::new(RecordOrderRequest { order: Some(order_a.clone()) })).await.unwrap();

    // 5. Create Order B (Sell 1 BTC @ 50000)
    let mut order_b = create_order_object(&ctx, &account_b_id, &instr_id, OrderSide::Sell, "1.0", "50000.0").await;
    order_b.id = Uuid::new_v4().to_string();
    ctx.order_service.record_order(Request::new(RecordOrderRequest { order: Some(order_b.clone()) })).await.unwrap();

    // 6. Simulate Match (RecordTrade)
    let trade_req = ProcessTradeRequest {
        maker_order_id: order_a.id.clone(),
        taker_order_id: order_b.id.clone(),
        price: "50000.0".to_string(),
        quantity: "1.0".to_string(),
        timestamp: 1234567890,
        instrument_id: instr_id.clone(),
    };
    
    let trade_resp = ctx.order_service.process_trade(Request::new(trade_req)).await.expect("Failed to record trade");
    assert!(trade_resp.into_inner().success);

    // 7. Verify Orders are Filled
    // list_open_orders returns "open", "partial", "new". If filled, they should be gone.
    let open_orders = ctx.order_service.get_open_orders(Request::new(GetOpenOrdersRequest::default())).await.unwrap().into_inner().orders;
    assert!(!open_orders.iter().any(|o| o.id.to_string() == order_a.id), "Order A should be filled");
    assert!(!open_orders.iter().any(|o| o.id.to_string() == order_b.id), "Order B should be filled");
}

#[tokio::test]
async fn test_partial_fill() {
    let ctx = TestContext::new();

    // Setup Assets & Instrument
    let usd_id = create_asset(&ctx.asset_service, "USD", "fiat", 2).await;
    let btc_id = create_asset(&ctx.asset_service, "BTC", "crypto", 8).await;
    let instr_id = create_instrument(&ctx.asset_service, "BTC_USD", &btc_id, &usd_id).await;

    // Setup User A (Buyer) - Buy 1 BTC
    let user_a_id = Uuid::new_v4().to_string();
    let account_a_id = create_account(&ctx.account_service, &user_a_id, "spot").await;
    let wallet_a_usd = create_wallet(&ctx.wallet_service, &account_a_id, &usd_id).await;
    deposit_funds(&ctx.deposit_service, &wallet_a_usd, "6000000").await;

    let mut order_a = create_order_object(&ctx, &account_a_id, &instr_id, OrderSide::Buy, "1.0", "50000.0").await;
    order_a.id = Uuid::new_v4().to_string();
    ctx.order_service.record_order(Request::new(RecordOrderRequest { order: Some(order_a.clone()) })).await.unwrap();

    // Setup User B (Seller) - Sell 0.5 BTC
    let user_b_id = Uuid::new_v4().to_string();
    let account_b_id = create_account(&ctx.account_service, &user_b_id, "spot").await;
    let wallet_b_btc = create_wallet(&ctx.wallet_service, &account_b_id, &btc_id).await;
    deposit_funds(&ctx.deposit_service, &wallet_b_btc, "100000000").await;

    let mut order_b = create_order_object(&ctx, &account_b_id, &instr_id, OrderSide::Sell, "0.5", "50000.0").await;
    order_b.id = Uuid::new_v4().to_string();
    ctx.order_service.record_order(Request::new(RecordOrderRequest { order: Some(order_b.clone()) })).await.unwrap();

    // Simulate Match (0.5 BTC)
    let trade_req = ProcessTradeRequest {
        maker_order_id: order_a.id.clone(),
        taker_order_id: order_b.id.clone(),
        price: "50000.0".to_string(),
        quantity: "0.5".to_string(),
        timestamp: 1234567890,
        instrument_id: instr_id.clone(),
    };
    
    ctx.order_service.process_trade(Request::new(trade_req)).await.expect("Failed to record trade");

    // Verify Order A is Partially Filled
    let open_orders = ctx.order_service.get_open_orders(Request::new(GetOpenOrdersRequest::default())).await.unwrap().into_inner().orders;
    let order_a_found = open_orders.iter().find(|o| o.id == order_a.id).expect("Order A should be open/partial");
    assert_eq!(order_a_found.status, OrderStatus::PartiallyFilled as i32);
    assert_eq!(order_a_found.quantity_filled.parse::<f64>().unwrap(), 0.5);

    // Verify Order B is Filled
    let order_b_found = open_orders.iter().find(|o| o.id.to_string() == order_b.id);
    assert!(order_b_found.is_none(), "Order B should be filled");
}

#[tokio::test]
async fn test_multi_fill() {
    let ctx = TestContext::new();
    
    // Setup Assets & Instrument
    let usd_id = create_asset(&ctx.asset_service, "USD", "fiat", 2).await;
    let btc_id = create_asset(&ctx.asset_service, "BTC", "crypto", 8).await;
    let instr_id = create_instrument(&ctx.asset_service, "BTC_USD", &btc_id, &usd_id).await;

    // User A: Sell 1 BTC
    let user_a_id = Uuid::new_v4().to_string();
    let account_a_id = create_account(&ctx.account_service, &user_a_id, "spot").await;
    let wallet_a_btc = create_wallet(&ctx.wallet_service, &account_a_id, &btc_id).await;
    deposit_funds(&ctx.deposit_service, &wallet_a_btc, "100000000").await;

    let mut order_a = create_order_object(&ctx, &account_a_id, &instr_id, OrderSide::Sell, "1.0", "50000.0").await;
    order_a.id = Uuid::new_v4().to_string();
    ctx.order_service.record_order(Request::new(RecordOrderRequest { order: Some(order_a.clone()) })).await.unwrap();

    // User B: Sell 1 BTC
    let user_b_id = Uuid::new_v4().to_string();
    let account_b_id = create_account(&ctx.account_service, &user_b_id, "spot").await;
    let wallet_b_btc = create_wallet(&ctx.wallet_service, &account_b_id, &btc_id).await;
    deposit_funds(&ctx.deposit_service, &wallet_b_btc, "100000000").await;

    let mut order_b = create_order_object(&ctx, &account_b_id, &instr_id, OrderSide::Sell, "1.0", "50000.0").await;
    order_b.id = Uuid::new_v4().to_string();
    ctx.order_service.record_order(Request::new(RecordOrderRequest { order: Some(order_b.clone()) })).await.unwrap();

    // User C: Buy 2 BTC
    let user_c_id = Uuid::new_v4().to_string();
    let account_c_id = create_account(&ctx.account_service, &user_c_id, "spot").await;
    let wallet_c_usd = create_wallet(&ctx.wallet_service, &account_c_id, &usd_id).await;
    deposit_funds(&ctx.deposit_service, &wallet_c_usd, "10000000").await;

    let mut order_c = create_order_object(&ctx, &account_c_id, &instr_id, OrderSide::Buy, "2.0", "50000.0").await;
    order_c.id = Uuid::new_v4().to_string();
    ctx.order_service.record_order(Request::new(RecordOrderRequest { order: Some(order_c.clone()) })).await.unwrap();

    // Match A and C (1 BTC)
    let trade_req_ac = ProcessTradeRequest {
        maker_order_id: order_a.id.clone(),
        taker_order_id: order_c.id.clone(),
        price: "50000.0".to_string(),
        quantity: "1.0".to_string(),
        timestamp: 1234567890,
        instrument_id: instr_id.clone(),
    };
    ctx.order_service.process_trade(Request::new(trade_req_ac)).await.expect("Failed to record trade A-C");

    // Match B and C (1 BTC)
    let trade_req_bc = ProcessTradeRequest {
        maker_order_id: order_b.id.clone(),
        taker_order_id: order_c.id.clone(),
        price: "50000.0".to_string(),
        quantity: "1.0".to_string(),
        timestamp: 1234567891,
        instrument_id: instr_id.clone(),
    };
    ctx.order_service.process_trade(Request::new(trade_req_bc)).await.expect("Failed to record trade B-C");

    // Verify All Filled
    let open_orders = ctx.order_service.get_open_orders(Request::new(GetOpenOrdersRequest::default())).await.unwrap().into_inner().orders;
    assert!(!open_orders.iter().any(|o| o.id.to_string() == order_a.id), "Order A should be filled");
    assert!(!open_orders.iter().any(|o| o.id.to_string() == order_b.id), "Order B should be filled");
    assert!(!open_orders.iter().any(|o| o.id.to_string() == order_c.id), "Order C should be filled");
}
