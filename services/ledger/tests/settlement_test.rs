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

    // 2. Setup Wallets
    // Buyer: 100k USD, 50k Locked
    ctx.create_wallet(ctx.account_a, "USD", 50000.0, 50000.0, 100000.0);
    // Buyer: 0 BTC
    ctx.create_wallet(ctx.account_a, "BTC", 0.0, 0.0, 0.0);
    // Seller: 0 USD
    ctx.create_wallet(ctx.account_b, "USD", 0.0, 0.0, 0.0);
    // Seller: 2 BTC, 1 Locked
    ctx.create_wallet(ctx.account_b, "BTC", 1.0, 1.0, 2.0);

    // 3. Setup Orders
    let buy_order = ctx.create_order(ctx.account_a, "buy", 50000.0, 1.0);
    let sell_order = ctx.create_order(ctx.account_b, "sell", 50000.0, 1.0);

    // 4. Initialize Services
    let (settlement_service, wallet_service) = ctx.init_test_services();

    // 5. Create Trade
    let trade = ctx.create_trade(buy_order.id, sell_order.id, 50000.0, 1.0);

    // 6. Process Trade
    settlement_service.process_trade_event(trade.clone()).await.unwrap();

    // 7. Verify Wallets
    let b_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), "USD").await.unwrap().unwrap();
    // 50k trade + 50 USD fee (0.1%)
    // Fee comes from available (50000 start) -> 50000 - 50 = 49950
    assert_decimal_eq!(b_usd.available, "49950"); 
    assert_decimal_eq!(b_usd.locked, "0"); 
    assert_decimal_eq!(b_usd.total, "49950"); 

    let b_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), "BTC").await.unwrap().unwrap();
    assert_decimal_eq!(b_btc.available, "1"); 
    assert_decimal_eq!(b_btc.locked, "0");
    assert_decimal_eq!(b_btc.total, "1");

    let s_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), "USD").await.unwrap().unwrap();
    assert_decimal_eq!(s_usd.available, "50000"); 
    assert_decimal_eq!(s_usd.locked, "0");
    assert_decimal_eq!(s_usd.total, "50000");

    let s_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), "BTC").await.unwrap().unwrap();
    assert_decimal_eq!(s_btc.available, "1"); 
    assert_decimal_eq!(s_btc.locked, "0"); 
    assert_decimal_eq!(s_btc.total, "1");

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
    ctx.create_wallet(ctx.account_a, "USD", 0.0, 100000.0, 100000.0);
    ctx.create_wallet(ctx.account_a, "BTC", 0.0, 0.0, 0.0);

    // Seller selling 1 BTC
    ctx.create_wallet(ctx.account_b, "USD", 0.0, 0.0, 0.0);
    ctx.create_wallet(ctx.account_b, "BTC", 0.0, 1.0, 1.0);

    let buy_order = ctx.create_order(ctx.account_a, "buy", 50000.0, 2.0);
    let sell_order = ctx.create_order(ctx.account_b, "sell", 50000.0, 1.0);

    let (settlement_service, wallet_service) = ctx.init_test_services();

    let trade = ctx.create_trade(buy_order.id, sell_order.id, 50000.0, 1.0);

    settlement_service.process_trade_event(trade.clone()).await.unwrap();

    // Verify Buyer Wallet (Partial Fill)
    let b_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), "USD").await.unwrap().unwrap();
    // 50k used (trade) -> 100k - 50k = 50k locked
    // Fee 50 USD deducted from available (0) -> -50
    // Total = 50k (locked) - 50 (available) = 49950
    assert_decimal_eq!(b_usd.locked, "50000"); 
    assert_decimal_eq!(b_usd.available, "-50");
    assert_decimal_eq!(b_usd.total, "49950"); 

    let b_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), "BTC").await.unwrap().unwrap();
    assert_decimal_eq!(b_btc.available, "1");
    assert_decimal_eq!(b_btc.total, "1");

    // Verify Seller Wallet (Fully filled)
    let s_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), "BTC").await.unwrap().unwrap();
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
    ctx.create_wallet(ctx.account_a, "USD", 0.0, 0.0, 0.0);
    ctx.create_wallet(ctx.account_a, "BTC", 0.0, 0.0, 0.0);

    // Seller has 1 BTC
    ctx.create_wallet(ctx.account_b, "USD", 0.0, 0.0, 0.0);
    ctx.create_wallet(ctx.account_b, "BTC", 1.0, 1.0, 2.0);

    let buy_order = ctx.create_order(ctx.account_a, "buy", 50000.0, 1.0);
    let sell_order = ctx.create_order(ctx.account_b, "sell", 50000.0, 1.0);

    let (settlement_service, wallet_service) = ctx.init_test_services();

    let trade = ctx.create_trade(buy_order.id, sell_order.id, 50000.0, 1.0);

    // This should succeed technically, but result in negative balance
    settlement_service.process_trade_event(trade.clone()).await.unwrap();

    let b_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), "USD").await.unwrap().unwrap();
    
    // Expect negative balance because we didn't enforce non-negative
    // This confirms the current behavior
    assert_decimal_eq!(b_usd.locked, "-50000"); 
    assert_decimal_eq!(b_usd.available, "-50"); // Fee
    assert_decimal_eq!(b_usd.total, "-50050"); // 50000 + 50

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
    ctx.create_wallet(ctx.account_a, "USD", 1000.0, 100000.0, 101000.0);
    // Buyer: 0 BTC
    ctx.create_wallet(ctx.account_a, "BTC", 0.0, 0.0, 0.0);

    // Seller: 0 USD
    ctx.create_wallet(ctx.account_b, "USD", 0.0, 0.0, 0.0);
    // Seller: 2 BTC, 2 Locked
    ctx.create_wallet(ctx.account_b, "BTC", 0.0, 2.0, 2.0);

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
    let b_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), "USD").await.unwrap().unwrap();
    // 100k used (2 trades) + 100 USD fee (50 * 2)
    // Available: 1000 - 100 = 900
    // Locked: 100000 - 100000 = 0
    assert_decimal_eq!(b_usd.available, "900"); 
    assert_decimal_eq!(b_usd.locked, "0"); 
    assert_decimal_eq!(b_usd.total, "900"); 

    let b_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_a.to_string(), "BTC").await.unwrap().unwrap();
    assert_decimal_eq!(b_btc.available, "2"); 
    assert_decimal_eq!(b_btc.total, "2");

    let s_usd = wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), "USD").await.unwrap().unwrap();
    assert_decimal_eq!(s_usd.available, "100000"); 
    assert_decimal_eq!(s_usd.total, "100000");

    let s_btc = wallet_service.get_wallet_by_account_and_asset(&ctx.account_b.to_string(), "BTC").await.unwrap().unwrap();
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
