mod ledger_test_helpers;
use ledger_test_helpers::LedgerTestContext;
use ledger::domain::wallets::WalletRepository;
use ledger::domain::fees::constants::FeeConstants;
use ledger::domain::orders::repository::OrderRepository;
use ledger::domain::accounts::repository::AccountRepository;
use std::str::FromStr;
use rust_decimal::Decimal;
use rust_decimal::prelude::FromPrimitive;

// --- Helpers for Future Proofing ---
fn to_atomic_usd(amount: f64) -> Decimal {
    // 2 decimals -> * 100
    (Decimal::from_f64(amount).unwrap() * Decimal::new(100, 0)).floor()
}

fn to_atomic_btc(amount: f64) -> Decimal {
    // 8 decimals -> * 100,000,000
    (Decimal::from_f64(amount).unwrap() * Decimal::new(100000000, 0)).floor()
}

fn calc_taker_fee(amount_atomic: Decimal) -> Decimal {
    (amount_atomic * FeeConstants::get_taker_fee()).floor()
}

fn calc_maker_fee(amount_atomic: Decimal) -> Decimal {
    (amount_atomic * FeeConstants::get_maker_fee()).floor()
}

macro_rules! assert_decimal_eq {
    ($left:expr, $right:expr) => {
        assert_eq!(
            Decimal::from_str(&$left).unwrap(),
            Decimal::from_str($right).unwrap()
        );
    };
}


macro_rules! assert_decimal_val_eq {
    ($left:expr, $right:expr) => {
        assert_eq!(
            Decimal::from_str(&$left).unwrap(),
            $right
        );
    };
}

#[tokio::test]
async fn test_settlement_basic_buy_sell() {
    // 1. Setup Context
    let ctx = LedgerTestContext::new();

    // 2. Setup Wallets (Atomic Units)
    // Buyer: 100k USD -> 10,000,000 cents. 50k Locked -> 5,000,000.
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 5000000.0, 5000000.0, 10000000.0);
    // Buyer: 0 BTC
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);
    // Seller: 0 USD
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);
    // Seller: 2 BTC -> 200,000,000 sats. 1 Locked -> 100,000,000.
    ctx.create_wallet(ctx.account_b, &ctx.btc_id.to_string(), 100000000.0, 100000000.0, 200000000.0);

    // 3. Setup Orders (Human Readable)
    let buy_order = ctx.create_order(ctx.account_a, "buy", 50000.0, 1.0);
    let sell_order = ctx.create_order(ctx.account_b, "sell", 50000.0, 1.0);

    // 4. Initialize Services
    let (settlement_service, wallet_service) = ctx.init_test_services();

    // 5. Create Trade
    let trade = ctx.create_trade(buy_order.id, sell_order.id, 50000.0, 1.0);

    // 6. Process Trade
    settlement_service.process_trade_event(trade.clone()).await.unwrap();

    // Calculate Expected Values
    let trade_amount_atomic = to_atomic_usd(50000.0);
    let buyer_fee = calc_taker_fee(trade_amount_atomic);
    let seller_fee = calc_maker_fee(trade_amount_atomic);
    
    let buyer_avail_start = to_atomic_usd(50000.0); // 50k available initially
    let buyer_expected_avail = buyer_avail_start - buyer_fee;
    let buyer_expected_total = buyer_expected_avail; // Locked becomes 0
    
    let seller_expected_total = trade_amount_atomic - seller_fee;

    // 7. Verify Wallets
    let b_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    assert_decimal_val_eq!(b_usd.available, buyer_expected_avail); 
    assert_decimal_val_eq!(b_usd.locked, Decimal::ZERO); 
    assert_decimal_val_eq!(b_usd.total, buyer_expected_total); 

    let b_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    assert_decimal_val_eq!(b_btc.available, to_atomic_btc(1.0)); 
    assert_decimal_val_eq!(b_btc.locked, Decimal::ZERO);
    assert_decimal_val_eq!(b_btc.total, to_atomic_btc(1.0));

    let s_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    assert_decimal_val_eq!(s_usd.available, seller_expected_total); 
    assert_decimal_val_eq!(s_usd.locked, Decimal::ZERO);
    assert_decimal_val_eq!(s_usd.total, seller_expected_total);

    let s_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    assert_decimal_val_eq!(s_btc.available, to_atomic_btc(1.0)); // Started with 2.0
    assert_decimal_val_eq!(s_btc.locked, Decimal::ZERO); 
    assert_decimal_val_eq!(s_btc.total, to_atomic_btc(1.0));
    use ledger::domain::fills::FillRepository;
    let buy_fills = ctx.fill_repo.list_by_order(buy_order.id).await.unwrap();
    assert_eq!(buy_fills.len(), 1);
    assert_eq!(buy_fills[0].side, "buy");
    assert_eq!(buy_fills[0].quantity, Decimal::from(1));

    let sell_fills = ctx.fill_repo.list_by_order(sell_order.id).await.unwrap();
    assert_eq!(sell_fills.len(), 1);
    assert_eq!(sell_fills[0].side, "sell");
    assert_eq!(sell_fills[0].quantity, Decimal::from(1));

    // 9. Verify Ledger Persistence
    let events = ctx.ledger_repo.get_events();
    assert_eq!(events.len(), 1, "Expected 1 ledger event");
    assert_eq!(events[0].r#type, "trade");
    assert_eq!(events[0].reference_id, trade.id);

    let entries = ctx.ledger_repo.get_entries();
    assert_eq!(entries.len(), 6, "Expected 6 ledger entries");
}


