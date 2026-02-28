use crate::helpers::memory::InMemoryTestContext;
use ledger::proto::common::{OrderSide, OrderStatus};
use ledger::proto::ledger::order_service_server::OrderService;
use ledger::proto::ledger::settlement_server::Settlement;
use ledger::proto::ledger::{CommitRequest, GetOpenOrdersRequest, Match, RecordOrderRequest};
use tonic::Request;
use uuid::Uuid;

#[tokio::test]
async fn test_create_order_flow() {
    let ctx = InMemoryTestContext::new();

    // 1. Setup Assets & Instrument
    let usd_id = ctx.create_asset_api("USD", "fiat", 2).await;
    let btc_id = ctx.create_asset_api("BTC", "crypto", 8).await;
    let instr_id = ctx.create_instrument_api("BTC_USD", &btc_id, &usd_id).await;

    // 2. Setup User A (Buyer)
    let user_a_id = Uuid::new_v4().to_string();
    let account_a_id = ctx.create_account_api(&user_a_id, "spot").await;
    let wallet_a_usd = ctx.create_wallet_api(&account_a_id, &usd_id).await;

    // Deposit 60,000 USD (6,000,000 cents) to User A
    ctx.deposit_funds_api(&wallet_a_usd, "6000000").await;

    // 3. Create Order (Buy 1 BTC @ 50000)
    let mut order = ctx.seed_order_proto(&account_a_id, &instr_id, OrderSide::Buy, 50000.0, 1.0);
    order.id = Uuid::new_v4().to_string(); // Ensure ID is set

    let req = Request::new(RecordOrderRequest {
        order: Some(order.clone()),
    });
    let resp = ctx
        .order_api
        .record_order(req)
        .await
        .expect("Failed to record order");

    assert!(resp.into_inner().success);

    // Verify Order is Open
    let open_orders = ctx
        .order_api
        .get_open_orders(Request::new(GetOpenOrdersRequest::default()))
        .await
        .unwrap()
        .into_inner()
        .orders;
    assert!(open_orders
        .iter()
        .any(|o| o.id == order.id && o.status == (OrderStatus::Open as i32)));
}

#[tokio::test]
async fn test_match_orders_market() {
    let ctx = InMemoryTestContext::new();

    // 1. Setup Assets & Instrument
    let usd_id = ctx.create_asset_api("USD", "fiat", 2).await;
    let btc_id = ctx.create_asset_api("BTC", "crypto", 8).await;
    let instr_id = ctx.create_instrument_api("BTC_USD", &btc_id, &usd_id).await;

    // 2. Setup User A (Buyer)
    let user_a_id = Uuid::new_v4().to_string();
    let account_a_id = ctx.create_account_api(&user_a_id, "spot").await;
    let wallet_a_usd = ctx.create_wallet_api(&account_a_id, &usd_id).await;
    ctx.deposit_funds_api(&wallet_a_usd, "6000000").await;

    // 3. Setup User B (Seller)
    let user_b_id = Uuid::new_v4().to_string();
    let account_b_id = ctx.create_account_api(&user_b_id, "spot").await;
    let wallet_b_btc = ctx.create_wallet_api(&account_b_id, &btc_id).await;
    ctx.deposit_funds_api(&wallet_b_btc, "100000000").await;

    // 4. Create Order A (Buy 1 BTC @ 50000)
    let mut order_a = ctx.seed_order_proto(&account_a_id, &instr_id, OrderSide::Buy, 50000.0, 1.0);
    order_a.id = Uuid::new_v4().to_string();
    ctx.order_api
        .record_order(Request::new(RecordOrderRequest {
            order: Some(order_a.clone()),
        }))
        .await
        .unwrap();

    // 5. Create Order B (Sell 1 BTC @ 50000)
    let mut order_b = ctx.seed_order_proto(&account_b_id, &instr_id, OrderSide::Sell, 50000.0, 1.0);
    order_b.id = Uuid::new_v4().to_string();
    ctx.order_api
        .record_order(Request::new(RecordOrderRequest {
            order: Some(order_b.clone()),
        }))
        .await
        .unwrap();

    // 6. Simulate Match (Commit)
    let match_data = Match {
        match_id: Uuid::new_v4().to_string(),
        maker_order_id: order_a.id.clone(),
        taker_order_id: order_b.id.clone(),
        instrument_id: instr_id.clone(),
        price: "50000.0".to_string(),
        quantity: "1.0".to_string(),
        taker_side: OrderSide::Sell as i32, // User B is taker (sold into User A's buy)
        matched_at: 1234567890,
    };

    let commit_req = CommitRequest {
        matches: vec![match_data],
        tenant_id: ctx.tenant_id.to_string(),
    };

    let commit_resp = ctx
        .settlement_api
        .commit(Request::new(commit_req))
        .await
        .expect("Failed to commit trade");
    assert!(commit_resp.into_inner().success);

    // 7. Verify Orders are Filled
    // list_open_orders returns "open", "partial", "new". If filled, they should be gone.
    let open_orders = ctx
        .order_api
        .get_open_orders(Request::new(GetOpenOrdersRequest::default()))
        .await
        .unwrap()
        .into_inner()
        .orders;
    assert!(
        !open_orders.iter().any(|o| o.id.to_string() == order_a.id),
        "Order A should be filled"
    );
    assert!(
        !open_orders.iter().any(|o| o.id.to_string() == order_b.id),
        "Order B should be filled"
    );
}

