use rust_decimal::Decimal;
use std::str::FromStr;

mod ledger_test_helpers;
use ledger_test_helpers::LedgerTestContext;

macro_rules! assert_decimal_eq {
    ($left:expr, $right:expr) => {
        assert_eq!(
            Decimal::from_str(&$left).unwrap(),
            Decimal::from_str($right).unwrap()
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

    // 7. Verify Wallets
    let b_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    // 50k trade (5M atomic) + 50 USD fee (5000 atomic)
    // Fee comes from available (5M start) -> 5M - 5000 = 4,995,000
    assert_decimal_eq!(b_usd.available, "4995000"); 
    assert_decimal_eq!(b_usd.locked, "0"); 
    assert_decimal_eq!(b_usd.total, "4995000"); 

    let b_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    assert_decimal_eq!(b_btc.available, "100000000"); 
    assert_decimal_eq!(b_btc.locked, "0");
    assert_decimal_eq!(b_btc.total, "100000000");

    let s_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    assert_decimal_eq!(s_usd.available, "5000000"); 
    assert_decimal_eq!(s_usd.locked, "0");
    assert_decimal_eq!(s_usd.total, "5000000");

    let s_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    assert_decimal_eq!(s_btc.available, "100000000"); 
    assert_decimal_eq!(s_btc.locked, "0"); 
    assert_decimal_eq!(s_btc.total, "100000000");

    // 8. Verify Fills
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
    // 50k used (5M atomic). 10M Locked - 5M Debit = 5M Locked.
    // Fee 50 USD (5000 atomic) deducted from Available (0) -> -5000.
    // Total = 5M (locked) - 5000 (available) = 4,995,000.
    assert_decimal_eq!(b_usd.locked, "5000000"); 
    assert_decimal_eq!(b_usd.available, "-5000");
    assert_decimal_eq!(b_usd.total, "4995000"); 

    let b_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    assert_decimal_eq!(b_btc.available, "100000000");
    assert_decimal_eq!(b_btc.total, "100000000");

    // Verify Seller Wallet (Fully filled)
    let s_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    assert_decimal_eq!(s_btc.locked, "0"); // All sold
    assert_decimal_eq!(s_btc.total, "0");

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
    assert_decimal_eq!(b_usd.locked, "-5000000"); 
    assert_decimal_eq!(b_usd.available, "-5000"); // Fee
    assert_decimal_eq!(b_usd.total, "-5005000"); // 5,000,000 + 5,000

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
    // 100k used (2 trades) + 100 USD fee (50 * 2) (10,000 atomic)
    // Available: 100,000 - 10,000 = 90,000
    // Locked: 10,000,000 - 10,000,000 = 0
    assert_decimal_eq!(b_usd.available, "90000"); 
    assert_decimal_eq!(b_usd.locked, "0"); 
    assert_decimal_eq!(b_usd.total, "90000"); 

    let b_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    assert_decimal_eq!(b_btc.available, "200000000"); 
    assert_decimal_eq!(b_btc.total, "200000000");

    let s_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.usd_id.to_string()).await.unwrap().unwrap();
    assert_decimal_eq!(s_usd.available, "10000000"); 
    assert_decimal_eq!(s_usd.total, "10000000");

    let s_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), &ctx.btc_id.to_string()).await.unwrap().unwrap();
    assert_decimal_eq!(s_btc.locked, "0"); 
    assert_decimal_eq!(s_btc.total, "0");

    // 7. Verify Ledger Persistence
    let events = ctx.ledger_repo.get_events();
    assert_eq!(events.len(), 2, "Expected 2 ledger events");
    assert_eq!(events[0].reference_id, trade1.id);
    assert_eq!(events[1].reference_id, trade2.id);

    let entries = ctx.ledger_repo.get_entries();
    assert_eq!(entries.len(), 12, "Expected 12 ledger entries");
}