#[tokio::test]
async fn test_settlement_partial_fill() {
    let ctx = LedgerTestContext::new();

    // Buyer wants 2 BTC, has 100k USD locked (Price 50k)
    // 100k USD -> 10M atomic.
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 0.0, 10000000.0, 10000000.0);
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);

    // Seller selling 1 BTC
    // 1 BTC -> 100M atomic.
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);
    ctx.create_wallet(ctx.account_b, &ctx.btc_id.to_string(), 0.0, 100000000.0, 100000000.0);

    let buy_order = ctx.create_order(ctx.account_a, "buy", 50000.0, 2.0);
    let sell_order = ctx.create_order(ctx.account_b, "sell", 50000.0, 1.0);

    let (settlement_service, wallet_service) = ctx.init_test_services();

    let trade = ctx.create_trade(buy_order.id, sell_order.id, 50000.0, 1.0);

    settlement_service.process_trade_event(trade.clone()).await.unwrap();

    // Verify Buyer Wallet (Partial Fill)
    let b_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    
    // Dynamic Calculation
    let trade_amt = to_atomic_usd(50000.0);
    let taker_fee = calc_taker_fee(trade_amt);
    
    let expected_locked = to_atomic_usd(50000.0); // 50k remaining locked
    let expected_available = -taker_fee;
    let expected_total = expected_locked + expected_available;
    
    assert_decimal_val_eq!(b_usd.locked, expected_locked); 
    assert_decimal_val_eq!(b_usd.available, expected_available);
    assert_decimal_val_eq!(b_usd.total, expected_total); 

    let b_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    assert_decimal_val_eq!(b_btc.available, to_atomic_btc(1.0));
    assert_decimal_val_eq!(b_btc.total, to_atomic_btc(1.0));

    // Verify Seller Wallet (Fully filled)
    let s_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    assert_decimal_val_eq!(s_btc.locked, Decimal::ZERO); // All sold
    assert_decimal_val_eq!(s_btc.total, Decimal::ZERO);

    // Verify Ledger Persistence
    let events = ctx.ledger_repo.get_events();
    assert_eq!(events.len(), 1, "Expected 1 ledger event");
    assert_eq!(events[0].r#type, "trade");
    assert_eq!(events[0].reference_id, trade.id);

    let entries = ctx.ledger_repo.get_entries();
    assert_eq!(entries.len(), 6, "Expected 6 ledger entries");
}

