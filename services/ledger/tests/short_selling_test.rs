/// Track B — Short Selling Tests
///
/// These tests define expected ledger behavior for short selling (selling
/// an asset you don't own by borrowing it). They require `BorrowService`
/// and short-position tracking logic not yet implemented.
///
/// To run once implemented:
///   cargo test -- --ignored short
///
/// Required domain additions:
///   - `BorrowService::open_borrow(account_id, asset_id, qty) -> Result<Borrow>`
///   - `BorrowService::close_borrow(borrow_id) -> Result<()>`
///   - Collateral locking: quote asset locked instead of base for short sells
///   - `Account.type = "margin"` required for borrowing; cash accounts blocked
mod helpers;
use helpers::memory::InMemoryTestContext;
use rust_decimal::Decimal;
use std::str::FromStr;

fn to_atomic_usd(amount: f64) -> Decimal {
    use rust_decimal::prelude::FromPrimitive;
    (Decimal::from_f64(amount).unwrap() * Decimal::new(100, 0)).floor()
}

fn to_atomic_btc(amount: f64) -> Decimal {
    use rust_decimal::prelude::FromPrimitive;
    (Decimal::from_f64(amount).unwrap() * Decimal::new(100_000_000, 0)).floor()
}

/// Test: Short Sell Locks Quote Collateral, Not Base Asset
///
/// When an account short-sells BTC (sells borrowed BTC), they don't hold
/// any BTC to lock. Instead, quote collateral (USD) is locked to guarantee
/// they can buy back the BTC later and repay the borrow.
///
/// Scenario: short sell 1.0 BTC @ $50,000
///   - Borrow 1.0 BTC (no BTC in wallet needed)
///   - Lock $50,000 (or some fraction) in USD as collateral
///   - Sell the borrowed BTC → USD flows in from buyer
///
/// Assert: usd_locked = collateral_amount; btc wallet = 0 (never held it)
#[tokio::test]
#[ignore = "Track B: Requires BorrowService implementation"]
async fn test_short_sell_locks_collateral_not_base_asset() {
    let ctx = InMemoryTestContext::new();

    let usd_collateral = to_atomic_usd(50_000.0); // full notional as collateral
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(),
        0.0, usd_collateral.to_f64().unwrap(), usd_collateral.to_f64().unwrap());
    // No BTC wallet needed — the account doesn't hold BTC

    // TODO: ctx.borrow_service.open_borrow(account_a, btc_id, qty=1.0).await;
    // TODO: ctx.order_service.create_short_sell(account_a, instrument_id, qty=1.0, price=50000).await;

    let usd_wallet = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await.unwrap().unwrap();

    // USD must be locked as collateral; BTC wallet may not even exist
    assert!(Decimal::from_str(&usd_wallet.locked).unwrap() > Decimal::ZERO,
        "USD collateral must be locked for short position");

    // No BTC should be in the account (the short seller never held it)
    let btc_wallet = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string())
        .await.unwrap();
    if let Some(w) = btc_wallet {
        assert_eq!(Decimal::from_str(&w.available).unwrap(), Decimal::ZERO,
            "Short seller must not hold BTC in available");
    }

    todo!("Implement BorrowService then complete this test")
}

/// Test: Short Sell Settlement Credits Quote Asset to Seller
///
/// After the short sell is matched against a buyer, the trade settles:
///   - Buyer pays USD → seller receives USD (borrowed BTC was delivered)
///   - Seller's USD wallet (proceeds) increases
///
/// The proceeds are held separately from the collateral. On close,
/// collateral is released and proceeds are used to buy back BTC.
///
/// Assert: seller.usd_available increases by trade proceeds after settlement
#[tokio::test]
#[ignore = "Track B: Requires BorrowService implementation"]
async fn test_short_sell_settlement_credits_quote_to_seller() {
    let ctx = InMemoryTestContext::new();

    let price    = 50_000.0_f64;
    let qty      = 1.0_f64;
    let proceeds = to_atomic_usd(price * qty);

    // Buyer has USD
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(),
        0.0, proceeds.to_f64().unwrap(), proceeds.to_f64().unwrap());
    ctx.create_wallet(ctx.account_b, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);

    // Seller has collateral locked, no BTC
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);

    // TODO: After settle short sale:
    let _ = (price, qty, proceeds);

    let seller_usd = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await.unwrap().unwrap();

    // Seller received proceeds from selling the borrowed BTC
    assert!(Decimal::from_str(&seller_usd.available).unwrap() > Decimal::ZERO,
        "Short seller should have received USD proceeds");

    todo!("Implement BorrowService then complete this test")
}

