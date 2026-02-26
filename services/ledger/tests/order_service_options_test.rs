mod helpers;
use chrono::Utc;
use helpers::memory::InMemoryTestContext;
use helpers::{to_atomic_btc, to_atomic_usd};
use ledger::domain::orders::{Order, OrderSide, OrderType};
use rust_decimal::Decimal;
use std::str::FromStr;
use uuid::Uuid;

#[tokio::test]
async fn test_sell_call_option_locks_underlying_collateral(
) -> Result<(), Box<dyn std::error::Error>> {
    let ctx = InMemoryTestContext::new();

    // 1. Setup Option Instrument (Call)
    let usd_id = ctx.create_asset_api("USD", "fiat", 2).await;
    let btc_id = ctx.create_asset_api("BTC", "crypto", 8).await;

    let instrument_id = Uuid::new_v4();
    ctx.instrument_repo
        .add(ledger::domain::instruments::model::Instrument {
            id: instrument_id,
            tenant_id: ctx.tenant_id,
            symbol: "BTC-CALL-50K".to_string(),
            r#type: "option".to_string(),
            status: "active".to_string(),
            underlying_asset_id: Uuid::parse_str(&btc_id)?,
            quote_asset_id: Uuid::parse_str(&usd_id)?,
            meta: serde_json::json!({
                "option_type": "call",
                "strike_price": "50000",
                "expiry": Utc::now().timestamp_millis() + 86400000
            }),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        });

    let qty_btc_atomic = to_atomic_btc(1.0);
    let qty_btc_standard = Decimal::from_str("1.0")?;
    let premium_price = Decimal::from_str("500.0")?; // Price per unit

    // 2. Fund Account with BTC (Underlying)
    ctx.create_wallet_decimal(
        ctx.account_a,
        &btc_id,
        qty_btc_atomic,
        Decimal::ZERO,
        qty_btc_atomic,
    );
    // Ensure 0 USD
    ctx.create_wallet_decimal(
        ctx.account_a,
        &usd_id,
        Decimal::ZERO,
        Decimal::ZERO,
        Decimal::ZERO,
    );

    // 3. Place Sell Order (Write Call)
    let order = Order::new(
        ctx.tenant_id,
        ctx.account_a,
        instrument_id,
        OrderSide::Sell,
        OrderType::Limit,
        qty_btc_standard,
        premium_price,
    );

    let _created_order = ctx
        .order_service
        .create_order(order)
        .await
        .expect("Order creation failed");

    // 4. Verify BTC Locked
    let btc_wallet = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &btc_id)
        .await
        .expect("Failed to get wallet")
        .expect("Wallet not found");
    // Wallet stores Atomic units. 1.0 BTC standard = 100,000,000 atomic
    assert_eq!(Decimal::from_str(&btc_wallet.locked)?, qty_btc_atomic);
    assert_eq!(Decimal::from_str(&btc_wallet.available)?, Decimal::ZERO);
    Ok(())
}