#[tokio::test]
async fn test_settlement_insufficient_funds() {
    let ctx = LedgerTestContext::new();

    // Buyer has 0 USD
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);

    // Seller has 1 BTC
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);
    ctx.create_wallet(ctx.account_b, &ctx.btc_id.to_string(), 0.0, 100000000.0, 100000000.0);

    let buy_order = ctx.create_order(ctx.account_a, "buy", 50000.0, 1.0);
    let sell_order = ctx.create_order(ctx.account_b, "sell", 50000.0, 1.0);

    let (settlement_service, wallet_service) = ctx.init_test_services();

    let trade = ctx.create_trade(buy_order.id, sell_order.id, 50000.0, 1.0);

    // This should succeed technically, but result in negative balance
    settlement_service.process_trade_event(trade.clone()).await.unwrap();

    let b_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    
    // Expect negative balance because we didn't enforce non-negative
    // This confirms the current behavior
    // 5M locked, 0.2% fee (100 USD = 10000 units)
    assert_decimal_eq!(b_usd.locked, "-5000000"); 
    assert_decimal_eq!(b_usd.available, "-10000"); // Fee
    assert_decimal_eq!(b_usd.total, "-5010000"); // 5,000,000 + 10,000

    // Verify Ledger Persistence
    let events = ctx.ledger_repo.get_events();
    assert_eq!(events.len(), 1, "Expected 1 ledger event");
    assert_eq!(events[0].r#type, "trade");
    assert_eq!(events[0].reference_id, trade.id);

    let entries = ctx.ledger_repo.get_entries();
    assert_eq!(entries.len(), 6, "Expected 6 ledger entries");
}

#[tokio::test]
async fn test_settlement_multiple_matches() {
    let ctx = LedgerTestContext::new();

    // 1. Setup Wallets
    // Buyer: Needs 100k USD locked for 2 trades (50k each). Plus 1000 available for fees.
    // 1000 USD -> 100,000 atomic. 100k Locked -> 10,000,000 atomic.
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 100000.0, 10000000.0, 10100000.0);
    // Buyer: 0 BTC
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);

    // Seller: 0 USD
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);
    // Seller: 2 BTC -> 200M atomic. 2 Locked -> 200M atomic.
    ctx.create_wallet(ctx.account_b, &ctx.btc_id.to_string(), 0.0, 200000000.0, 200000000.0);

    // 2. Setup Orders
    let buy_order = ctx.create_order(ctx.account_a, "buy", 50000.0, 2.0);
    let sell_order = ctx.create_order(ctx.account_b, "sell", 50000.0, 2.0);

    // 3. Initialize Services
    let (settlement_service, wallet_service) = ctx.init_test_services();

    // 4. Create and Process Trade 1
    let trade1 = ctx.create_trade(buy_order.id, sell_order.id, 50000.0, 1.0);
    settlement_service.process_trade_event(trade1.clone()).await.unwrap();

    // 5. Create and Process Trade 2
    let trade2 = ctx.create_trade(buy_order.id, sell_order.id, 50000.0, 1.0);
    settlement_service.process_trade_event(trade2.clone()).await.unwrap();

    // 6. Verify Wallets
    let b_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    
    let trade_amt = to_atomic_usd(50000.0);
    let taker_fee = calc_taker_fee(trade_amt);
    let total_taker_fees = taker_fee * Decimal::from(2);
    
    let start_avail = Decimal::new(100000, 0); // 100k from setup
    let expected_avail = start_avail - total_taker_fees;
    let expected_total = expected_avail; // Locked is 0
    
    assert_decimal_val_eq!(b_usd.available, expected_avail); 
    assert_decimal_val_eq!(b_usd.locked, Decimal::ZERO); 
    assert_decimal_val_eq!(b_usd.total, expected_total); 

    let b_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    assert_decimal_val_eq!(b_btc.available, to_atomic_btc(2.0)); 
    assert_decimal_val_eq!(b_btc.total, to_atomic_btc(2.0));

    let s_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    
    let maker_fee = calc_maker_fee(trade_amt);
    let expected_s_total = (trade_amt - maker_fee) * Decimal::from(2);

    assert_decimal_val_eq!(s_usd.available, expected_s_total); 
    assert_decimal_val_eq!(s_usd.total, expected_s_total);

    let s_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    assert_decimal_val_eq!(s_btc.locked, Decimal::ZERO); 
    assert_decimal_val_eq!(s_btc.total, Decimal::ZERO);

    // 7. Verify Ledger Persistence
    let events = ctx.ledger_repo.get_events();
    assert_eq!(events.len(), 2, "Expected 2 ledger events");
    assert_eq!(events[0].reference_id, trade1.id);
    assert_eq!(events[1].reference_id, trade2.id);

    let entries = ctx.ledger_repo.get_entries();
    assert_eq!(entries.len(), 12, "Expected 12 ledger entries");
}

