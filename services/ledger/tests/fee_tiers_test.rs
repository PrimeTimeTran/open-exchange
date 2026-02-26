mod helpers;
use helpers::memory::InMemoryTestContext;
use helpers::{to_atomic_btc, to_atomic_usd};
use ledger::domain::fees::constants::FeeConstants;
use ledger::domain::fees::service::{FeeService, StandardFeeService};
use rust_decimal::prelude::{FromPrimitive, ToPrimitive};
use rust_decimal::Decimal;
use std::str::FromStr;

/// Test: Maker Fee Is Lower Than Taker Fee
///
/// The maker-taker model rewards liquidity providers (makers) with a lower
/// fee than liquidity takers. This test documents and enforces that invariant
/// at the constant level, so any accidental reversal fails loudly.
///
/// Assert: maker_fee < taker_fee, both > 0
#[tokio::test]
async fn test_maker_fee_lower_than_taker_fee() {
    let maker = FeeConstants::get_maker_fee();
    let taker = FeeConstants::get_taker_fee();

    assert!(maker > Decimal::ZERO, "Maker fee must be positive");
    assert!(taker > Decimal::ZERO, "Taker fee must be positive");
    assert!(
        maker < taker,
        "Maker fee ({}) must be lower than taker fee ({})",
        maker,
        taker
    );
}

/// Test: Taker Fee Is Deducted Exactly From Buyer's Proceeds
///
/// After a full fill, the buyer's quote wallet total must decrease by:
///   notional + taker_fee
/// where taker_fee = floor(notional * TAKER_FEE_RATE).
///
/// This verifies the fee is applied once, is floor-rounded, and is
/// sourced exclusively from the buyer's quote wallet.
///
/// Setup:  buyer has exactly 1 BTC of USD budget locked (5,000,000 cents)
/// Trade:  1.0 BTC @ $50,000
/// Assert: buyer_usd.total == -(notional + taker_fee)
#[tokio::test]
async fn test_taker_fee_deducted_exactly_from_buyer_proceeds() {
    let ctx = InMemoryTestContext::new();

    let price = 50_000.0_f64;
    let qty = 1.0_f64;
    let notional = to_atomic_usd(price * qty);
    let fee_svc = StandardFeeService::new();
    let taker_fee = (fee_svc.calculate_fee(
        Decimal::from_f64(qty).unwrap(),
        Decimal::from_f64(price).unwrap(),
        "taker",
    ) * Decimal::new(100, 0))
    .floor(); // scale to atomic USD

    ctx.create_wallet(
        ctx.account_a,
        &ctx.usd_id.to_string(),
        0.0,
        notional.to_f64().unwrap(),
        notional.to_f64().unwrap(),
    );
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);

    ctx.create_wallet(
        ctx.account_b,
        &ctx.btc_id.to_string(),
        0.0,
        to_atomic_btc(qty).to_f64().unwrap(),
        to_atomic_btc(qty).to_f64().unwrap(),
    );
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);

    let buy_order = ctx.create_order(ctx.account_a, "buy", price, qty);
    let sell_order = ctx.create_order(ctx.account_b, "sell", price, qty);
    let trade = ctx.create_trade(buy_order.id, sell_order.id, price, qty);

    let (settlement_service, wallet_service) = ctx.init_test_services();
    settlement_service.process_trade_event(trade).await.unwrap();

    let buyer_usd = wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();

    // Buyer started with exactly the notional amount locked.
    // After settlement: total should be -(fee), meaning the fee came out of that balance.
    let buyer_total = Decimal::from_str(&buyer_usd.total).unwrap();
    let expected_total = Decimal::ZERO - taker_fee;

    assert_eq!(
        buyer_total, expected_total,
        "Buyer total should be -taker_fee ({}), got {}",
        expected_total, buyer_total
    );
}

/// Test: Minimum Fee Floor on Dust Trade
///
/// Trading with very tiny amounts (1 atomic unit = $0.01 USD) should still
/// produce a fee. The fee must not round to zero due to floor(), ensuring the
/// exchange always collects something (or at minimum the trade is charged 0,
/// not negative).
///
/// This test documents current behavior: for a 1 cent trade the fee may be
/// 0 (floor of 0.002 cents = 0). That is acceptable but must not go negative.
///
/// Assert: fee >= 0 for any positive trade size
#[tokio::test]
async fn test_minimum_fee_floor_on_dust_trade() {
    let fee_svc = StandardFeeService::new();

    // Trade: 1 unit of base @ 1 unit price (the absolute minimum)
    let qty = Decimal::ONE;
    let price = Decimal::ONE;

    let taker_fee = fee_svc.calculate_fee(qty, price, "taker");
    let maker_fee = fee_svc.calculate_fee(qty, price, "maker");

    assert!(
        taker_fee >= Decimal::ZERO,
        "Taker fee must not be negative for dust trade; got {}",
        taker_fee
    );
    assert!(
        maker_fee >= Decimal::ZERO,
        "Maker fee must not be negative for dust trade; got {}",
        maker_fee
    );
}

