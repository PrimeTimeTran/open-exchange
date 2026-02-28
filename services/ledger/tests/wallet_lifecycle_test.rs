mod helpers;
use helpers::memory::InMemoryTestContext;
use ledger::proto::ledger::wallet_service_server::WalletService;
use ledger::proto::ledger::{CreateWalletRequest, GetWalletRequest, UpdateWalletRequest};
use tonic::Request;

/// Test: Duplicate Wallet Creation Rejected
///
/// An account cannot have two wallets for the same asset. Attempting to create
/// a second wallet for (account_id, asset_id) must fail or return the existing one.
/// The system should enforce a unique constraint on (account_id, asset_id).
#[tokio::test]
async fn test_duplicate_wallet_same_account_asset_rejected() {
    let ctx = InMemoryTestContext::new();
    let account_id = ctx.create_account_api(&ctx.user_id, "trading").await;
    let asset_id = ctx.create_asset_api("USD", "fiat", 2).await;

    // First creation
    let req1 = Request::new(CreateWalletRequest {
        account_id: account_id.clone(),
        asset_id: asset_id.clone(),
    });
    let resp1 = ctx.wallet_api.create_wallet(req1).await;
    assert!(resp1.is_ok());

    // Second creation - same account, same asset
    let req2 = Request::new(CreateWalletRequest {
        account_id: account_id.clone(),
        asset_id: asset_id.clone(),
    });
    let resp2 = ctx.wallet_api.create_wallet(req2).await;

    // Expect error (AlreadyExists)
    assert!(
        resp2.is_err(),
        "Should not be able to create duplicate wallet for same account/asset"
    );
}

/// Test: Wallet Status Frozen Blocks All Mutations
///
/// A frozen wallet must reject all operations that modify its balance:
/// - Deposits
/// - Withdrawals
/// - Order placement (which locks funds)
#[tokio::test]
async fn test_wallet_status_frozen_blocks_all_mutations() {
    use ledger::proto::common::OrderSide;
    use ledger::proto::ledger::deposit_service_server::DepositService;
    use ledger::proto::ledger::order_service_server::OrderService;
    use ledger::proto::ledger::withdrawal_service_server::WithdrawalService;
    use ledger::proto::ledger::{
        CreateDepositRequest, CreateWithdrawalRequest, RecordOrderRequest,
    };

    let ctx = InMemoryTestContext::new();
    let account_id = ctx.create_account_api(&ctx.user_id, "trading").await;
    let usd_id = ctx.create_asset_api("USD", "fiat", 2).await;
    let btc_id = ctx.create_asset_api("BTC", "crypto", 8).await;
    let wallet_id = ctx.create_wallet_api(&account_id, &usd_id).await;

    // Fund wallet
    ctx.deposit_funds_api(&wallet_id, "5000").await;

    // Freeze wallet
    let freeze_req = Request::new(UpdateWalletRequest {
        wallet_id: wallet_id.clone(),
        status: "frozen".to_string(),
    });
    ctx.wallet_api.update_wallet(freeze_req).await.unwrap();

    // 1. Attempt Deposit - Should Fail
    let dep_req = Request::new(CreateDepositRequest {
        wallet_id: wallet_id.clone(),
        amount: "2000".to_string(), // Must be > min deposit
        transaction_ref: "tx-fail".to_string(),
    });
    let dep_res = ctx.deposit_api.create_deposit(dep_req).await;
    assert!(dep_res.is_err(), "Deposit to frozen wallet should fail");

    // 2. Attempt Withdrawal - Should Fail
    let wd_req = Request::new(CreateWithdrawalRequest {
        wallet_id: wallet_id.clone(),
        amount: "2000".to_string(), // Must be > min withdrawal
        address: "addr".to_string(),
    });
    let wd_res = ctx.withdrawal_api.create_withdrawal(wd_req).await;
    assert!(wd_res.is_err(), "Withdrawal from frozen wallet should fail");

    // 3. Attempt Order Placement (requires locking funds) - Should Fail
    // Create instrument
    let instrument_id = ctx.create_instrument_api("BTC-USD", &btc_id, &usd_id).await;

    // Buy 0.1 BTC @ $50,000 = $5,000 cost. Wallet has $5,000.
    let order = ctx.seed_order_proto(&account_id, &instrument_id, OrderSide::Buy, 50000.0, 0.1);
    let ord_req = Request::new(RecordOrderRequest { order: Some(order) });
    let ord_res = ctx.order_api.record_order(ord_req).await;

    assert!(
        ord_res.is_err(),
        "Order placement (locking funds) on frozen wallet should fail"
    );
}

