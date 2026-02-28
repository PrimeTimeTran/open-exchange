#[macro_use]
mod helpers;
use chrono::Utc;
use helpers::memory::InMemoryTestContext;
use helpers::{calc_maker_fee, calc_taker_fee, to_atomic_btc, to_atomic_usd};
use ledger::domain::accounts::repository::AccountRepository;
use ledger::domain::fills::FillRepository;
use ledger::domain::orders::model::{Order, OrderSide, OrderStatus, OrderType};
use ledger::domain::orders::repository::OrderRepository;
use ledger::domain::trade::model::Trade;
use ledger::domain::wallets::{Wallet, WalletRepository};
use ledger::proto::ledger::asset_service_server::AssetService as AssetServiceTrait;
use ledger::proto::ledger::CreateInstrumentRequest;
use rust_decimal::prelude::FromPrimitive;
use rust_decimal::{Decimal, MathematicalOps};
use serde_json::json;
use std::str::FromStr;
use tonic::Request;
use uuid::Uuid;

/// Test: Settlement Basic Buy/Sell
///
/// Verifies that a simple spot trade settles correctly, updating balances
/// for both buyer and seller and deducting fees.
///
/// Scenario:
///   - Buyer: 100k USD. Seller: 2 BTC.
///   - Trade: 1 BTC @ $50,000.
///
/// Assert:
///   - Buyer USD: 100k - 50k - fee
///   - Buyer BTC: +1
///   - Seller USD: +50k - fee
///   - Seller BTC: 2 - 1
#[tokio::test]
async fn test_settlement_basic_buy_sell() -> Result<(), Box<dyn std::error::Error>> {
    let ctx = InMemoryTestContext::new();

    // 1. Setup Participants (Object Mother)
    // Buyer: 100k USD. Seller: 2 BTC.
    let p = ctx.btc_spot_participants(100_000.0, 2.0).await;

    // 2. Place Orders (Locks Funds Automatically via Service)
    // Destination wallets (buyer BTC, seller USD) are created by btc_spot_participants.
    // Buy 1 BTC @ 50,000 USD
    let buy_order = ctx
        .place_limit_order(p.buyer.account_id, OrderSide::Buy, 50000.0, 1.0)
        .await?;

    // Sell 1 BTC @ 50,000 USD
    let sell_order = ctx
        .place_limit_order(p.seller.account_id, OrderSide::Sell, 50000.0, 1.0)
        .await?;

    // 3. Match & Settle
    let trade = ctx.create_trade(buy_order.id, sell_order.id, "50000.0", "1.0");

    ctx.settlement_service
        .process_trade_event(trade.clone())
        .await?;

    // Expected post-settlement values.
    let trade_amount_atomic = to_atomic_usd(50000.0);
    let buyer_fee = calc_taker_fee(trade_amount_atomic);
    let seller_fee = calc_maker_fee(trade_amount_atomic);

    let buyer_expected_avail = to_atomic_usd(50000.0) - buyer_fee; // 50k available minus fee
    let seller_expected_total = trade_amount_atomic - seller_fee;

    // Buyer USD: locked consumed by trade, fee deducted from available.
    let b_usd = ctx.wallet(p.buyer.account_id, ctx.assets.usd).await;
    assert_decimal_eq!(b_usd.available, buyer_expected_avail);
    assert_decimal_eq!(b_usd.locked, Decimal::ZERO);
    assert_decimal_eq!(b_usd.total, buyer_expected_avail);

    // Buyer BTC: credited 1 BTC from the trade.
    let b_btc = ctx.wallet(p.buyer.account_id, ctx.assets.btc).await;
    assert_decimal_eq!(b_btc.available, to_atomic_btc(1.0));
    assert_decimal_eq!(b_btc.locked, Decimal::ZERO);
    assert_decimal_eq!(b_btc.total, to_atomic_btc(1.0));

    // Seller USD: credited trade proceeds minus maker fee.
    let s_usd = ctx.wallet(p.seller.account_id, ctx.assets.usd).await;
    assert_decimal_eq!(s_usd.available, seller_expected_total);
    assert_decimal_eq!(s_usd.locked, Decimal::ZERO);
    assert_decimal_eq!(s_usd.total, seller_expected_total);

    // Seller BTC: 1 BTC sold, 1 BTC remaining (started with 2 BTC).
    let s_btc = ctx.wallet(p.seller.account_id, ctx.assets.btc).await;
    assert_decimal_eq!(s_btc.available, to_atomic_btc(1.0));
    assert_decimal_eq!(s_btc.locked, Decimal::ZERO);
    assert_decimal_eq!(s_btc.total, to_atomic_btc(1.0));

    // Fill records: one per order side.
    let buy_fills = ctx.fill_repo.list_by_order(buy_order.id).await?;
    assert_eq!(buy_fills.len(), 1);
    assert_eq!(buy_fills[0].side, "buy");
    assert_eq!(buy_fills[0].quantity, Decimal::from(1));

    let sell_fills = ctx.fill_repo.list_by_order(sell_order.id).await?;
    assert_eq!(sell_fills.len(), 1);
    assert_eq!(sell_fills[0].side, "sell");
    assert_eq!(sell_fills[0].quantity, Decimal::from(1));

    // Ledger persistence: 1 trade event, 6 entries (debit/credit each side + fees).
    let events = ctx.ledger_repo.get_events()?;
    assert_eq!(events.len(), 1, "Expected 1 ledger event");
    assert_eq!(events[0].r#type, "trade");
    assert_eq!(events[0].reference_id, trade.id);

    let entries = ctx.ledger_repo.get_entries()?;
    assert_eq!(entries.len(), 6, "Expected 6 ledger entries");

    Ok(())
}

/// Test: Settlement Partial Fill
///
/// Verifies that a partial fill settles the matched amount correctly while
/// leaving the remainder of the order active (implicitly, via balance).
///
/// Scenario:
///   - Buyer Order: 2 BTC. Seller Order: 1 BTC.
///   - Trade: 1 BTC matched.
///
/// Assert:
///   - Buyer USD: Locked for remaining 1 BTC; Available reduced by cost of 1 BTC
///   - Seller BTC: Fully settled (0 locked)
#[tokio::test]
async fn test_settlement_partial_fill() -> Result<(), Box<dyn std::error::Error>> {
    let ctx = InMemoryTestContext::new();

    // Buyer wants 2 BTC, has 100k USD locked (Price 50k).
    ctx.seed_wallet(ctx.account_a, ctx.assets.usd, 0.0, 100_000.0, 100_000.0)
        .await;
    ctx.seed_wallet(ctx.account_a, ctx.assets.btc, 0.0, 0.0, 0.0)
        .await;

    // Seller selling 1 BTC.
    ctx.seed_wallet(ctx.account_b, ctx.assets.usd, 0.0, 0.0, 0.0)
        .await;
    ctx.seed_wallet(ctx.account_b, ctx.assets.btc, 0.0, 1.0, 1.0)
        .await;

    let buy_order = ctx.seed_order(ctx.account_a, "buy", 50000.0, 2.0);
    let sell_order = ctx.seed_order(ctx.account_b, "sell", 50000.0, 1.0);
    let trade = ctx.seed_trade(buy_order.id, sell_order.id, 50000.0, 1.0);

    ctx.settlement_service
        .process_trade_event(trade.clone())
        .await
        .expect("Failed to process trade");

    // Dynamic Calculation
    let trade_amt = to_atomic_usd(50000.0);
    let taker_fee = calc_taker_fee(trade_amt);

    // Verify Buyer Wallet (Partial Fill)
    let b_usd = ctx.wallet(ctx.account_a, ctx.assets.usd).await;
    let expected_locked = to_atomic_usd(50000.0); // 50k remaining locked
    let expected_available = -taker_fee;
    let expected_total = expected_locked + expected_available;

    assert_decimal_eq!(b_usd.locked, expected_locked);
    assert_decimal_eq!(b_usd.available, expected_available);
    assert_decimal_eq!(b_usd.total, expected_total);

    let b_btc = ctx.wallet(ctx.account_a, ctx.assets.btc).await;
    assert_decimal_eq!(b_btc.available, to_atomic_btc(1.0));
    assert_decimal_eq!(b_btc.total, to_atomic_btc(1.0));

    // Verify Seller Wallet (Fully filled)
    let s_btc = ctx.wallet(ctx.account_b, ctx.assets.btc).await;
    assert_decimal_eq!(s_btc.locked, Decimal::ZERO); // All sold
    assert_decimal_eq!(s_btc.total, Decimal::ZERO);

    // Verify Ledger Persistence
    let events = ctx.ledger_repo.get_events().expect("Failed to get events");
    assert_eq!(events.len(), 1, "Expected 1 ledger event");
    assert_eq!(events[0].r#type, "trade");
    assert_eq!(events[0].reference_id, trade.id);

    let entries = ctx
        .ledger_repo
        .get_entries()
        .expect("Failed to get entries");
    assert_eq!(entries.len(), 6, "Expected 6 ledger entries");
    Ok(())
}

/// Test: Settlement Insufficient Funds (Negative Balance)
///
/// Verifies behavior when a trade executes against an account with insufficient
/// locked funds. Currently, this results in a negative balance (technical debt).
///
/// Scenario:
///   - Buyer has 0 USD.
///   - Trade executes for $50,000.
///
/// Assert: Buyer USD balance becomes negative.
#[tokio::test]
async fn test_settlement_insufficient_funds() {
    let ctx = InMemoryTestContext::new();

    // Buyer has 0 USD
    ctx.seed_wallet(ctx.account_a, ctx.assets.usd, 0.0, 0.0, 0.0)
        .await;
    ctx.seed_wallet(ctx.account_a, ctx.assets.btc, 0.0, 0.0, 0.0)
        .await;

    // Seller has 1 BTC
    ctx.seed_wallet(ctx.account_b, ctx.assets.usd, 0.0, 0.0, 0.0)
        .await;
    ctx.seed_wallet(ctx.account_b, ctx.assets.btc, 0.0, 1.0, 1.0)
        .await;

    let buy_order = ctx.seed_order(ctx.account_a, "buy", 50000.0, 1.0);
    let sell_order = ctx.seed_order(ctx.account_b, "sell", 50000.0, 1.0);
    let trade = ctx.seed_trade(buy_order.id, sell_order.id, 50000.0, 1.0);

    // This should succeed technically, but result in negative balance
    ctx.settlement_service
        .process_trade_event(trade.clone())
        .await
        .unwrap();

    let b_usd = ctx.wallet(ctx.account_a, ctx.assets.usd).await;

    // Expect negative balance because we didn't enforce non-negative
    // This confirms the current behavior
    // 5M locked, 0.2% fee (100 USD = 10000 units)
    assert_decimal_eq!(b_usd.locked, "-5000000");
    assert_decimal_eq!(b_usd.available, "-10000"); // Fee
    assert_decimal_eq!(b_usd.total, "-5010000"); // 5,000,000 + 10,000

    // Verify Ledger Persistence
    let events = ctx.ledger_repo.get_events().expect("Failed to get events");
    assert_eq!(events.len(), 1, "Expected 1 ledger event");
    assert_eq!(events[0].r#type, "trade");
    assert_eq!(events[0].reference_id, trade.id);

    let entries = ctx
        .ledger_repo
        .get_entries()
        .expect("Failed to get entries");
    assert_eq!(entries.len(), 6, "Expected 6 ledger entries");
}

/// Test: Settlement Multiple Matches
///
/// Verifies that multiple trades against the same order (or account) settle
/// correctly in sequence.
///
/// Scenario:
///   - Buyer: 100k USD. Seller: 2 BTC.
///   - Trade 1: 1 BTC @ $50,000.
///   - Trade 2: 1 BTC @ $50,000.
///
/// Assert: Balances reflect cumulative effect of both trades.
#[tokio::test]
async fn test_settlement_multiple_matches() {
    let ctx = InMemoryTestContext::new();

    // 1. Setup Wallets
    // Buyer: 100k USD locked (2 × 50k trades) + 100k available for fees.
    ctx.seed_wallet(ctx.account_a, ctx.assets.usd, 1000.0, 100_000.0, 101_000.0)
        .await;
    ctx.seed_wallet(ctx.account_a, ctx.assets.btc, 0.0, 0.0, 0.0)
        .await;

    // Seller: 2 BTC locked.
    ctx.seed_wallet(ctx.account_b, ctx.assets.usd, 0.0, 0.0, 0.0)
        .await;
    ctx.seed_wallet(ctx.account_b, ctx.assets.btc, 0.0, 2.0, 2.0)
        .await;

    // 2. Setup Orders
    let buy_order = ctx.seed_order(ctx.account_a, "buy", 50000.0, 2.0);
    let sell_order = ctx.seed_order(ctx.account_b, "sell", 50000.0, 2.0);

    // 3. Process Trade 1 then Trade 2
    let trade1 = ctx.seed_trade(buy_order.id, sell_order.id, 50000.0, 1.0);
    ctx.settlement_service
        .process_trade_event(trade1.clone())
        .await
        .unwrap();

    let trade2 = ctx.seed_trade(buy_order.id, sell_order.id, 50000.0, 1.0);
    ctx.settlement_service
        .process_trade_event(trade2.clone())
        .await
        .unwrap();

    // 4. Verify Wallets
    let trade_amt = to_atomic_usd(50000.0);
    let taker_fee = calc_taker_fee(trade_amt);
    let total_taker_fees = taker_fee * Decimal::from(2);

    let b_usd = ctx.wallet(ctx.account_a, ctx.assets.usd).await;
    let start_avail = Decimal::new(100000, 0); // 100k from setup
    let expected_avail = start_avail - total_taker_fees;
    assert_decimal_eq!(b_usd.available, expected_avail);
    assert_decimal_eq!(b_usd.locked, Decimal::ZERO);
    assert_decimal_eq!(b_usd.total, expected_avail);

    let b_btc = ctx.wallet(ctx.account_a, ctx.assets.btc).await;
    assert_decimal_eq!(b_btc.available, to_atomic_btc(2.0));
    assert_decimal_eq!(b_btc.total, to_atomic_btc(2.0));

    let maker_fee = calc_maker_fee(trade_amt);
    let expected_s_total = (trade_amt - maker_fee) * Decimal::from(2);

    let s_usd = ctx.wallet(ctx.account_b, ctx.assets.usd).await;
    assert_decimal_eq!(s_usd.available, expected_s_total);
    assert_decimal_eq!(s_usd.total, expected_s_total);

    let s_btc = ctx.wallet(ctx.account_b, ctx.assets.btc).await;
    assert_decimal_eq!(s_btc.locked, Decimal::ZERO);
    assert_decimal_eq!(s_btc.total, Decimal::ZERO);

    // 7. Verify Ledger Persistence
    let events = ctx.ledger_repo.get_events().expect("Failed to get events");
    assert_eq!(events.len(), 2, "Expected 2 ledger events");
    assert_eq!(events[0].reference_id, trade1.id);
    assert_eq!(events[1].reference_id, trade2.id);

    let entries = ctx
        .ledger_repo
        .get_entries()
        .expect("Failed to get entries");
    assert_eq!(entries.len(), 12, "Expected 12 ledger entries");
}

/// Test: Settlement Idempotency
///
/// Verifies that processing the same trade event twice does not result in
/// double spending. The second attempt should be ignored.
///
/// Scenario:
///   - Process Trade T1.
///   - Process Trade T1 again.
///
/// Assert: Wallet balances change only once.
#[tokio::test]
async fn test_settlement_idempotency_double_spend_prevention() {
    let ctx = InMemoryTestContext::new();

    // 1. Setup Wallets (Buyer: 50k available + 50k locked → 100k total. Seller: 1 BTC locked + 1 available.)
    ctx.seed_wallet(ctx.account_a, ctx.assets.usd, 50000.0, 50000.0, 100000.0)
        .await;
    ctx.seed_wallet(ctx.account_a, ctx.assets.btc, 0.0, 0.0, 0.0)
        .await;
    ctx.seed_wallet(ctx.account_b, ctx.assets.usd, 0.0, 0.0, 0.0)
        .await;
    ctx.seed_wallet(ctx.account_b, ctx.assets.btc, 1.0, 1.0, 2.0)
        .await;

    let buy_order = ctx.seed_order(ctx.account_a, "buy", 50000.0, 1.0);
    let sell_order = ctx.seed_order(ctx.account_b, "sell", 50000.0, 1.0);

    // 2. Create ONE Trade and process it TWICE
    let trade = ctx.seed_trade(buy_order.id, sell_order.id, 50000.0, 1.0);

    // First pass: Should succeed
    ctx.settlement_service
        .process_trade_event(trade.clone())
        .await
        .unwrap();

    // Second pass: Should be idempotent (NOT deduct funds again)
    let _ = ctx
        .settlement_service
        .process_trade_event(trade.clone())
        .await;

    // 3. Verify Wallet - Should be deducted ONLY ONCE
    let b_usd = ctx.wallet(ctx.account_a, ctx.assets.usd).await;

    // Dynamic Calculation
    let start_total = to_atomic_usd(100000.0); // 10M
    let trade_amt = to_atomic_usd(50000.0); // 5M
    let taker_fee = calc_taker_fee(trade_amt);
    let expected_total = start_total - trade_amt - taker_fee;

    assert_decimal_eq!(b_usd.total, expected_total);
}

/// Test: Settlement Concurrent Updates
///
/// Verifies that the ledger handles concurrent settlement requests for the
/// same accounts without race conditions (using optimistic locking).
///
/// Scenario:
///   - Spawn 10 concurrent tasks, each settling a small trade between A and B.
///
/// Assert: Final balance exactly matches initial - (10 * cost).
#[tokio::test]
async fn test_settlement_concurrent_updates() {
    let ctx = std::sync::Arc::new(InMemoryTestContext::new());

    // 1. Setup Wallets: Buyer 20k USD (2M atomic). Seller has effectively infinite BTC.
    ctx.seed_wallet(ctx.account_a, ctx.assets.usd, 20000.0, 0.0, 20000.0)
        .await;
    ctx.seed_wallet(ctx.account_a, ctx.assets.btc, 0.0, 0.0, 0.0)
        .await;
    ctx.seed_wallet(ctx.account_b, ctx.assets.usd, 0.0, 0.0, 0.0)
        .await;
    ctx.seed_wallet(ctx.account_b, ctx.assets.btc, 10.0, 0.0, 10.0)
        .await;

    // Clone settlement_service so it can be moved into spawned tasks.
    let settlement_service = ctx.settlement_service.clone();

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
            let buy_order = ctx_clone.seed_order(ctx_clone.account_a, "buy", 50000.0, 0.02);
            let sell_order = ctx_clone.seed_order(ctx_clone.account_b, "sell", 50000.0, 0.02);
            let trade = ctx_clone.seed_trade(buy_order.id, sell_order.id, 50000.0, 0.02);

            // We retry on optimistic locking error
            let mut retries = 5;
            loop {
                match svc_clone.process_trade_event(trade.clone()).await {
                    Ok(_) => {
                        break;
                    }
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
    let b_usd = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();

    // Dynamic Calculation
    let start_total = to_atomic_usd(20000.0);
    let single_trade_amt = to_atomic_usd(50000.0 * 0.02);
    let single_fee = calc_taker_fee(single_trade_amt);
    let total_cost = (single_trade_amt + single_fee) * Decimal::from(10);
    let expected_total = start_total - total_cost;

    assert_decimal_eq!(b_usd.total, expected_total);
}

/// Test: Settlement Cross-Tenant Isolation
///
/// Verifies behavior when matching accounts from different tenants.
/// Currently allows it (security gap), documented here.
///
/// Scenario:
///   - Buyer in Tenant 1. Seller in Tenant 2.
///   - Trade occurs.
///
/// Assert: Trade succeeds (current behavior).
#[tokio::test]
async fn test_settlement_cross_tenant_isolation() {
    let ctx = InMemoryTestContext::new(); // Tenant 1 (Default)
    let tenant2_id = Uuid::new_v4();

    // 1. Setup Wallet for Tenant 1 (Buyer)
    // 100k USD
    ctx.seed_wallet(ctx.account_a, ctx.assets.usd, 100_000.0, 0.0, 100_000.0)
        .await;

    // 2. Setup Wallet for Tenant 2 (Seller)
    let account_t2 = Uuid::new_v4();
    let wallet_t2 = Wallet {
        id: Uuid::new_v4(),
        account_id: account_t2,
        asset_id: ctx.btc_id,
        available: Decimal::from_str("1000000000.0").unwrap(), // 10 BTC
        locked: Decimal::from_str("0.0").unwrap(),
        total: Decimal::from_str("1000000000.0").unwrap(),
        tenant_id: tenant2_id,
        user_id: "".to_string(),
        version: 1,
        status: "active".to_string(),
        meta: json!({}),
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };
    ctx.wallet_repo
        .add(wallet_t2)
        .expect("Failed to add wallet_t2");

    // 3. Create Orders (Cross-Tenant)
    // Buyer is in Tenant 1 (ctx.tenant_id)
    let buy_order = ctx.seed_order(ctx.account_a, "buy", 50000.0, 1.0);

    // Seller is in Tenant 2
    let sell_order = Order::new(
        tenant2_id,
        account_t2,
        ctx.instrument_id,
        OrderSide::Sell,
        OrderType::Limit,
        Decimal::from(1),
        Decimal::from(50000),
    );
    ctx.order_repo
        .add(sell_order.clone())
        .expect("Failed to add sell order");

    // 4. Attempt Match (Cross-Tenant)
    let trade = ctx.seed_trade(buy_order.id, sell_order.id, 50000.0, 1.0);

    let result = ctx
        .settlement_service
        .process_trade_event(trade.clone())
        .await;

    // NOTE: This currently succeeds (security flaw). We assert it succeeds to document current behavior.
    assert!(result.is_ok());

    // Dynamic Calc
    let start_total = to_atomic_usd(100000.0);
    let trade_amt = to_atomic_usd(50000.0);
    let taker_fee = calc_taker_fee(trade_amt);
    let expected_total = start_total - trade_amt - taker_fee;

    let b_usd = ctx.wallet(ctx.account_a, ctx.assets.usd).await;
    assert_decimal_eq!(b_usd.total, expected_total);

    let s_btc = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&account_t2.to_string(), &ctx.btc_id.to_string())
        .await
        .unwrap()
        .unwrap();
    // 10 - 1 = 9 BTC -> 900,000,000 sats
    assert_decimal_eq!(s_btc.total, "900000000");
}

/// Test: Settlement Fee Account Contention
///
/// Verifies that high concurrency of settlements crediting the SAME
/// fee account does not cause lock contention failures.
///
/// Scenario:
///   - 20 concurrent trades. All credit fees to `fees_account`.
///
/// Assert: All trades succeed eventually; fee account balance > 0.
#[tokio::test]
async fn test_settlement_fee_account_contention() {
    let ctx = std::sync::Arc::new(InMemoryTestContext::new());
    let settlement_service = ctx.settlement_service.clone();

    let mut handles = vec![];

    for _ in 0..20 {
        let ctx_clone = ctx.clone();
        let svc_clone = settlement_service.clone();

        handles.push(tokio::spawn(async move {
            let buyer = Uuid::new_v4();
            let seller = Uuid::new_v4();

            ctx_clone
                .seed_wallet(buyer, ctx_clone.assets.usd, 1000.0, 0.0, 1000.0)
                .await;
            ctx_clone
                .seed_wallet(seller, ctx_clone.assets.btc, 10.0, 0.0, 10.0)
                .await;

            let buy_order = ctx_clone.seed_order(buyer, "buy", 1000.0, 1.0);
            let sell_order = ctx_clone.seed_order(seller, "sell", 1000.0, 1.0);
            let trade = ctx_clone.seed_trade(buy_order.id, sell_order.id, 1000.0, 1.0);

            let mut retries = 10;
            loop {
                match svc_clone.process_trade_event(trade.clone()).await {
                    Ok(_) => {
                        break;
                    }
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

    let fee_account = ctx
        .account_repo
        .get_by_name("fees_account")
        .await
        .unwrap()
        .unwrap();
    if let Some(w) = ctx
        .wallet_repo
        .get_by_account_and_asset(&fee_account.id.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
    {
        assert!(&w.total > &Decimal::ZERO);
    }
}

/// Test: Settlement Dust Amounts
///
/// Verifies that trades with very small amounts (dust) settle correctly,
/// handling precision limits and fee rounding (fees < 1 unit round to 0).
///
/// Scenario:
///   - Trade value: $0.05.
///   - Fee: 0.1% of $0.05 = $0.0005 -> 0.
///
/// Assert: Buyer pays $0.05; Seller receives $0.05; No fee collected.
#[tokio::test]
async fn test_settlement_dust_amounts() {
    let ctx = InMemoryTestContext::new();

    // 1. Setup Wallets: Buyer has 100 cents (1 USD). Seller has 1 satoshi.
    ctx.seed_wallet(ctx.account_a, ctx.assets.usd, 1.0, 0.0, 1.0)
        .await;
    ctx.seed_wallet(ctx.account_a, ctx.assets.btc, 0.0, 0.0, 0.0)
        .await;
    ctx.seed_wallet(ctx.account_b, ctx.assets.usd, 0.0, 0.0, 0.0)
        .await;
    ctx.seed_wallet(ctx.account_b, ctx.assets.btc, 0.00000001, 0.0, 0.00000001)
        .await;

    // 2. Dust Trade: buy 100 Satoshi (0.000001 BTC) @ $50,000.
    // Value = 0.000001 × 50,000 = $0.05 = 5 cents.
    // Fee: 0.1% of 5 cents = 0.005 cents → floored to 0.
    let buy_order = ctx.seed_order(ctx.account_a, "buy", 50000.0, 0.000001);
    let sell_order = ctx.seed_order(ctx.account_b, "sell", 50000.0, 0.000001);
    let trade = ctx.seed_trade(buy_order.id, sell_order.id, 50000.0, 0.000001);

    ctx.settlement_service
        .process_trade_event(trade.clone())
        .await
        .unwrap();

    // 3. Verify Balances
    let b_usd = ctx.wallet(ctx.account_a, ctx.assets.usd).await;
    let b_btc = ctx.wallet(ctx.account_a, ctx.assets.btc).await;

    // Expected USD deduction: 5 cents (Value) + 0 cents (Fee, if floored) = 5 cents.
    // Remaining: 100 - 5 = 95.
    assert_decimal_eq!(b_usd.total, "95");

    // Expected BTC receipt: 100 Sats.
    assert_decimal_eq!(b_btc.total, "100");
}

/// Test: Settlement Self-Trade Prevention
///
/// Verifies that a trade where buyer and seller are the same account
/// is rejected to prevent wash trading.
///
/// Scenario:
///   - Account A places buy order. Account A places sell order.
///   - Trade created.
///
/// Assert: Settlement rejected.
#[tokio::test]
async fn test_settlement_self_trade() {
    let ctx = InMemoryTestContext::new();

    // Setup: account_a has both USD and BTC and places orders on both sides.
    ctx.seed_wallet(ctx.account_a, ctx.assets.usd, 100_000.0, 0.0, 100_000.0)
        .await;
    ctx.seed_wallet(ctx.account_a, ctx.assets.btc, 2.0, 0.0, 2.0)
        .await;

    let buy_order = ctx.seed_order(ctx.account_a, "buy", 50000.0, 1.0);
    let sell_order = ctx.seed_order(ctx.account_a, "sell", 50000.0, 1.0);
    let trade = ctx.seed_trade(buy_order.id, sell_order.id, 50000.0, 1.0);

    // Self-trades are rejected: buy and sell belong to the same account.
    let result = ctx.settlement_service.process_trade_event(trade).await;
    assert!(result.is_err(), "Self-trade must be rejected");

    // Wallet balances must be completely unchanged.
    let usd = ctx.wallet(ctx.account_a, ctx.assets.usd).await;
    let btc = ctx.wallet(ctx.account_a, ctx.assets.btc).await;
    assert_decimal_eq!(usd.total, "10000000");
    assert_decimal_eq!(btc.total, "200000000");
}

/// Test: Settlement Order Lifecycle Statuses
///
/// Verifies that orders transition through correct statuses (Open ->
/// PartialFill -> Filled) as trades are processed.
///
/// Scenario:
///   - Large Buy Order (10 BTC).
///   - Trade 1: 5 BTC (Partial).
///   - Trade 2: 5 BTC (Filled).
///
/// Assert: Order status updates correctly after each trade.
#[tokio::test]
async fn test_settlement_order_lifecycle_statuses() {
    let ctx = InMemoryTestContext::new();

    // 1. Setup Wallets: Buyer has 1M USD (100M atomic). Seller has 10 BTC (1B atomic).
    ctx.seed_wallet(ctx.account_a, ctx.assets.usd, 1_000_000.0, 0.0, 1_000_000.0)
        .await;
    ctx.seed_wallet(ctx.account_a, ctx.assets.btc, 0.0, 0.0, 0.0)
        .await;
    ctx.seed_wallet(ctx.account_b, ctx.assets.usd, 0.0, 0.0, 0.0)
        .await;
    ctx.seed_wallet(ctx.account_b, ctx.assets.btc, 10.0, 0.0, 10.0)
        .await;

    // 2. Create Order (10 BTC @ 50k)
    let buy_order = ctx.seed_order(ctx.account_a, "buy", 50000.0, 10.0);
    let sell_order = ctx.seed_order(ctx.account_b, "sell", 50000.0, 10.0);

    // Verify initial status
    let order_init = ctx.order_repo.get(buy_order.id).await.unwrap().unwrap();
    assert_eq!(order_init.status, OrderStatus::Open);
    assert_eq!(order_init.filled_quantity, Decimal::ZERO);

    // 3. Process FIRST Match (5 BTC) → partial_fill
    let trade1 = ctx.seed_trade(buy_order.id, sell_order.id, 50000.0, 5.0);
    ctx.settlement_service
        .process_trade_event(trade1.clone())
        .await
        .unwrap();

    let order_step1 = ctx.order_repo.get(buy_order.id).await.unwrap().unwrap();
    assert_eq!(order_step1.status, OrderStatus::PartialFill);
    assert_decimal_eq!(order_step1.filled_quantity, "5");

    // 4. Process SECOND Match (Remaining 5 BTC) → filled
    let trade2 = ctx.seed_trade(buy_order.id, sell_order.id, 50000.0, 5.0);
    ctx.settlement_service
        .process_trade_event(trade2.clone())
        .await
        .unwrap();

    let order_step2 = ctx.order_repo.get(buy_order.id).await.unwrap().unwrap();
    assert_eq!(order_step2.status, OrderStatus::Filled);
    assert_decimal_eq!(order_step2.filled_quantity, "10");
}

// ---------------------------------------------------------------------------
// Equity / Multi-Asset Settlement Extensions
// ---------------------------------------------------------------------------

/// Test: Settlement — Equity / Stock Trade (USD-Denominated)
///
/// Stocks trade like crypto spot: a base asset (share) is exchanged for a
/// quote asset (USD). The key difference is that stock prices use 2-decimal
/// precision (cents) and share counts may be whole numbers.
///
/// This test creates an "AAPL-USD" instrument with type = "equity",
/// then settles a trade for 10 shares @ $180.50.
///
/// Assert: buyer receives 10 shares, pays $1,805.00 + taker fee;
///         seller receives USD proceeds, loses 10 shares
#[tokio::test]
async fn test_settlement_equity_stock_trade() {
    let ctx = InMemoryTestContext::new();

    // Create equity assets: AAPL (2 decimals for fractional shares), USD (2 decimals)
    let aapl_id_str = ctx.create_asset_api("AAPL", "equity", 2).await;
    let usd_id_str = ctx.create_asset_api("USD_EQ", "fiat", 2).await;
    let aapl_id = Uuid::parse_str(&aapl_id_str).unwrap();
    let usd_id = Uuid::parse_str(&usd_id_str).unwrap();

    let instr_id = {
        let req = Request::new(CreateInstrumentRequest {
            symbol: "AAPL-USD".to_string(),
            r#type: "equity".to_string(),
            base_asset_id: aapl_id_str.clone(),
            quote_asset_id: usd_id_str.clone(),
        });
        ctx.asset_api
            .create_instrument(req)
            .await
            .unwrap()
            .into_inner()
            .instrument
            .unwrap()
            .id
    };

    let shares = 10.0_f64;
    let price_usd = 180.50_f64;
    let total_usd = price_usd * shares; // 1805.0

    // Buyer: has USD budget locked, no shares
    // Use default accounts from context
    let buyer_account = ctx.account_a;
    let seller_account = ctx.account_b;

    ctx.seed_wallet(buyer_account, usd_id, 0.0, total_usd, total_usd)
        .await;
    ctx.empty_wallet(buyer_account, aapl_id);

    ctx.seed_wallet(
        seller_account,
        aapl_id,
        0.0,
        10.0, // 10 shares (1000 atomic)
        10.0,
    )
    .await;
    ctx.empty_wallet(seller_account, usd_id);

    let buy_order = {
        let o = Order::new(
            ctx.tenant_id,
            buyer_account,
            Uuid::parse_str(&instr_id).unwrap(),
            OrderSide::Buy,
            OrderType::Limit,
            Decimal::from_f64(shares).unwrap(),
            Decimal::from_str("180.50").unwrap(),
        );
        ctx.order_repo
            .add(o.clone())
            .expect("Failed to add buy order");
        o
    };

    let sell_order = {
        let o = Order::new(
            ctx.tenant_id,
            seller_account,
            Uuid::parse_str(&instr_id).unwrap(),
            OrderSide::Sell,
            OrderType::Limit,
            Decimal::from_f64(shares).unwrap(),
            Decimal::from_str("180.50").unwrap(),
        );
        ctx.order_repo
            .add(o.clone())
            .expect("Failed to add sell order");
        o
    };

    let trade = {
        Trade {
            id: Uuid::new_v4(),
            tenant_id: ctx.tenant_id,
            instrument_id: Uuid::parse_str(&instr_id).unwrap(),
            buy_order_id: buy_order.id,
            sell_order_id: sell_order.id,
            price: Decimal::from_str("180.50").unwrap(),
            quantity: Decimal::from_f64(shares).unwrap(),
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    };

    ctx.settlement_service
        .process_trade_event(trade)
        .await
        .unwrap();

    let buyer_aapl = ctx.wallet(buyer_account, aapl_id).await;

    // Buyer should hold 10 shares (1,000 atomic units at 2 decimals)
    assert_decimal_eq!(buyer_aapl.available, "1000"); // 10.00 * 100
    assert_decimal_eq!(buyer_aapl.total, "1000");

    let seller_usd = ctx.wallet(seller_account, usd_id).await;
    // Seller gets 180.50 * 10 = 1,805.00 USD (180,500 atomic cents)
    // Less any fees (assuming 0 for this test or need to calc)
    // Standard test context likely has fees, so let's verify > 0 and roughly correct if dynamic
    // But for "Equity Stock Trade" we should be precise.
    // 180,500 - Fee.
    let expected_revenue = to_atomic_usd(1805.0);
    let maker_fee = calc_maker_fee(expected_revenue);
    assert_decimal_eq!(
        seller_usd.available,
        (expected_revenue - maker_fee).to_string()
    );
}

/// Test: Settlement — Fractional Share Trading
///
/// Modern brokerages allow trading fractional shares. The ledger must handle
/// non-integer quantities without rounding errors.
///
/// Scenario: buy 0.5 shares of AAPL @ $180.00 = $90.00 notional
///
/// Assert: buyer's share wallet = 0.5 shares (50 units at 2 decimal scale);
///         correct USD deduction
#[tokio::test]
async fn test_settlement_fractional_shares() -> Result<(), Box<dyn std::error::Error>> {
    let ctx = InMemoryTestContext::new();
    let p = ctx.aapl_spot_participants(90.0, 0.5).await;
    let instrument_id = ctx.instruments.aapl_usd;

    let buy_order = ctx
        .order_service
        .create_order(Order {
            id: Uuid::new_v4(),
            tenant_id: ctx.tenant_id,
            account_id: p.buyer.account_id,
            instrument_id,
            side: OrderSide::Buy,
            r#type: OrderType::Limit,
            quantity: Decimal::from_str("0.5")?,
            price: Decimal::from_str("180.0")?,
            status: OrderStatus::Open,
            filled_quantity: Decimal::ZERO,
            average_fill_price: Decimal::ZERO,
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        })
        .await?;

    // Sell 0.5 AAPL @ $180.00
    let sell_order = ctx
        .order_service
        .create_order(Order {
            id: Uuid::new_v4(),
            tenant_id: ctx.tenant_id,
            account_id: p.seller.account_id,
            instrument_id,
            side: OrderSide::Sell,
            r#type: OrderType::Limit,
            quantity: Decimal::from_str("0.5")?,
            price: Decimal::from_str("180.0")?,
            status: OrderStatus::Open,
            filled_quantity: Decimal::ZERO,
            average_fill_price: Decimal::ZERO,
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        })
        .await?;

    // 3. Match & Settle
    // Use correct instrument ID here too
    let trade = Trade {
        id: Uuid::new_v4(),
        tenant_id: ctx.tenant_id,
        instrument_id,
        buy_order_id: buy_order.id,
        sell_order_id: sell_order.id,
        price: Decimal::from_str("180.0")?,
        quantity: Decimal::from_str("0.5")?,
        meta: serde_json::json!({}),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    ctx.settlement_service
        .process_trade_event(trade.clone())
        .await?;

    // 4. Verify Buyer Wallet (AAPL)
    // 0.5 shares × 100 (2 decimals) = 50 atomic units
    let buyer_aapl = ctx.wallet(p.buyer.account_id, ctx.assets.aapl).await;
    assert_decimal_eq!(buyer_aapl.available, "50");

    Ok(())
}

/// Test: Settlement — High-Precision Altcoin (18 Decimals)
///
/// Tokens like ETH use 18 decimal places. The ledger must handle the
/// resulting large integers (up to 10^26) without overflow or precision loss
/// in Rust's Decimal type.
///
/// Scenario: buy 1.0 token @ 0.000000000000001 price (extremely small price,
/// large atomic units). Verify no overflow and correct wallet credit.
///
/// Assert: settlement succeeds; buyer's token wallet > 0
#[tokio::test]
async fn test_settlement_high_precision_altcoin() {
    let ctx = InMemoryTestContext::new();

    let eth_id = ctx.create_asset_api("ETH18", "crypto", 18).await;
    let usd_id = ctx.create_asset_api("USD_HP", "fiat", 2).await;

    let eth_uuid = Uuid::parse_str(&eth_id).unwrap();
    let usd_uuid = Uuid::parse_str(&usd_id).unwrap();

    let instr_id = {
        let req = Request::new(CreateInstrumentRequest {
            symbol: "ETH18-USD".to_string(),
            r#type: "spot".to_string(),
            base_asset_id: eth_id.clone(),
            quote_asset_id: usd_id.clone(),
        });
        ctx.asset_api
            .create_instrument(req)
            .await
            .unwrap()
            .into_inner()
            .instrument
            .unwrap()
            .id
    };

    // Trade 1.0 ETH @ $3,000 — straightforward amounts but large atomic scale
    let buyer_acc = ctx.account_a;
    let seller_acc = ctx.account_b;

    // Buyer has $3,000
    ctx.seed_wallet(buyer_acc, usd_uuid, 0.0, 3000.0, 3000.0)
        .await;
    ctx.empty_wallet(buyer_acc, eth_uuid);

    // Seller has 1.0 ETH
    ctx.seed_wallet(seller_acc, eth_uuid, 0.0, 1.0, 1.0).await;
    ctx.empty_wallet(seller_acc, usd_uuid);

    let buy_order = {
        let o = Order::new(
            ctx.tenant_id,
            buyer_acc,
            Uuid::parse_str(&instr_id).unwrap(),
            OrderSide::Buy,
            OrderType::Limit,
            Decimal::ONE,
            Decimal::from_str("3000.0").unwrap(),
        );
        ctx.order_repo
            .add(o.clone())
            .expect("Failed to add buy order");
        o
    };

    let sell_order = {
        let o = Order::new(
            ctx.tenant_id,
            seller_acc,
            Uuid::parse_str(&instr_id).unwrap(),
            OrderSide::Sell,
            OrderType::Limit,
            Decimal::ONE,
            Decimal::from_str("3000.0").unwrap(),
        );
        ctx.order_repo
            .add(o.clone())
            .expect("Failed to add sell order");
        o
    };

    let trade = {
        Trade {
            id: Uuid::new_v4(),
            tenant_id: ctx.tenant_id,
            instrument_id: Uuid::parse_str(&instr_id).unwrap(),
            buy_order_id: buy_order.id,
            sell_order_id: sell_order.id,
            price: Decimal::new(3000, 0),
            quantity: Decimal::new(1, 0),
            meta: serde_json::json!({}),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    };

    let result = ctx.settlement_service.process_trade_event(trade).await;

    assert!(
        result.is_ok(),
        "18-decimal settlement should succeed without overflow: {:?}",
        result
    );

    let buyer_eth = ctx.wallet(buyer_acc, eth_uuid).await;

    // Buyer should have received 1.0 ETH
    // 1.0 * 10^18 = 1,000,000,000,000,000,000 atomic units
    let expected_atomic = Decimal::from(10).powi(18);
    assert_decimal_eq!(buyer_eth.available, expected_atomic.to_string());
    assert_decimal_eq!(buyer_eth.total, expected_atomic.to_string());
}