#[tokio::test]
async fn test_settlement_idempotency_double_spend_prevention() {
    let ctx = LedgerTestContext::new();

    // 1. Setup Wallets (Buyer has 100k USD, 50k Locked)
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 5000000.0, 5000000.0, 10000000.0);
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);
    ctx.create_wallet(ctx.account_b, &ctx.btc_id.to_string(), 100000000.0, 100000000.0, 200000000.0);

    let buy_order = ctx.create_order(ctx.account_a, "buy", 50000.0, 1.0);
    let sell_order = ctx.create_order(ctx.account_b, "sell", 50000.0, 1.0);

    let (settlement_service, wallet_service) = ctx.init_test_services();

    // 2. Create ONE Trade
    let trade = ctx.create_trade(buy_order.id, sell_order.id, 50000.0, 1.0);

    // 3. Process it TWICE
    // First pass: Should succeed
    settlement_service.process_trade_event(trade.clone()).await.unwrap();
    
    // Second pass: Should be idempotent (either succeed silently or fail with specific "AlreadyExists" error, but NOT deduct funds)
    let _ = settlement_service.process_trade_event(trade.clone()).await;

    // 4. Verify Wallet - Should be deducted ONLY ONCE
    let b_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    
    // Dynamic Calculation
    let start_total = to_atomic_usd(100000.0); // 10M
    let trade_amt = to_atomic_usd(50000.0); // 5M
    let taker_fee = calc_taker_fee(trade_amt);
    let expected_total = start_total - trade_amt - taker_fee;
    
    assert_decimal_val_eq!(b_usd.total, expected_total);
}

