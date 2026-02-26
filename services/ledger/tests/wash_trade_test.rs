mod helpers;
use helpers::memory::InMemoryTestContext;
use rust_decimal::Decimal;
use rust_decimal::prelude::ToPrimitive;
use ledger::domain::orders::OrderRepository;
use std::str::FromStr;

macro_rules! assert_decimal_val_eq {
    ($left:expr, $right:expr) => {
        assert_eq!(
            Decimal::from_str(&$left).unwrap(),
            $right,
            "Expected {} but got {}",
            $right, &$left
        );
    };
}

fn to_atomic_usd(amount: f64) -> Decimal {
    use rust_decimal::prelude::FromPrimitive;
    (Decimal::from_f64(amount).unwrap() * Decimal::new(100, 0)).floor()
}

fn to_atomic_btc(amount: f64) -> Decimal {
    use rust_decimal::prelude::FromPrimitive;
    (Decimal::from_f64(amount).unwrap() * Decimal::new(100_000_000, 0)).floor()
}

/// Test: Self-Trade — Same Account on Both Sides Is Flagged
///
/// A wash trade occurs when the buyer and seller are the same account.
/// This manipulates perceived trading volume without genuine economic
/// exchange and is prohibited on regulated exchanges.
///
/// The settlement service should detect that `buy_order.account_id ==
/// sell_order.account_id` and reject the trade with an appropriate error,
/// leaving all wallet balances unchanged.
///
/// Note: The current SettlementService does not detect self-trades.
/// This test documents the EXPECTED rejection behavior. It will pass
/// once self-trade detection is added to `process_trade_event`.
///
/// Assert: settlement returns an error; wallet totals are unchanged
#[tokio::test]
async fn test_self_trade_same_account_both_sides_flagged() {
    let ctx = InMemoryTestContext::new();

    let price    = 50_000.0_f64;
    let qty      = 1.0_f64;
    let notional = to_atomic_usd(price * qty);
    let btc_qty  = to_atomic_btc(qty);

    // Account A has both USD and BTC — it is both buyer and seller
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(),
        0.0, notional.to_f64().unwrap(), notional.to_f64().unwrap());
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(),
        0.0, btc_qty.to_f64().unwrap(), btc_qty.to_f64().unwrap());

    let buy_order  = ctx.create_order(ctx.account_a, "buy",  price, qty);
    let sell_order = ctx.create_order(ctx.account_a, "sell", price, qty); // SAME account

    let usd_before = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await.unwrap().unwrap();
    let btc_before = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string())
        .await.unwrap().unwrap();

    let trade  = ctx.create_trade(buy_order.id, sell_order.id, price, qty);
    let result = ctx.settlement_service.process_trade_event(trade).await;

    // Expect an error — self-trades are prohibited
    assert!(
        result.is_err(),
        "Self-trade (same account both sides) should be rejected; current impl may accept it (gap)"
    );

    // Wallet balances must be completely unchanged
    let usd_after = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await.unwrap().unwrap();
    let btc_after = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.btc_id.to_string())
        .await.unwrap().unwrap();

    assert_decimal_val_eq!(usd_after.total,
        Decimal::from_str(&usd_before.total).unwrap());
    assert_decimal_val_eq!(btc_after.total,
        Decimal::from_str(&btc_before.total).unwrap());
}

/// Test: Cross-Account Same-User Wash Trade Is Detected
///
/// A more sophisticated wash trade uses two different accounts belonging
/// to the same user. From the ledger's perspective the two accounts are
/// distinct, but the economic reality is that no genuine counterparty risk
/// was transferred — the same person is on both sides.
///
/// Both accounts share the same `user_id`. The settlement service should
/// detect this and reject the trade (or at minimum flag it for compliance).
///
/// Note: This behavior is NOT yet implemented. The test documents the
/// expected outcome. It will fail until cross-account user matching is
/// added.
///
/// Assert: settlement is rejected when buyer and seller share a user_id
#[tokio::test]
async fn test_cross_account_same_user_wash_trade_detected() {
    let ctx = InMemoryTestContext::new();

    let price    = 50_000.0_f64;
    let qty      = 1.0_f64;
    let notional = to_atomic_usd(price * qty);

    // Both accounts belong to the SAME user (ctx.user_id)
    // account_a is the buyer, account_b is the seller, but user_id is identical
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(),
        0.0, notional.to_f64().unwrap(), notional.to_f64().unwrap());
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);

    ctx.create_wallet(ctx.account_b, &ctx.btc_id.to_string(),
        0.0, to_atomic_btc(qty).to_f64().unwrap(), to_atomic_btc(qty).to_f64().unwrap());
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);

    let buy_order  = ctx.create_order(ctx.account_a, "buy",  price, qty);
    let sell_order = ctx.create_order(ctx.account_b, "sell", price, qty);

    // Tag both orders with the same user_id in meta to simulate cross-account detection
    // In a real implementation the service would look up account → user mapping
    let mut buy  = ctx.order_repo.get(buy_order.id).await.unwrap().unwrap();
    let mut sell = ctx.order_repo.get(sell_order.id).await.unwrap().unwrap();
    buy.meta  = serde_json::json!({"user_id": ctx.user_id.to_string()});
    sell.meta = serde_json::json!({"user_id": ctx.user_id.to_string()});
    ctx.order_repo.add(buy);
    ctx.order_repo.add(sell);

    let usd_a_before = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await.unwrap().unwrap();

    let trade  = ctx.create_trade(buy_order.id, sell_order.id, price, qty);
    let result = ctx.settlement_service.process_trade_event(trade).await;

    // Expect rejection — same user on both sides
    assert!(
        result.is_err(),
        "Cross-account same-user trade should be rejected; current impl may accept it (gap)"
    );

    // Net wallet change for the user must be zero (no economic transfer occurred)
    let usd_a_after = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await.unwrap().unwrap();

    assert_decimal_val_eq!(usd_a_after.total,
        Decimal::from_str(&usd_a_before.total).unwrap());
}