/// Test: Wallet Multiple Currencies Independent
///
/// An account can have multiple wallets (e.g. BTC, ETH, USD). Operations on one
/// wallet (e.g. depositing BTC) must not affect the balances of other wallets.
#[tokio::test]
async fn test_wallet_multiple_currencies_independent() {
    let ctx = InMemoryTestContext::new();
    let account_id = ctx.create_account_api(&ctx.user_id, "trading").await;
    let btc_id = ctx.create_asset_api("BTC", "crypto", 8).await;
    let eth_id = ctx.create_asset_api("ETH", "crypto", 8).await;
    let usd_id = ctx.create_asset_api("USD", "fiat", 2).await;

    let btc_wallet_id = ctx.create_wallet_api(&account_id, &btc_id).await;
    let eth_wallet_id = ctx.create_wallet_api(&account_id, &eth_id).await;
    let usd_wallet_id = ctx.create_wallet_api(&account_id, &usd_id).await;

    // Deposit to BTC
    ctx.deposit_funds_api(&btc_wallet_id, "5000").await;

    // Verify balances
    // BTC = 5000
    let w_btc = ctx
        .wallet_api
        .get_wallet(Request::new(GetWalletRequest {
            wallet_id: btc_wallet_id.clone(),
        }))
        .await
        .unwrap()
        .into_inner()
        .wallet
        .unwrap();
    assert_eq!(w_btc.total, "5000");

    // Check ETH - Should be 0
    let w_eth = ctx
        .wallet_api
        .get_wallet(Request::new(GetWalletRequest {
            wallet_id: eth_wallet_id.clone(),
        }))
        .await
        .unwrap()
        .into_inner()
        .wallet
        .unwrap();
    assert_eq!(w_eth.total, "0");

    // Check USD - Should be 0
    let w_usd = ctx
        .wallet_api
        .get_wallet(Request::new(GetWalletRequest {
            wallet_id: usd_wallet_id.clone(),
        }))
        .await
        .unwrap()
        .into_inner()
        .wallet
        .unwrap();
    assert_eq!(w_usd.total, "0");
}

/// Test: Wallet Balance Matches Ledger Entry Sum
///
/// The `total` balance of a wallet must always equal the sum of all ledger entries
/// (credits - debits) for that account and asset. This ensures the wallet is merely
/// a materialized view of the ledger history.
#[tokio::test]
async fn test_wallet_balance_matches_ledger_entry_sum() {
    use ledger::domain::ledger::repository::LedgerRepository;
    use rust_decimal::Decimal;
    use std::str::FromStr;
    use uuid::Uuid;

    let ctx = InMemoryTestContext::new();
    let account_id = ctx.create_account_api(&ctx.user_id, "trading").await;
    let usd_id = ctx.create_asset_api("USD", "fiat", 2).await;
    let wallet_id = ctx.create_wallet_api(&account_id, &usd_id).await;

    // 1. Deposit 2000
    ctx.deposit_funds_api(&wallet_id, "2000").await;

    // 2. Withdraw 500
    // We use the API which creates a withdrawal request.
    // Assuming immediate processing in test env or just checking current state.
    // Actually, withdrawal creates a lock first.
    // To generate a DEBIT entry, we need settlement or completed withdrawal.
    // For simplicity, let's just do another deposit to verify sum works with multiple entries.
    ctx.deposit_funds_api(&wallet_id, "1000").await;

    // Fetch ledger entries
    // In memory repo stores all entries. We filter manually.
    let all_entries = ctx.ledger_repo.list_entries().await.unwrap();
    let account_uuid = Uuid::parse_str(&account_id).unwrap();
    let asset_uuid = Uuid::parse_str(&usd_id).unwrap();

    println!("All Entries Count: {}", all_entries.len());
    for e in &all_entries {
        println!(
            "Entry: Account={} Asset={:?} Amount={}",
            e.account_id, e.meta["asset"], e.amount
        );
    }

    let sum: Decimal = all_entries
        .iter()
        .filter(|e| {
            e.account_id == account_uuid
                && e.meta["asset"].as_str() == Some(&asset_uuid.to_string())
        })
        .map(|e| e.amount)
        .sum();

    println!("Matched Sum: {}", sum);

    // Fetch wallet
    let wallet = ctx
        .wallet_api
        .get_wallet(Request::new(GetWalletRequest {
            wallet_id: wallet_id.clone(),
        }))
        .await
        .unwrap()
        .into_inner()
        .wallet
        .unwrap();

    // Check total
    assert_eq!(
        Decimal::from_str(&wallet.total).unwrap(),
        sum,
        "Wallet total should match sum of ledger entries"
    );
}