#[tokio::test]
async fn test_sell_put_option_locks_cash_collateral() -> Result<(), Box<dyn std::error::Error>> {
    let ctx = InMemoryTestContext::new();

    // 1. Setup Option Instrument (Put)
    let usd_id = ctx.create_asset_api("USD", "fiat", 2).await;
    let btc_id = ctx.create_asset_api("BTC", "crypto", 8).await;

    let instrument_id = Uuid::new_v4();
    let _strike_price_standard = Decimal::from_str("50000.0")?; // 50k USD

    ctx.instrument_repo
        .add(ledger::domain::instruments::model::Instrument {
            id: instrument_id,
            tenant_id: ctx.tenant_id,
            symbol: "BTC-PUT-50K".to_string(),
            r#type: "option".to_string(),
            status: "active".to_string(),
            underlying_asset_id: Uuid::parse_str(&btc_id)?,
            quote_asset_id: Uuid::parse_str(&usd_id)?,
            meta: serde_json::json!({
                "option_type": "put",
                "strike_price": "50000",
                "expiry": Utc::now().timestamp_millis() + 86400000
            }),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        });

    let qty_btc_standard = Decimal::from_str("1.0")?; // 1 BTC contract

    // Required Cash Collateral = Strike * Qty = 50,000 * 1.0 = 50,000 USD
    // Atomic USD = 50,000 * 100 = 5,000,000
    let required_collateral_atomic = to_atomic_usd(50_000.0);

    // 2. Fund Account with USD (Cash)
    ctx.create_wallet_decimal(
        ctx.account_a,
        &usd_id,
        required_collateral_atomic,
        Decimal::ZERO,
        required_collateral_atomic,
    );
    // Ensure 0 BTC
    ctx.create_wallet_decimal(
        ctx.account_a,
        &btc_id,
        Decimal::ZERO,
        Decimal::ZERO,
        Decimal::ZERO,
    );

    // 3. Place Sell Order (Write Put)
    let order = Order::new(
        ctx.tenant_id,
        ctx.account_a,
        instrument_id,
        OrderSide::Sell,
        OrderType::Limit,
        qty_btc_standard,
        Decimal::from_str("500.0")?,
    );

    let _created_order = ctx
        .order_service
        .create_order(order)
        .await
        .expect("Order creation failed");

    // 4. Verify USD Locked (Not BTC)
    let usd_wallet = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &usd_id)
        .await
        .expect("Failed to get wallet")
        .expect("Wallet not found");
    assert_eq!(
        Decimal::from_str(&usd_wallet.locked)?,
        required_collateral_atomic,
        "Should lock Strike * Qty in Cash"
    );

    // BTC wallet should remain empty/untouched (or locking 0)
    let btc_wallet = ctx
        .wallet_service
        .get_wallet_by_account_and_asset(&ctx.account_a.to_string(), &btc_id)
        .await
        .expect("Failed to get wallet")
        .expect("Wallet not found");
    assert_eq!(Decimal::from_str(&btc_wallet.locked)?, Decimal::ZERO);
    Ok(())
}

#[tokio::test]
async fn test_sell_put_option_fails_insufficient_collateral(
) -> Result<(), Box<dyn std::error::Error>> {
    let ctx = InMemoryTestContext::new();

    // 1. Setup Option Instrument (Put)
    let usd_id = ctx.create_asset_api("USD", "fiat", 2).await;
    let btc_id = ctx.create_asset_api("BTC", "crypto", 8).await;

    let instrument_id = Uuid::new_v4();
    ctx.instrument_repo
        .add(ledger::domain::instruments::model::Instrument {
            id: instrument_id,
            tenant_id: ctx.tenant_id,
            symbol: "BTC-PUT-50K".to_string(),
            r#type: "option".to_string(),
            status: "active".to_string(),
            underlying_asset_id: Uuid::parse_str(&btc_id)?,
            quote_asset_id: Uuid::parse_str(&usd_id)?,
            meta: serde_json::json!({
                "option_type": "put",
                "strike_price": "50000",
                "expiry": Utc::now().timestamp_millis() + 86400000
            }),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        });

    let qty_btc = to_atomic_btc(1.0);
    // Need 50k USD (atomic 5,000,000), but give only 10k (atomic 1,000,000)
    let insufficient_collateral_atomic = to_atomic_usd(10_000.0);

    ctx.create_wallet_decimal(
        ctx.account_a,
        &usd_id,
        insufficient_collateral_atomic,
        Decimal::ZERO,
        insufficient_collateral_atomic,
    );

    // 3. Place Sell Order (Write Put)
    let order = Order::new(
        ctx.tenant_id,
        ctx.account_a,
        instrument_id,
        OrderSide::Sell,
        OrderType::Limit,
        qty_btc,
        to_atomic_usd(500.0),
    );

    let result = ctx.order_service.create_order(order).await;

    assert!(result.is_err(), "Should fail due to insufficient funds");
    Ok(())
}
