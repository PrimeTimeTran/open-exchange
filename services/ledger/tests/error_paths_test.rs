#[macro_use]
mod helpers;

use helpers::memory::InMemoryTestContext;
use ledger::domain::orders::model::{ Order, OrderSide, OrderType };
use ledger::domain::instruments::model::Instrument;
use ledger::error::AppError;
use rust_decimal::Decimal;
use std::str::FromStr;
use serde_json::json;
use uuid::Uuid;

#[tokio::test]
async fn test_insufficient_funds_error_details() {
    let ctx = InMemoryTestContext::new();

    // 1. Account has 100 USD (10000 cents)
    ctx.create_wallet(ctx.account_a, &ctx.usd_id.to_string(), 100.0, 0.0, 100.0);

    // 2. Try to buy 1 BTC at $500 (needs $500)
    let order = Order::new(
        ctx.tenant_id,
        ctx.account_a,
        ctx.instrument_id,
        OrderSide::Buy,
        OrderType::Limit,
        Decimal::from_str("1.0").unwrap(),
        Decimal::from_str("500.0").unwrap()
    );

    let result = ctx.order_service.create_order(order).await;

    match result {
        Err(AppError::InsufficientFunds { asset, required, available }) => {
            assert_eq!(asset, ctx.usd_id.to_string());
            assert!(!required.is_empty());
            assert!(!available.is_empty());
        }
        _ => panic!("Expected InsufficientFunds, got: {:?}", result),
    }
}

#[tokio::test]
async fn test_invalid_instrument_error() {
    let ctx = InMemoryTestContext::new();
    let bad_instrument_id = Uuid::new_v4();

    let order = Order::new(
        ctx.tenant_id,
        ctx.account_a,
        bad_instrument_id,
        OrderSide::Buy,
        OrderType::Limit,
        Decimal::from_str("1.0").unwrap(),
        Decimal::from_str("100.0").unwrap()
    );

    let result = ctx.order_service.create_order(order).await;

    match result {
        Err(AppError::InvalidInstrument(id)) => {
            assert_eq!(id, bad_instrument_id.to_string());
        }
        _ => panic!("Expected InvalidInstrument, got: {:?}", result),
    }
}

#[tokio::test]
async fn test_not_found_error() {
    let ctx = InMemoryTestContext::new();

    // Trigger NotFound by updating a non-existent account
    use ledger::domain::accounts::Account;
    let bad_id = Uuid::new_v4();
    let mut account = Account::default();
    account.id = bad_id;
    account.tenant_id = ctx.tenant_id.to_string(); // Correct String type
    account.user_id = ctx.account_a.to_string(); // Required field

    let result = ctx.account_service.update_account(account).await;

    match result {
        Err(AppError::NotFound(msg)) => {
            assert!(msg.contains("Account") || msg.contains(&bad_id.to_string()));
        }
        _ => panic!("Expected NotFound, got: {:?}", result),
    }
}

#[tokio::test]
async fn test_validation_error() {
    let ctx = InMemoryTestContext::new();

    // Attempt with negative price (Should trigger Validation Error now)
    let order = Order::new(
        ctx.tenant_id,
        ctx.account_a,
        ctx.instrument_id,
        OrderSide::Buy,
        OrderType::Limit,
        Decimal::from_str("1.0").unwrap(),
        Decimal::from_str("-10.0").unwrap()
    );

    let result = ctx.order_service.create_order(order).await;

    match result {
        Err(AppError::ValidationError(msg)) => {
            // Check if message mentions price
            assert!(
                msg.to_lowercase().contains("price") || msg.to_lowercase().contains("positive")
            );
        }
        _ => panic!("Expected ValidationError for negative price, got: {:?}", result),
    }
}

#[tokio::test]
async fn test_malformed_request_error() {
    let ctx = InMemoryTestContext::new();

    // Create a new Option instrument without "option_type" in metadata
    let option_id = Uuid::new_v4();
    let option_instrument = Instrument {
        id: option_id,
        tenant_id: ctx.tenant_id,
        symbol: "BTC-OPT-BAD".to_string(),
        r#type: "option".to_string(),
        status: "active".to_string(),
        underlying_asset_id: ctx.btc_id,
        quote_asset_id: ctx.usd_id,
        meta: json!({}), // Missing option_type
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };

    // Add to repo
    ctx.instrument_repo.add(option_instrument);

    // Create an order for this option (Sell side usually triggers checks in OptionHandler)
    let order = Order::new(
        ctx.tenant_id,
        ctx.account_a,
        option_id,
        OrderSide::Sell,
        OrderType::Limit,
        Decimal::from_str("1.0").unwrap(),
        Decimal::from_str("100.0").unwrap()
    );

    let result = ctx.order_service.create_order(order).await;

    match result {
        Err(AppError::MalformedRequest(msg)) => {
            assert!(msg.contains("Missing option_type"));
        }
        _ => panic!("Expected MalformedRequest, got: {:?}", result),
    }
}