#[tokio::test]
async fn test_partial_fill() {
    let ctx = InMemoryTestContext::new();

    // Setup Assets & Instrument
    let usd_id = ctx.create_asset_api("USD", "fiat", 2).await;
    let btc_id = ctx.create_asset_api("BTC", "crypto", 8).await;
    let instr_id = ctx.create_instrument_api("BTC_USD", &btc_id, &usd_id).await;

    // Setup User A (Buyer) - Buy 1 BTC
    let user_a_id = Uuid::new_v4().to_string();
    let account_a_id = ctx.create_account_api(&user_a_id, "spot").await;
    let wallet_a_usd = ctx.create_wallet_api(&account_a_id, &usd_id).await;
    ctx.deposit_funds_api(&wallet_a_usd, "6000000").await;

    let mut order_a = ctx.seed_order_proto(&account_a_id, &instr_id, OrderSide::Buy, 50000.0, 1.0);
    order_a.id = Uuid::new_v4().to_string();
    ctx.order_api
        .record_order(Request::new(RecordOrderRequest {
            order: Some(order_a.clone()),
        }))
        .await
        .unwrap();

    // Setup User B (Seller) - Sell 0.5 BTC
    let user_b_id = Uuid::new_v4().to_string();
    let account_b_id = ctx.create_account_api(&user_b_id, "spot").await;
    let wallet_b_btc = ctx.create_wallet_api(&account_b_id, &btc_id).await;
    ctx.deposit_funds_api(&wallet_b_btc, "100000000").await;

    let mut order_b = ctx.seed_order_proto(&account_b_id, &instr_id, OrderSide::Sell, 50000.0, 0.5);
    order_b.id = Uuid::new_v4().to_string();
    ctx.order_api
        .record_order(Request::new(RecordOrderRequest {
            order: Some(order_b.clone()),
        }))
        .await
        .unwrap();

    // Simulate Match (0.5 BTC)
    let match_data = Match {
        match_id: Uuid::new_v4().to_string(),
        maker_order_id: order_a.id.clone(),
        taker_order_id: order_b.id.clone(),
        instrument_id: instr_id.clone(),
        price: "50000.0".to_string(),
        quantity: "0.5".to_string(),
        taker_side: OrderSide::Sell as i32,
        matched_at: 1234567890,
    };

    let commit_req = CommitRequest {
        matches: vec![match_data],
        tenant_id: ctx.tenant_id.to_string(),
    };

    ctx.settlement_api
        .commit(Request::new(commit_req))
        .await
        .expect("Failed to commit trade");

    // Verify Order A is Partial Fill
    let open_orders = ctx
        .order_api
        .get_open_orders(Request::new(GetOpenOrdersRequest::default()))
        .await
        .unwrap()
        .into_inner()
        .orders;
    let order_a_found = open_orders
        .iter()
        .find(|o| o.id == order_a.id)
        .expect("Order A should be open/partial");
    assert_eq!(order_a_found.status, OrderStatus::PartialFill as i32);
    assert_eq!(order_a_found.quantity_filled.parse::<f64>().unwrap(), 0.5);

    // Verify Order B is Filled
    let order_b_found = open_orders.iter().find(|o| o.id.to_string() == order_b.id);
    assert!(order_b_found.is_none(), "Order B should be filled");
}