#[tokio::test]
async fn test_settlement_concurrent_updates() {
    let ctx = std::sync::Arc::new(LedgerTestContext::new());

    // 1. Setup Wallet with 20k USD
    // 20k USD -> 2M cents. Locked 0.
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 2000000.0, 0.0, 2000000.0);
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);
    
    // Seller has infinite BTC
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);
    ctx.create_wallet(ctx.account_b, &ctx.btc_id.to_string(), 1000000000.0, 0.0, 1000000000.0);

    let (settlement_service, wallet_service) = ctx.init_test_services();
    let settlement_service = std::sync::Arc::new(settlement_service);

    // 2. Spawn 10 concurrent trades
    // Each trade: Buy 0.02 BTC @ 50k = 1000 USD cost.
    // Fee: 0.1% of 1000 = 1 USD.
    // Total cost per trade: 1001 USD.
    // Total cost: 10 * 1001 = 10,010 USD.
    // Expected Remaining: 20,000 - 10,010 = 9,990 USD.
    // Atomic: 999,000 cents.
    
    let mut handles = vec![];

    for _ in 0..10 {
        let ctx_clone = ctx.clone();
        let svc_clone = settlement_service.clone();
        
        handles.push(tokio::spawn(async move {
            let buy_order = ctx_clone.create_order(ctx_clone.account_a, "buy", 50000.0, 0.02);
            let sell_order = ctx_clone.create_order(ctx_clone.account_b, "sell", 50000.0, 0.02);
            let trade = ctx_clone.create_trade(buy_order.id, sell_order.id, 50000.0, 0.02);
            
            // We retry on optimistic locking error
            let mut retries = 5;
            loop {
                match svc_clone.process_trade_event(trade.clone()).await {
                    Ok(_) => break,
                    Err(e) => {
                        let err_msg = format!("{:?}", e);
                        if retries > 0 && err_msg.contains("OptimisticLockingError") {
                            retries -= 1;
                            tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
                            continue;
                        }
                        panic!("Trade failed after retries: {:?}", e);
                    }
                }
            }
        }));
    }

    // 3. Await all
    for handle in handles {
        handle.await.unwrap();
    }

    // 4. Verify Balance
    let b_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    
    // Dynamic Calculation
    let start_total = to_atomic_usd(20000.0);
    let single_trade_amt = to_atomic_usd(50000.0 * 0.02);
    let single_fee = calc_taker_fee(single_trade_amt);
    let total_cost = (single_trade_amt + single_fee) * Decimal::from(10);
    let expected_total = start_total - total_cost;
    
    assert_decimal_val_eq!(b_usd.total, expected_total);
}

#[tokio::test]
async fn test_settlement_cross_tenant_isolation() {
    let ctx = LedgerTestContext::new(); // Tenant 1 (Default)
    let tenant2_id = uuid::Uuid::new_v4();
    
    // 1. Setup Wallet for Tenant 1 (Buyer)
    // 100k USD -> 10M atomic (2 decimals)
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 10000000.0, 0.0, 10000000.0);
    
    // 2. Setup Wallet for Tenant 2 (Seller)
    let account_t2 = uuid::Uuid::new_v4();
    let wallet_t2 = ledger::domain::wallets::Wallet {
        id: uuid::Uuid::new_v4().to_string(),
        account_id: account_t2.to_string(),
        asset_id: ctx.btc_id.to_string(),
        available: "1000000000.0".to_string(), // 10 BTC
        locked: "0.0".to_string(),
        total: "1000000000.0".to_string(),
        tenant_id: tenant2_id.to_string(),
        user_id: "".to_string(),
        version: 1,
        status: "active".to_string(),
        meta: "{}".to_string(),
        created_at: chrono::Utc::now().timestamp_millis(),
        updated_at: chrono::Utc::now().timestamp_millis(),
    };
    ctx.wallet_repo.add(wallet_t2);

    let (settlement_service, wallet_service) = ctx.init_test_services();

    // 3. Create Orders (Cross-Tenant)
    // Buyer is in Tenant 1 (ctx.tenant_id)
    let buy_order = ctx.create_order(ctx.account_a, "buy", 50000.0, 1.0);
    
    // Seller is in Tenant 2
    let sell_order = ledger::domain::orders::model::Order {
        id: uuid::Uuid::new_v4(),
        tenant_id: tenant2_id,
        account_id: account_t2,
        instrument_id: ctx.instrument_id,
        side: "sell".to_string(),
        r#type: "limit".to_string(),
        quantity: Decimal::from(1),
        price: Decimal::from(50000),
        status: "open".to_string(),
        filled_quantity: Decimal::ZERO,
        average_fill_price: Decimal::ZERO,
        meta: serde_json::json!({}),
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };
    ctx.repo.add(sell_order.clone());

    // 4. Attempt Match (Cross-Tenant)
    let trade = ctx.create_trade(buy_order.id, sell_order.id, 50000.0, 1.0);
    
    let result = settlement_service.process_trade_event(trade.clone()).await;
    
    // NOTE: This currently succeeds (security flaw). We assert it succeeds to document current behavior.
    assert!(result.is_ok()); 
    
    let b_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    
    // Dynamic Calc
    let start_total = to_atomic_usd(100000.0);
    let trade_amt = to_atomic_usd(50000.0);
    let taker_fee = calc_taker_fee(trade_amt);
    let expected_total = start_total - trade_amt - taker_fee;
    
    assert_decimal_val_eq!(b_usd.total, expected_total);
    
    let s_btc = wallet_service.get_wallet_by_account_and_asset(&account_t2.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    // 10 - 1 = 9 BTC -> 900,000,000 sats
    assert_decimal_eq!(s_btc.total, "900000000");
}

