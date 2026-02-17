use crate::helpers::memory::InMemoryTestContext;
use crate::helpers::memory::assert_decimal;
use ledger::proto::ledger::{RecordOrderRequest, CreateAssetRequest, CreateInstrumentRequest, CreateAccountRequest, CreateDepositRequest, CreateWalletRequest};
use ledger::proto::ledger::order_service_server::OrderService; // Trait
use ledger::proto::ledger::asset_service_server::AssetService;
use ledger::proto::ledger::account_service_server::AccountService;
use ledger::proto::ledger::deposit_service_server::DepositService;
use ledger::proto::ledger::wallet_service_server::WalletService as WalletServiceTrait;
use ledger::proto::common::{OrderSide, OrderType, OrderStatus, TimeInForce, Order};
use tonic::Request;
use uuid::Uuid;
use std::str::FromStr;
use rust_decimal::Decimal;

#[tokio::test]
async fn test_order_scaling_and_locking() {
    let ctx = InMemoryTestContext::new();

    // 1. Setup Assets (BTC: 8 decimals, USD: 2 decimals)
    // Proto field 'precision' maps to decimals
    let btc_resp = ctx.asset_api.create_asset(Request::new(CreateAssetRequest {
        symbol: "BTC".to_string(),
        klass: "crypto".to_string(),
        precision: 8,
    })).await.unwrap().into_inner();
    let btc_id = btc_resp.asset.unwrap().id;

    let usd_resp = ctx.asset_api.create_asset(Request::new(CreateAssetRequest {
        symbol: "USD".to_string(),
        klass: "fiat".to_string(),
        precision: 2,
    })).await.unwrap().into_inner();
    let usd_id = usd_resp.asset.unwrap().id;

    // 2. Setup Instrument (BTC-USD)
    let inst_resp = ctx.asset_api.create_instrument(Request::new(CreateInstrumentRequest {
        symbol: "BTC-USD".to_string(),
        r#type: "spot".to_string(),
        base_asset_id: btc_id.clone(),
        quote_asset_id: usd_id.clone(),
    })).await.unwrap().into_inner();
    let instrument_id = inst_resp.instrument.unwrap().id;

    // 3. Setup Account
    let acc_resp = ctx.account_api.create_account(Request::new(CreateAccountRequest {
        user_id: ctx.user_id.to_string(),
        r#type: "margin".to_string(),
    })).await.unwrap().into_inner();
    let account_id = acc_resp.account.unwrap().id;

    // 4. Create Wallet for USD
    let wallet_resp = ctx.wallet_api.create_wallet(Request::new(CreateWalletRequest {
        account_id: account_id.clone(),
        asset_id: usd_id.clone(),
    })).await.unwrap().into_inner();
    let wallet_id = wallet_resp.wallet.unwrap().id;

    // 5. Deposit Funds
    // Initial Balance: $15,000,000.00 -> 1,500,000,000 cents
    let initial_balance_atomic = "1500000000"; 
    ctx.deposit_api.create_deposit(Request::new(CreateDepositRequest {
        wallet_id: wallet_id.clone(),
        amount: initial_balance_atomic.to_string(),
        transaction_ref: "tx1".to_string(),
    })).await.unwrap();

    // 6. Record Order (Human Readable Inputs)
    // Buy 2 BTC at $50,000
    // Total Value: $100,000
    let order_id = Uuid::new_v4().to_string();
    let order_req = Order {
        id: order_id.clone(),
        tenant_id: ctx.tenant_id.to_string(),
        account_id: account_id.clone(),
        instrument_id: instrument_id.clone(),
        side: OrderSide::Buy as i32,
        r#type: OrderType::Limit as i32,
        // Crucial: Client sends human readable strings
        quantity: "2".to_string(),
        price: "50000".to_string(), 
        quantity_filled: "0".to_string(),
        time_in_force: TimeInForce::Gtc as i32,
        status: OrderStatus::Open as i32,
        meta: "{}".to_string(),
        created_at: 0,
        updated_at: 0,
    };

    let response = ctx.order_api.record_order(Request::new(RecordOrderRequest {
        order: Some(order_req),
    })).await;

    assert!(response.is_ok(), "Record order failed: {:?}", response.err());

    // 7. Verify Order Storage (Should be Human Readable)
    let stored_order = ctx.order_api.get_order_internal(Uuid::parse_str(&order_id).unwrap()).await.unwrap().unwrap();
    
    // We expect the stored values to match the input EXACTLY (no scaling down to 0.05 etc)
    assert_eq!(stored_order.quantity, Decimal::from(2));
    assert_eq!(stored_order.price, Decimal::from(50000));

    // 8. Verify Wallet Locking (Should be Atomic)
    // Required: $100,000 -> 10,000,000 cents
    let wallets = ctx.wallet_api.list_wallets_internal(&account_id).await.unwrap();
    let usd_wallet = wallets.iter().find(|w| w.asset_id == usd_id).unwrap();

    let expected_locked = Decimal::from(10_000_000); // 100k * 100
    let expected_available = Decimal::from_str(initial_balance_atomic).unwrap() - expected_locked;

    assert_decimal(&usd_wallet.locked, &expected_locked.to_string());
    assert_decimal(&usd_wallet.available, &expected_available.to_string());
}
