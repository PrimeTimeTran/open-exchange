/// Track B — Liquidation Tests
///
/// These tests define expected ledger behavior for forced liquidations
/// triggered when account equity falls below the maintenance threshold.
/// They require `LiquidationService` and `InsuranceFundService`.
///
/// To run once implemented:
///   cargo test -- --ignored liquidation
///
/// Required domain additions:
///   - `LiquidationService::liquidate(account_id) -> Result<LiquidationReport>`
///   - `InsuranceFundService::cover_shortfall(amount) -> Result<()>`
///   - Insurance fund account pre-seeded in the ledger
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

/// Test: Partial Liquidation Restores Account Above Maintenance
///
/// When an account is below maintenance margin but still has positive equity,
/// only the minimum number of positions needed to restore the account above
/// maintenance are closed. The rest remain open.
///
/// This preserves the user's remaining positions while eliminating the
/// immediate risk to the exchange.
///
/// Assert: after partial liquidation, account equity >= maintenance_margin;
///         not all positions are closed
#[tokio::test]
#[ignore = "Track B: Requires LiquidationService implementation"]
async fn test_partial_liquidation_restores_account_above_maintenance() {
    let ctx = InMemoryTestContext::new();

    // Account has two positions; only one needs to be liquidated
    let pos1_value = to_atomic_usd(10_000.0);
    let pos2_value = to_atomic_usd(10_000.0);
    let maintenance = to_atomic_usd(5_000.0);

    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(),
        (maintenance - to_atomic_usd(100.0)).to_f64().unwrap(),
        0.0,
        (maintenance - to_atomic_usd(100.0)).to_f64().unwrap());

    // TODO: ctx.liquidation_service.partial_liquidate(account_a, maintenance_threshold).await;
    let _ = (pos1_value, pos2_value, maintenance);

    let usd_wallet = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await.unwrap().unwrap();

    let equity = Decimal::from_str(&usd_wallet.total).unwrap();
    assert!(equity >= maintenance,
        "Equity should be >= maintenance after partial liquidation; got {}", equity);

    todo!("Implement LiquidationService then complete this test")
}

/// Test: Full Liquidation When Equity Is Near Zero
///
/// When an account's equity is so low that no partial liquidation can save it,
/// all positions must be force-closed. The proceeds are used to repay the
/// borrow as much as possible.
///
/// Assert: all positions closed; locked = 0; account at zero or minimal residual
#[tokio::test]
#[ignore = "Track B: Requires LiquidationService implementation"]
async fn test_full_liquidation_at_near_zero_equity() {
    let ctx = InMemoryTestContext::new();

    // Account has near-zero equity — deeply underwater
    let near_zero = to_atomic_usd(1.0); // $0.01
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(),
        0.0, near_zero.to_f64().unwrap(), near_zero.to_f64().unwrap());
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);

    // TODO: ctx.liquidation_service.full_liquidate(account_a).await;

    let usd_wallet = ctx.wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await.unwrap().unwrap();

    assert_eq!(Decimal::from_str(&usd_wallet.locked).unwrap(), Decimal::ZERO,
        "All locked funds must be released after full liquidation");

    todo!("Implement LiquidationService then complete this test")
}

/// Test: Liquidation Orders Are Market Type, Not Limit
///
/// Liquidation must execute at any available price to guarantee closure.
/// Using limit orders could leave the position open if the limit isn't hit,
/// increasing exchange risk. Auto-generated liquidation orders must always
/// use `OrderType::Market`.
///
/// Assert: all auto-generated liquidation orders have type = Market
#[tokio::test]
#[ignore = "Track B: Requires LiquidationService implementation"]
async fn test_liquidation_order_is_market_not_limit() {
    use ledger::domain::orders::model::OrderType;

    let ctx = InMemoryTestContext::new();

    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(),
        to_atomic_btc(1.0).to_f64().unwrap(), 0.0, to_atomic_btc(1.0).to_f64().unwrap());

    // TODO: let report = ctx.liquidation_service.liquidate(account_a).await;
    // let liq_orders = ctx.order_repo.list_by_account(account_a).await;

    // for order in liq_orders {
    //     assert_eq!(order.r#type, OrderType::Market,
    //         "Liquidation orders must be Market type, not Limit");
    // }
    let _ = OrderType::Market;

    todo!("Implement LiquidationService then complete this test")
}