#[tokio::test]
async fn test_multi_fill() {
    let ctx = InMemoryTestContext::new();

    // Setup Assets & Instrument
    let usd_id = ctx.create_asset_api("USD", "fiat", 2).await;
    let btc_id = ctx.create_asset_api("BTC", "crypto", 8).await;
    let instr_id = ctx.create_instrument_api("BTC_USD", &btc_id, &usd_id).await;

    // User A: Sell 1 BTC
    let user_a_id = Uuid::new_v4().to_string();
    let account_a_id = ctx.create_account_api(&user_a_id, "spot").await;
    let wallet_a_btc = ctx.create_wallet_api(&account_a_id, &btc_id).await;
    ctx.deposit_funds_api(&wallet_a_btc, "100000000").await;

    let mut order_a = ctx.seed_order_proto(&account_a_id, &instr_id, OrderSide::Sell, 50000.0, 1.0);
    order_a.id = Uuid::new_v4().to_string();
    ctx.order_api
        .record_order(Request::new(RecordOrderRequest {
            order: Some(order_a.clone()),
        }))
        .await
        .unwrap();

    // User B: Sell 1 BTC
    let user_b_id = Uuid::new_v4().to_string();
    let account_b_id = ctx.create_account_api(&user_b_id, "spot").await;
    let wallet_b_btc = ctx.create_wallet_api(&account_b_id, &btc_id).await;
    ctx.deposit_funds_api(&wallet_b_btc, "100000000").await;

    let mut order_b = ctx.seed_order_proto(&account_b_id, &instr_id, OrderSide::Sell, 50000.0, 0.5);
    order_b.id = Uuid::new_v4().to_string();
    ctx.order_api
        .record_order(Request::new(RecordOrderRequest {
            order: Some(order_b.clone()),
        }))
        .await
        .unwrap();

    // User C: Buy 2 BTC
    let user_c_id = Uuid::new_v4().to_string();
    let account_c_id = ctx.create_account_api(&user_c_id, "spot").await;
    let wallet_c_usd = ctx.create_wallet_api(&account_c_id, &usd_id).await;
    ctx.deposit_funds_api(&wallet_c_usd, "10000000").await;

    let mut order_c = ctx.seed_order_proto(&account_c_id, &instr_id, OrderSide::Buy, 50000.0, 2.0);
    order_c.id = Uuid::new_v4().to_string();
    ctx.order_api
        .record_order(Request::new(RecordOrderRequest {
            order: Some(order_c.clone()),
        }))
        .await
        .unwrap();

    // Match A and C (1 BTC)
    let match_ac = Match {
        match_id: Uuid::new_v4().to_string(),
        maker_order_id: order_a.id.clone(),
        taker_order_id: order_c.id.clone(),
        instrument_id: instr_id.clone(),
        price: "50000.0".to_string(),
        quantity: "1.0".to_string(),
        taker_side: OrderSide::Buy as i32, // User C (Buy) hit User A (Sell)
        matched_at: 1234567890,
    };
    ctx.settlement_api
        .commit(Request::new(CommitRequest {
            matches: vec![match_ac],
            tenant_id: ctx.tenant_id.to_string(),
        }))
        .await
        .expect("Failed to commit trade A-C");

    // Match B and C (1 BTC)
    let match_bc = Match {
        match_id: Uuid::new_v4().to_string(),
        maker_order_id: order_b.id.clone(),
        taker_order_id: order_c.id.clone(),
        instrument_id: instr_id.clone(),
        price: "50000.0".to_string(),
        quantity: "1.0".to_string(),
        taker_side: OrderSide::Buy as i32,
        matched_at: 1234567891,
    };
    ctx.settlement_api
        .commit(Request::new(CommitRequest {
            matches: vec![match_bc],
            tenant_id: ctx.tenant_id.to_string(),
        }))
        .await
        .expect("Failed to commit trade B-C");

    // Verify All Filled
    let open_orders = ctx
        .order_api
        .get_open_orders(Request::new(GetOpenOrdersRequest::default()))
        .await
        .unwrap()
        .into_inner()
        .orders;
    assert!(
        !open_orders.iter().any(|o| o.id.to_string() == order_a.id),
        "Order A should be filled"
    );
    assert!(
        !open_orders.iter().any(|o| o.id.to_string() == order_b.id),
        "Order B should be filled"
    );
    assert!(
        !open_orders.iter().any(|o| o.id.to_string() == order_c.id),
        "Order C should be filled"
    );
}