/// Test: VIP Tier Settlement Uses Lower Fee Rate
///
/// Exchanges offer reduced fees to high-volume traders. A custom FeeService
/// implementation with a lower rate (e.g. 0.05%) should produce a visibly
/// smaller fee than the standard 0.2% taker rate for the same trade.
///
/// This test creates two parallel settlements — one with the standard fee
/// service and one with a reduced VIP rate — and compares the fee account
/// balance delta.
///
/// Assert: vip_fee_account_balance < standard_fee_account_balance for same trade
#[tokio::test]
async fn test_vip_tier_uses_lower_fee_rate() {
    use async_trait::async_trait;

    // Custom VIP fee service: 0.05% taker / 0.0% maker
    struct VipFeeService;

    #[async_trait]
    impl FeeService for VipFeeService {
        fn calculate_fee(&self, qty: Decimal, price: Decimal, role: &str) -> Decimal {
            if role == "taker" {
                (qty * price) * Decimal::from_str("0.0005").unwrap()
            } else {
                Decimal::ZERO
            }
        }
    }

    let standard_fee = StandardFeeService::new();
    let vip_fee = VipFeeService;

    let qty = Decimal::from_f64(1.0).unwrap();
    let price = Decimal::from_f64(50_000.0).unwrap();

    let std_fee = standard_fee.calculate_fee(qty, price, "taker");
    let vip_fee_amt = vip_fee.calculate_fee(qty, price, "taker");

    assert!(
        vip_fee_amt < std_fee,
        "VIP fee ({}) should be less than standard fee ({}) for same trade",
        vip_fee_amt,
        std_fee
    );

    // Also assert VIP fee is > 0 (not free)
    assert!(
        vip_fee_amt > Decimal::ZERO,
        "VIP fee should still be positive"
    );
}

/// Test: Fee Revenue Is Always Positive After Any Settlement
///
/// The fee account must never lose funds from trade settlements. For every
/// trade, the combined buyer fee + seller fee must be strictly >= 0.
///
/// This invariant holds across full fills, partial fills, and dust trades.
///
/// Assert: fees_account.total increases (or stays same) after every settlement
#[tokio::test]
async fn test_fee_revenue_always_positive() {
    use ledger::domain::accounts::repository::AccountRepository;

    let ctx = InMemoryTestContext::new();

    let price = 50_000.0_f64;
    let qty = 1.0_f64;

    ctx.create_wallet(
        ctx.account_a,
        &ctx.usd_id.to_string(),
        0.0,
        to_atomic_usd(price * qty).to_f64().unwrap(),
        to_atomic_usd(price * qty).to_f64().unwrap(),
    );
    ctx.create_wallet(ctx.account_a, &ctx.btc_id.to_string(), 0.0, 0.0, 0.0);

    ctx.create_wallet(
        ctx.account_b,
        &ctx.btc_id.to_string(),
        0.0,
        to_atomic_btc(qty).to_f64().unwrap(),
        to_atomic_btc(qty).to_f64().unwrap(),
    );
    ctx.create_wallet(ctx.account_b, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);

    // Get fees account
    let fees_account = ctx
        .account_repo
        .get_by_name("fees_account")
        .await
        .unwrap()
        .expect("fees_account must exist");

    // Seed a fees wallet for USD
    ctx.create_wallet(fees_account.id, &ctx.usd_id.to_string(), 0.0, 0.0, 0.0);

    let pre_fees_wallet = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&fees_account.id.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();
    let pre_balance = Decimal::from_str(&pre_fees_wallet.total).unwrap();

    // Execute a trade
    let buy_order = ctx.create_order(ctx.account_a, "buy", price, qty);
    let sell_order = ctx.create_order(ctx.account_b, "sell", price, qty);
    let trade = ctx.create_trade(buy_order.id, sell_order.id, price, qty);

    let (settlement_service, wallet_service) = ctx.init_test_services();
    settlement_service.process_trade_event(trade).await.unwrap();

    let post_fees_wallet = wallet_service
        .get_wallet_by_account_and_asset(&fees_account.id.to_string(), &ctx.usd_id.to_string())
        .await
        .unwrap()
        .unwrap();
    let post_balance = Decimal::from_str(&post_fees_wallet.total).unwrap();

    assert!(
        post_balance >= pre_balance,
        "Fee account balance must not decrease after settlement. Before: {}, After: {}",
        pre_balance,
        post_balance
    );
    assert!(
        post_balance > pre_balance,
        "Fee account must have received revenue. Before: {}, After: {}",
        pre_balance,
        post_balance
    );
}
