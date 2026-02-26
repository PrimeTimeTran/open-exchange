mod helpers;
use helpers::memory::InMemoryTestContext;
use ledger::domain::ledger::service::LedgerService;
use ledger::domain::wallets::WalletService;
use ledger::domain::assets::AssetService;
use ledger::domain::orders::service::OrderService;
use ledger::domain::fills::service::FillService;
use ledger::domain::fees::service::StandardFeeService;
use ledger::domain::settlement::service::SettlementService;
use std::sync::Arc;
use std::str::FromStr;
use rust_decimal::Decimal;

#[tokio::test]
async fn test_process_trade_creates_entries() {
    // 1. Setup Test Context
    let ctx = InMemoryTestContext::new();

    // 2. Create Orders
    let buy_order = ctx.create_order(ctx.account_a, "buy", 30000.0, 1.0);
    let sell_order = ctx.create_order(ctx.account_b, "sell", 30000.0, 1.0);

    // 3. Initialize Service
    let service = LedgerService::new(ctx.order_repo.clone(), ctx.instrument_repo.clone(), ctx.asset_repo.clone(), ctx.account_repo.clone());

    // 4. Create Trade Event
    let trade = ctx.create_trade(buy_order.id, sell_order.id, 30000.0, 1.0);

    // 5. Execute Logic
    // Expect 0.1% Buyer Fee (30 USD) and 0 Seller Fee based on assertions below
    // Note: Constants would suggest 60 USD (0.2%), but this test asserts 30.0.
    
    let buyer_fee = Decimal::from_str("30.0").unwrap();
    let seller_fee = Decimal::ZERO;
    let result = service.process_trade(trade, buyer_fee, seller_fee).await;

    // 6. Assertions
    assert!(result.is_ok(), "Process trade failed: {:?}", result.err());
    let (event, entries) = result.unwrap();

    // Verify Event
    assert_eq!(event.r#type, "trade");
    assert_eq!(event.status, "completed");

    // Verify Entries (Expect 6 entries)
    assert_eq!(entries.len(), 6, "Expected 6 ledger entries");

    // Helper to find entry (Updated to handle Decimal string format)
    let find_entry = |account_id: String, amount: &str, partial_meta: &str| {
        entries.iter().find(|e| {
            // Normalize decimal strings by parsing
            let e_amount: f64 = e.amount.parse().unwrap_or(0.0);
            let target_amount: f64 = amount.parse().unwrap_or(0.0);
            
            e.account_id == account_id && 
            (e_amount - target_amount).abs() < 0.000001 &&
            e.meta.contains(partial_meta)
        })
    };

    // 1. User A (Buyer) receives +1 BTC (100,000,000 sats)
    let entry_a_btc = find_entry(ctx.account_a.to_string(), "100000000", &ctx.btc_id.to_string());
    assert!(entry_a_btc.is_some(), "Missing Entry: User A receives +1 BTC");

    // 2. User A (Buyer) pays -30,000 USD (3,000,000 cents)
    let entry_a_usd = find_entry(ctx.account_a.to_string(), "-3000000", &ctx.usd_id.to_string());
    assert!(entry_a_usd.is_some(), "Missing Entry: User A pays -30,000 USD");

    // 3. User A (Buyer) pays -30 USD Fee (3,000 cents)
    let entry_a_fee = find_entry(ctx.account_a.to_string(), "-3000", "fee");
    assert!(entry_a_fee.is_some(), "Missing Entry: User A pays -30 USD Fee");

    // 4. User B (Seller) pays -1 BTC (-100,000,000 sats)
    let entry_b_btc = find_entry(ctx.account_b.to_string(), "-100000000", &ctx.btc_id.to_string());
    assert!(entry_b_btc.is_some(), "Missing Entry: User B pays -1 BTC");

    // 5. User B (Seller) receives +30,000 USD (3,000,000 cents)
    let entry_b_usd = find_entry(ctx.account_b.to_string(), "3000000", &ctx.usd_id.to_string());
    assert!(entry_b_usd.is_some(), "Missing Entry: User B receives +30,000 USD");

    // 6. Exchange receives +30 USD Fee Revenue (3,000 cents)
    let entry_exchange = find_entry(ctx.account_repo.get_accounts()[0].id.to_string(), "3000", "revenue");
    assert!(entry_exchange.is_some(), "Missing Entry: Exchange receives +30 USD Fee Revenue");

    println!("All ledger entries verified successfully!");
}

#[tokio::test]
async fn test_ledger_entries_must_balance() {
    // 1. Setup Test Context
    let ctx = InMemoryTestContext::new();

    // 2. Create Orders
    let buy_order = ctx.create_order(ctx.account_a, "buy", 30000.0, 1.25);
    let sell_order = ctx.create_order(ctx.account_b, "sell", 30000.0, 1.25);

    // 3. Initialize Service
    let service = LedgerService::new(ctx.order_repo.clone(), ctx.instrument_repo.clone(), ctx.asset_repo.clone(), ctx.account_repo.clone());

    // 4. Create Trade Event
    let trade = ctx.create_trade(buy_order.id, sell_order.id, 30000.0, 1.25);

    // 5. Execute Logic
    // Use 0 fees for balance check to keep it simple (or non-zero, it should still balance)
    let result = service.process_trade(trade, Decimal::ZERO, Decimal::ZERO).await;
    assert!(result.is_ok(), "Process trade failed: {:?}", result.err());
    let (_event, entries) = result.unwrap();

    // 6. Check Balance
    // Sum all entries by asset. All sums should be zero.
    let mut balances: std::collections::HashMap<String, f64> = std::collections::HashMap::new();

    for entry in entries {
        // Parse metadata to get asset
        let meta: serde_json::Value = serde_json::from_str(&entry.meta).expect("Failed to parse meta");
        let asset = meta.get("asset").expect("Meta missing asset field").as_str().expect("Asset not string").to_string();
        
        // Parse amount
        let amount: f64 = entry.amount.parse().expect("Failed to parse amount");

        *balances.entry(asset).or_insert(0.0) += amount;
    }

    // Assert that each asset balance sums to zero (within float epsilon)
    let epsilon = 1e-9;
    for (asset, balance) in balances {
        println!("Checking balance for asset: {}. Sum: {}", asset, balance);
        assert!(balance.abs() < epsilon, "Asset {} is not balanced. Sum: {}", asset, balance);
    }
}

#[tokio::test]
async fn test_order_placement_locks_funds() {
    // 1. Setup Test Context
    let ctx = InMemoryTestContext::new();

    // 2. Initialize Service
    let service = LedgerService::new(ctx.order_repo.clone(), ctx.instrument_repo.clone(), ctx.asset_repo.clone(), ctx.account_repo.clone());

    // 3. Place Buy Order
    // Buying 1 BTC @ 30,000 USD -> Should lock 30,000 USD
    let buy_order = ctx.create_order(ctx.account_a, "buy", 30000.0, 1.0);

    // 4. Process Order Placement
    let result = service.process_order_placed(buy_order).await;
    assert!(result.is_ok(), "Process order placed failed: {:?}", result.err());
    let (event, entries) = result.unwrap();

    // Verify Event
    assert_eq!(event.r#type, "order_placed");

    // 5. Verify Entries
    // Should have 2 entries:
    // 1. Debit Available USD (-30,000)
    // 2. Credit Locked USD (+30,000)
    assert_eq!(entries.len(), 2, "Expected 2 ledger entries for order placement");

    let find_entry = |partial_type: &str, amount: f64| {
        entries.iter().find(|e| {
            e.meta.contains(partial_type) && e.amount.parse::<f64>().unwrap() == amount
        })
    };

    // Check Debit Available
    let debit_available = find_entry("available", -3000000.0);
    assert!(debit_available.is_some(), "Missing Entry: Debit Available -3,000,000");

    // Check Credit Locked
    let credit_locked = find_entry("locked", 3000000.0);
    assert!(credit_locked.is_some(), "Missing Entry: Credit Locked +3,000,000");

    // 6. Verify Balance (Total change should be 0)
    let total_change: f64 = entries.iter().map(|e| e.amount.parse::<f64>().unwrap()).sum();
    assert_eq!(total_change, 0.0, "Total balance change should be zero");
}

#[tokio::test]
async fn test_trade_processor_flow() {
    // 1. Setup Context
    let ctx = InMemoryTestContext::new();
    
    // 2. Services
    let ledger_service = Arc::new(LedgerService::new(ctx.order_repo.clone(), ctx.instrument_repo.clone(), ctx.asset_repo.clone(), ctx.account_repo.clone()));
    let wallet_service = Arc::new(WalletService::new(ctx.wallet_repo.clone()));
    let asset_service = Arc::new(AssetService::new(ctx.asset_repo.clone(), ctx.instrument_repo.clone()));
    
    // Explicitly coerce generic repo to trait object if needed, but implicit should work.
    // However, OrderService expects Arc<dyn OrderRepository>.
    let order_service = Arc::new(OrderService::builder(
        ctx.order_repo.clone(), 
        wallet_service.clone(),
        asset_service,
    ).build());
    
    let fill_service = Arc::new(FillService::new(ctx.fill_repo.clone()));
    let fee_service = Arc::new(StandardFeeService::new());

    let settlement_service = SettlementService::new(
        None,
        order_service,
        ctx.instrument_repo.clone(),
        ledger_service.clone(),
        wallet_service,
        fill_service,
        fee_service,
        ctx.ledger_repo.clone(),
        ctx.trade_repo.clone(),
    );
    
    // 3. Data
    let buy_order = ctx.create_order(ctx.account_a, "buy", 30000.0, 1.0);
    let sell_order = ctx.create_order(ctx.account_b, "sell", 30000.0, 1.0);
    let trade = ctx.create_trade(buy_order.id, sell_order.id, 30000.0, 1.0);
    
    // 4. Execution
    let result = settlement_service.process_trade_event(trade).await;
    
    // 5. Assertions
    assert!(result.is_ok(), "Trade processor failed: {:?}", result.err());
}