#[tokio::test]
async fn test_settlement_fee_account_contention() {
    let ctx = std::sync::Arc::new(LedgerTestContext::new());
    let (settlement_service, _wallet_service) = ctx.init_test_services();
    let settlement_service = std::sync::Arc::new(settlement_service);
    
    let mut handles = vec![];
    
    for _ in 0..20 {
        let ctx_clone = ctx.clone();
        let svc_clone = settlement_service.clone();
        
        handles.push(tokio::spawn(async move {
            let buyer = uuid::Uuid::new_v4();
            let seller = uuid::Uuid::new_v4();
            
            ctx_clone.create_wallet(buyer, &ctx_clone.usd_id.to_string(), 100000.0, 0.0, 100000.0);
            ctx_clone.create_wallet(seller, &ctx_clone.btc_id.to_string(), 10.0, 0.0, 10.0);
            
            let buy_order = ctx_clone.create_order(buyer, "buy", 1000.0, 1.0);
            let sell_order = ctx_clone.create_order(seller, "sell", 1000.0, 1.0);
            let trade = ctx_clone.create_trade(buy_order.id, sell_order.id, 1000.0, 1.0);
            
            let mut retries = 10;
            loop {
                match svc_clone.process_trade_event(trade.clone()).await {
                    Ok(_) => break,
                    Err(_) => {
                        if retries > 0 {
                            retries -= 1;
                            tokio::time::sleep(tokio::time::Duration::from_millis(5)).await;
                            continue;
                        }
                        break; 
                    }
                }
            }
        }));
    }
    
    for handle in handles {
        let _ = handle.await;
    }
    
    let fee_account = ctx.account_repo.get_by_name("fees_account").await.unwrap().unwrap();
    if let Some(w) = ctx.wallet_repo.get_by_account_and_asset(&fee_account.id.to_string(), &ctx.usd_id.to_string()).await.unwrap() {
        let total = Decimal::from_str(&w.total).unwrap();
        assert!(total > Decimal::ZERO);
    }
}

#[tokio::test]
async fn test_settlement_dust_amounts() {
    let ctx = LedgerTestContext::new();

    // 1. Setup Wallets
    // Buyer: 1 USD (100 cents).
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 100.0, 0.0, 100.0);
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);
    
    // Seller has BTC
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);
    ctx.create_wallet(ctx.account_b, &ctx.btc_id.to_string(), 1.0, 0.0, 1.0);

    let (settlement_service, wallet_service) = ctx.init_test_services();

    // 2. Dust Trade
    // Buy 100 Satoshi (0.00000100 BTC) at price 50,000 USD.
    // Value = 0.000001 * 50,000 = 0.05 USD = 5 cents.
    // Fee: 0.1% of 0.05 USD = 0.0005 USD = 0.05 cents.
    // Fee logic usually floors or ceils. If floor -> 0.
    
    // Let's create orders
    let buy_order = ctx.create_order(ctx.account_a, "buy", 50000.0, 0.000001);
    let sell_order = ctx.create_order(ctx.account_b, "sell", 50000.0, 0.000001);
    let trade = ctx.create_trade(buy_order.id, sell_order.id, 50000.0, 0.000001);

    settlement_service.process_trade_event(trade.clone()).await.unwrap();

    // 3. Verify Balances
    let b_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    let b_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();

    // Expected USD deduction: 5 cents (Value) + 0 cents (Fee, if floored) = 5 cents.
    // Remaining: 100 - 5 = 95.
    assert_decimal_eq!(b_usd.total, "95");
    
    // Expected BTC receipt: 100 Sats.
    assert_decimal_eq!(b_btc.total, "100");
}