/// Test: Insurance Fund Covers Liquidation Shortfall
///
/// In rare cases (extreme gap moves, illiquid markets), the liquidation
/// proceeds are insufficient to cover the account's debt. The insurance
/// fund absorbs this shortfall to protect the counterparty.
///
/// Scenario: account owes $1,000; liquidation only raised $800 → $200 shortfall
///   - Insurance fund is debited $200
///   - Counterparty is made whole
///
/// Assert: insurance_fund.total -= shortfall; counterparty debt = 0
#[tokio::test]
#[ignore = "Track B: Requires InsuranceFundService implementation"]
async fn test_insurance_fund_covers_liquidation_shortfall() {
    use ledger::domain::accounts::repository::AccountRepository;

    let ctx = InMemoryTestContext::new();

    let debt      = to_atomic_usd(1_000.0);
    let recovered = to_atomic_usd(800.0);
    let shortfall = debt - recovered;

    // Seed insurance fund with enough to cover
    let insurance_account = ctx.account_repo
        .get_by_name("fees_account") // reuse fees_account as insurance fund proxy
        .await.unwrap()
        .expect("Insurance/fees account must exist");

    ctx.create_wallet(insurance_account.id, &ctx.usd_id.to_string(),
        to_atomic_usd(100_000.0).to_f64().unwrap(),
        0.0,
        to_atomic_usd(100_000.0).to_f64().unwrap());

    let pre_insurance = ctx.wallet_service
        .get_wallet_by_account_and_asset(&insurance_account.id.to_string(), &ctx.usd_id.to_string())
        .await.unwrap().unwrap();
    let pre_balance = Decimal::from_str(&pre_insurance.total).unwrap();

    // TODO: ctx.insurance_fund_service.cover_shortfall(shortfall, insurance_account_id).await;
    let _ = (debt, recovered, shortfall);

    let post_insurance = ctx.wallet_service
        .get_wallet_by_account_and_asset(&insurance_account.id.to_string(), &ctx.usd_id.to_string())
        .await.unwrap().unwrap();
    let post_balance = Decimal::from_str(&post_insurance.total).unwrap();

    assert_eq!(post_balance, pre_balance - shortfall,
        "Insurance fund should have been debited by the shortfall amount");

    todo!("Implement InsuranceFundService then complete this test")
}

/// Test: Concurrent Liquidation Checks Do Not Double-Close a Position
///
/// Two simultaneous margin-check events (e.g. from two price ticks) must
/// not generate duplicate liquidation orders for the same position. The
/// system must be idempotent: the second check should detect the position
/// is already being liquidated and skip.
///
/// Assert: only one set of liquidation orders exists; position closed once
#[tokio::test]
#[ignore = "Track B: Requires LiquidationService with idempotency checks"]
async fn test_liquidation_does_not_double_close_same_position() {
    use std::sync::Arc;
    use tokio::task;

    let ctx = Arc::new(InMemoryTestContext::new());

    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(),
        0.0, to_atomic_btc(1.0).to_f64().unwrap(), to_atomic_btc(1.0).to_f64().unwrap());

    // Simulate two concurrent liquidation triggers
    // TODO:
    // let ctx1 = ctx.clone();
    // let ctx2 = ctx.clone();
    // let (r1, r2) = tokio::join!(
    //     ctx1.liquidation_service.liquidate(account_a),
    //     ctx2.liquidation_service.liquidate(account_a)
    // );

    // Verify exactly one liquidation occurred
    let open_orders = ctx.order_service.list_open_orders().await.unwrap();
    let liq_orders: Vec<_> = open_orders.iter()
        .filter(|o| o.account_id == ctx.account_a)
        .collect();

    // Only one liquidation order set should exist
    assert!(liq_orders.len() <= 1,
        "Duplicate liquidation orders detected: {} orders", liq_orders.len());

    todo!("Implement LiquidationService idempotency then complete this test")
}