/// Test: Covering a Short Position Releases Collateral
///
/// When a short seller buys back the BTC to return to the lender (covering
/// the short), their locked USD collateral must be released back to
/// available (minus any borrow fee accrued).
///
/// Assert: after cover, usd_locked = 0; available restored (minus borrow fee)
#[tokio::test]
#[ignore = "Track B: Requires BorrowService implementation"]
async fn test_short_position_cover_buy_reduces_collateral_lock() {
    let ctx = InMemoryTestContext::new();

    let collateral = to_atomic_usd(50_000.0);
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(),
        0.0, collateral.to_f64().unwrap(), collateral.to_f64().unwrap());

    // TODO: ctx.borrow_service.close_borrow(borrow_id).await;
    // Expected: USD locked → available; small borrow fee deducted

    let usd_wallet = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await.unwrap().unwrap();

    assert_eq!(Decimal::from_str(&usd_wallet.locked).unwrap(), Decimal::ZERO,
        "Collateral must be released after covering the short");

    // Available should be close to original (minus any borrow fees)
    let available = Decimal::from_str(&usd_wallet.available).unwrap();
    assert!(available <= collateral,
        "Available should be at most collateral after fees");

    todo!("Implement BorrowService then complete this test")
}

/// Test: Short Selling Is Rejected on a Cash Account
///
/// Cash accounts (type = "cash") cannot borrow assets. Attempting to sell
/// more base asset than the account holds must be rejected as
/// InsufficientFunds — there is no borrow facility on a cash account.
///
/// This ensures retail accounts with cash-only settings cannot accidentally
/// open leveraged short positions.
///
/// Assert: sell order > available base asset balance returns InsufficientFunds
#[tokio::test]
#[ignore = "Track B: Requires account-type enforcement in OrderService"]
async fn test_short_sell_rejected_in_cash_account() {
    let ctx = InMemoryTestContext::new();

    // Cash account holds 0 BTC — cannot short sell
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);

    // Attempt to sell 1.0 BTC without holding any
    use ledger::domain::orders::model::{Order, OrderSide, OrderStatus, OrderType};
    use rust_decimal::prelude::FromPrimitive;
    use chrono::Utc;

    let order = Order {
        id:            uuid::Uuid::new_v4(),
        tenant_id:     ctx.tenant_id,
        account_id:    ctx.account_a,
        instrument_id: ctx.instrument_id,
        side:          OrderSide::Sell,
        r#type:        OrderType::Limit,
        quantity:      Decimal::from_f64(1.0).unwrap(),
        price:         Decimal::from_f64(50_000.0).unwrap(),
        status:        OrderStatus::Open,
        filled_quantity: Decimal::ZERO,
        average_fill_price: Decimal::ZERO,
        meta:          serde_json::json!({"account_type": "cash"}),
        created_at:    Utc::now(),
        updated_at:    Utc::now(),
    };

    let result = ctx.order_service.create_order(order).await;

    // Cash account must reject the order as InsufficientFunds (no borrowing)
    assert!(result.is_err(), "Cash account should not allow short selling");
    match result.unwrap_err() {
        ledger::error::AppError::InsufficientFunds { .. } => {}
        other => panic!("Expected InsufficientFunds, got: {:?}", other),
    }

    todo!("Add account-type enforcement to OrderService then complete this test")
}