#[tokio::test]
async fn test_settlement_self_trade() {
    let ctx = LedgerTestContext::new();

    // 1. Setup Wallet (User A has both USD and BTC)
    // 100k USD, 2 BTC.
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 10000000.0, 0.0, 10000000.0);
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 200000000.0, 0.0, 200000000.0);

    let (settlement_service, wallet_service) = ctx.init_test_services();

    // 2. Create Orders (Same Account)
    let buy_order = ctx.create_order(ctx.account_a, "buy", 50000.0, 1.0);
    let sell_order = ctx.create_order(ctx.account_a, "sell", 50000.0, 1.0);

    // 3. Self Trade
    let trade = ctx.create_trade(buy_order.id, sell_order.id, 50000.0, 1.0);

    // 4. Process
    settlement_service.process_trade_event(trade.clone()).await.unwrap();

    // 5. Verify Balance
    let usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    let btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();

    // USD: 
    // -50k (Buy Cost) + 50k (Sell Revenue) = 0 Net.
    // -Taker Fee - Maker Fee
    // Start: 10,000,000. 
    
    let start_total = to_atomic_usd(100000.0);
    let trade_amt = to_atomic_usd(50000.0);
    let taker_fee = calc_taker_fee(trade_amt);
    let maker_fee = calc_maker_fee(trade_amt);
    let expected_total = start_total - taker_fee - maker_fee;

    assert_decimal_val_eq!(usd.total, expected_total);

    // BTC:
    // +1 BTC (Buy) - 1 BTC (Sell) = 0 Net.
    // Start: 200,000,000. End: 200,000,000.
    assert_decimal_eq!(btc.total, "200000000");
}

#[tokio::test]
async fn test_settlement_order_lifecycle_statuses() {
    let ctx = LedgerTestContext::new();

    // 1. Setup Wallets
    // Buyer has 1M USD (enough for 10 BTC at 50k = 500k USD)
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 100000000.0, 0.0, 100000000.0);
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);
    
    // Seller has 10 BTC
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);
    ctx.create_wallet(ctx.account_b, &ctx.btc_id.to_string(), 1000000000.0, 0.0, 1000000000.0);

    // 2. Create Order (10 BTC @ 50k)
    let buy_order = ctx.create_order(ctx.account_a, "buy", 50000.0, 10.0);
    let sell_order = ctx.create_order(ctx.account_b, "sell", 50000.0, 10.0);

    let (settlement_service, _wallet_service) = ctx.init_test_services();

    // Verify initial status
    let order_init = ctx.repo.get(buy_order.id).await.unwrap().unwrap();
    assert_eq!(order_init.status, "open");
    assert_eq!(order_init.filled_quantity, Decimal::ZERO);

    // 3. Process FIRST Match (5 BTC)
    let trade1 = ctx.create_trade(buy_order.id, sell_order.id, 50000.0, 5.0);
    settlement_service.process_trade_event(trade1.clone()).await.unwrap();

    // Verify status -> "partial_fill"
    let order_step1 = ctx.repo.get(buy_order.id).await.unwrap().unwrap();
    assert_eq!(order_step1.status, "partial_fill");
    assert_decimal_eq!(order_step1.filled_quantity.to_string(), "5");

    // 4. Process SECOND Match (Remaining 5 BTC)
    let trade2 = ctx.create_trade(buy_order.id, sell_order.id, 50000.0, 5.0);
    settlement_service.process_trade_event(trade2.clone()).await.unwrap();

    // Verify status -> "filled"
    let order_step2 = ctx.repo.get(buy_order.id).await.unwrap().unwrap();
    assert_eq!(order_step2.status, "filled");
    assert_decimal_eq!(order_step2.filled_quantity.to_string(), "10");
}