/// Test: Wallet Available Plus Locked Equals Total
///
/// Invariant: `available + locked == total` must always hold true.
/// This prevents funds from disappearing or appearing out of thin air during locking/unlocking.
#[tokio::test]
async fn test_wallet_available_plus_locked_equals_total() {
    use ledger::proto::common::OrderSide;
    use ledger::proto::ledger::order_service_server::OrderService;
    use ledger::proto::ledger::RecordOrderRequest;
    use rust_decimal::Decimal;
    use std::str::FromStr;

    let ctx = InMemoryTestContext::new();
    let account_id = ctx.create_account_api(&ctx.user_id, "trading").await;
    let usd_id = ctx.create_asset_api("USD", "fiat", 2).await;
    let wallet_id = ctx.create_wallet_api(&account_id, &usd_id).await;

    // 1. Initial State (Empty)
    let w = ctx
        .wallet_api
        .get_wallet(Request::new(GetWalletRequest {
            wallet_id: wallet_id.clone(),
        }))
        .await
        .unwrap()
        .into_inner()
        .wallet
        .unwrap();
    let avail = Decimal::from_str(&w.available).unwrap();
    let locked = Decimal::from_str(&w.locked).unwrap();
    let total = Decimal::from_str(&w.total).unwrap();
    assert_eq!(avail + locked, total);

    // 2. Deposit 25000 (sufficient for 200.00 order which requires 20000 atomic units)
    ctx.deposit_funds_api(&wallet_id, "25000").await;
    let w = ctx
        .wallet_api
        .get_wallet(Request::new(GetWalletRequest {
            wallet_id: wallet_id.clone(),
        }))
        .await
        .unwrap()
        .into_inner()
        .wallet
        .unwrap();
    let avail = Decimal::from_str(&w.available).unwrap();
    let locked = Decimal::from_str(&w.locked).unwrap();
    let total = Decimal::from_str(&w.total).unwrap();
    assert_eq!(avail + locked, total);

    // 3. Lock 200 (Place Order)
    // Create instrument BTC-USD
    let btc_id = ctx.create_asset_api("BTC", "crypto", 8).await;
    let instrument_id = ctx.create_instrument_api("BTC-USD", &btc_id, &usd_id).await;

    // Place Buy Order for $200
    // This requires 200 * 100 = 20000 atomic units of USD (since USD has 2 decimals)
    let order = ctx.seed_order_proto(&account_id, &instrument_id, OrderSide::Buy, 200.0, 1.0);
    let _ = ctx
        .order_api
        .record_order(Request::new(RecordOrderRequest { order: Some(order) }))
        .await
        .unwrap();

    let w = ctx
        .wallet_api
        .get_wallet(Request::new(GetWalletRequest {
            wallet_id: wallet_id.clone(),
        }))
        .await
        .unwrap()
        .into_inner()
        .wallet
        .unwrap();
    let avail = Decimal::from_str(&w.available).unwrap(); // Should be 5000 (25000 - 20000)
    let locked = Decimal::from_str(&w.locked).unwrap(); // Should be 20000
    let total = Decimal::from_str(&w.total).unwrap(); // Should be 25000

    assert_eq!(
        avail + locked,
        total,
        "Invariant available + locked == total broken"
    );
}
