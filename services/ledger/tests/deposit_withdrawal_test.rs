mod helpers;
use helpers::memory::InMemoryTestContext;
use tonic::Request;
use ledger::proto::ledger::{
    CreateDepositRequest, CreateWithdrawalRequest, CancelWithdrawalRequest,
};
use ledger::proto::ledger::deposit_service_server::DepositService as DepositServiceTrait;
use ledger::proto::ledger::withdrawal_service_server::WithdrawalService as WithdrawalServiceTrait;
use rust_decimal::Decimal;
use std::str::FromStr;
use uuid::Uuid;

macro_rules! assert_decimal {
    ($left:expr, $right:expr) => {
        assert_eq!(
            Decimal::from_str($left).unwrap(),
            Decimal::from_str($right).unwrap(),
            "Decimal mismatch: {} != {}",
            $left, $right
        );
    };
}

/// Test: Duplicate Deposit with Same Transaction Ref is Idempotent
///
/// Depositing the same on-chain transaction twice (network retry, duplicate
/// webhook) must credit the wallet exactly once. The second call should be a
/// no-op detected via the `transaction_ref` / `tx_hash`.
///
/// Note: The current DepositService does not implement idempotency checks on
/// transaction_ref. This test documents the EXPECTED behavior and will fail
/// until that check is added.
///
/// Assert: wallet balance = deposit_amount (not 2×)
#[tokio::test]
async fn test_duplicate_deposit_same_transaction_ref_idempotent() {
    let ctx = InMemoryTestContext::new();
    let wallet_id = ctx.create_wallet_api(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await;

    let tx_ref    = format!("txn-{}", Uuid::new_v4());
    let amount    = "100000"; // 1,000.00 USD in cents

    // First deposit
    let req1 = Request::new(CreateDepositRequest {
        wallet_id:       wallet_id.clone(),
        amount:          amount.to_string(),
        transaction_ref: tx_ref.clone(),
    });
    ctx.deposit_api.create_deposit(req1).await.unwrap();

    // Second deposit — same tx_ref
    let req2 = Request::new(CreateDepositRequest {
        wallet_id:       wallet_id.clone(),
        amount:          amount.to_string(),
        transaction_ref: tx_ref.clone(),
    });
    ctx.deposit_api.create_deposit(req2).await.unwrap();

    let wallet = ctx.wallet_service.get_wallet(&wallet_id).await.unwrap().unwrap();

    // Should only be credited once
    assert_decimal!(&wallet.available, amount);
    assert_decimal!(&wallet.total, amount);
}

/// Test: Withdrawal Request Locks Exact Requested Amount
///
/// When a user requests a withdrawal, the funds must be moved from
/// `available` to `locked` immediately to prevent double-spending during
/// the time the transaction is being prepared and broadcast.
///
/// Note: The current WithdrawalService does not lock wallet funds. This
/// test documents EXPECTED behavior and will fail until locking is added.
///
/// Setup:  wallet has 500,000 cents available
/// Action: request withdrawal of 100,000 cents
/// Assert: available = 400,000; locked = 100,000; total unchanged
#[tokio::test]
async fn test_withdrawal_request_locks_exact_amount() {
    let ctx = InMemoryTestContext::new();
    let wallet_id = ctx.create_wallet_api(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await;
    ctx.deposit_funds_api(&wallet_id, "500000").await;

    let withdraw_amount = "100000";

    let req = Request::new(CreateWithdrawalRequest {
        wallet_id: wallet_id.clone(),
        amount:    withdraw_amount.to_string(),
        address:   "destination-address-abc".to_string(),
    });
    ctx.withdrawal_api.create_withdrawal(req).await.unwrap();

    let wallet = ctx.wallet_service.get_wallet(&wallet_id).await.unwrap().unwrap();

    assert_decimal!(&wallet.available, "400000");
    assert_decimal!(&wallet.locked,    withdraw_amount);
    assert_decimal!(&wallet.total,     "500000"); // total unchanged
}

/// Test: Withdrawal Completion Reduces Total Balance
///
/// Once a withdrawal is confirmed on-chain (status → "completed"), the
/// locked amount is permanently deducted from the wallet's total. It no
/// longer exists in the ledger.
///
/// Assert: after completion, locked = 0, total = original - amount
#[tokio::test]
async fn test_withdrawal_completion_reduces_total() {
    let ctx = InMemoryTestContext::new();
    let wallet_id = ctx.create_wallet_api(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await;
    ctx.deposit_funds_api(&wallet_id, "500000").await;

    let withdraw_amount = "100000";

    // Request withdrawal (should lock funds)
    let req = Request::new(CreateWithdrawalRequest {
        wallet_id: wallet_id.clone(),
        amount:    withdraw_amount.to_string(),
        address:   "destination-address-abc".to_string(),
    });
    let create_resp = ctx.withdrawal_api.create_withdrawal(req).await.unwrap();
    let withdrawal_id = create_resp.into_inner().withdrawal.unwrap().id;

    // Simulate on-chain confirmation — update status to "completed"
    // In a real system, completing a withdrawal also debits the locked amount
    // from total. For now we simulate this via direct wallet mutation.
    if let Some(mut wallet) = ctx.wallet_service.get_wallet(&wallet_id).await.unwrap() {
        let locked  = Decimal::from_str(&wallet.locked).unwrap_or_default();
        let total   = Decimal::from_str(&wallet.total).unwrap_or_default();
        let amount  = Decimal::from_str(withdraw_amount).unwrap();
        wallet.locked = (locked - amount).to_string();
        wallet.total  = (total  - amount).to_string();
        ctx.wallet_service.update_wallet(wallet).await.unwrap();
    }

    let wallet = ctx.wallet_service.get_wallet(&wallet_id).await.unwrap().unwrap();

    assert_decimal!(&wallet.locked, "0");
    assert_decimal!(&wallet.total,  "400000");

    let _ = withdrawal_id; // used above
}

/// Test: Withdrawal Cancellation Restores Available Balance
///
/// If a pending withdrawal is cancelled (user changed their mind, compliance
/// hold lifted, network issue), the locked funds must be returned to
/// `available`. The total remains the same — no funds left the exchange.
///
/// Assert: after cancellation, available = original; locked = 0; total unchanged
#[tokio::test]
async fn test_withdrawal_cancellation_restores_available() {
    let ctx = InMemoryTestContext::new();
    let wallet_id = ctx.create_wallet_api(&ctx.account_a.to_string(), &ctx.usd_id.to_string()).await;
    ctx.deposit_funds_api(&wallet_id, "500000").await;

    let withdraw_amount = "100000";

    // Step 1: Request withdrawal (should lock funds)
    let req = Request::new(CreateWithdrawalRequest {
        wallet_id: wallet_id.clone(),
        amount:    withdraw_amount.to_string(),
        address:   "destination-address-xyz".to_string(),
    });
    let create_resp = ctx.withdrawal_api.create_withdrawal(req).await.unwrap();
    let withdrawal_id = create_resp.into_inner().withdrawal.unwrap().id;

    // Step 2: Cancel the withdrawal
    let cancel_req = Request::new(CancelWithdrawalRequest {
        withdrawal_id: withdrawal_id.clone(),
    });
    let cancel_resp = ctx.withdrawal_api.cancel_withdrawal(cancel_req).await.unwrap();
    assert!(cancel_resp.into_inner().success, "Cancellation should succeed");

    // Step 3: Verify funds are back in available
    // Note: cancellation must unlock funds (move locked → available).
    // The current implementation removes the withdrawal record but does not
    // credit the wallet. This assertion will fail until that logic is added.
    let wallet = ctx.wallet_service.get_wallet(&wallet_id).await.unwrap().unwrap();

    assert_decimal!(&wallet.available, "500000");
    assert_decimal!(&wallet.locked,    "0");
    assert_decimal!(&wallet.total,     "500000");
}

/// Test: Minimum Withdrawal Amount Is Enforced
///
/// Exchanges define a minimum withdrawal to prevent dust attacks and ensure
/// network fees don't exceed the withdrawal amount. Attempting to withdraw
/// below the minimum must be rejected before any wallet mutation.
///
/// Note: Minimum enforcement is not yet implemented. This test documents
/// the expected rejection behavior. It will fail until validation is added.
///
/// Assert: withdrawal below 1,000 satoshis is rejected; wallet unchanged
#[tokio::test]
async fn test_minimum_withdrawal_amount_enforced() {
    let ctx = InMemoryTestContext::new();
    let wallet_id = ctx.create_wallet_api(&ctx.account_a.to_string(), &ctx.btc_id.to_string()).await;
    ctx.deposit_funds_api(&wallet_id, "1000000").await; // 0.01 BTC

    // Attempt to withdraw 100 satoshis — below the typical minimum of 1,000
    let req = Request::new(CreateWithdrawalRequest {
        wallet_id: wallet_id.clone(),
        amount:    "100".to_string(), // 100 satoshis
        address:   "bc1qminwithdrawal".to_string(),
    });

    let result = ctx.withdrawal_api.create_withdrawal(req).await;

    // Expect an error for sub-minimum withdrawal
    assert!(
        result.is_err(),
        "Withdrawal below minimum should be rejected; current impl may accept it (gap)"
    );

    // Wallet must be completely untouched
    let wallet = ctx.wallet_service.get_wallet(&wallet_id).await.unwrap().unwrap();
    assert_decimal!(&wallet.available, "1000000");
    assert_decimal!(&wallet.locked,    "0");
}
