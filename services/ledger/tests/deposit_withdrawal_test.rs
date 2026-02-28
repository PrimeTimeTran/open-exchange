mod helpers;
use helpers::memory::InMemoryTestContext;
use ledger::proto::ledger::deposit_service_server::DepositService as DepositServiceTrait;
use ledger::proto::ledger::wallet_service_server::WalletService as WalletServiceTrait;
use ledger::proto::ledger::withdrawal_service_server::WithdrawalService as WithdrawalServiceTrait;
use ledger::proto::ledger::{
    CancelWithdrawalRequest, CreateDepositRequest, CreateWithdrawalRequest, UpdateWalletRequest,
};
use rust_decimal::Decimal;
use std::str::FromStr;
use tonic::Request;
use uuid::Uuid;

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
    let wallet_id = ctx
        .create_wallet_api(&ctx.account_a.to_string(), &ctx.usd_id.to_string())
        .await;

    let tx_ref = format!("txn-{}", Uuid::new_v4());
    let amount_val = helpers::to_atomic_usd(1000.0); // $1,000.00
    let amount = amount_val.to_string();

    // First deposit
    let req1 = Request::new(CreateDepositRequest {
        wallet_id: wallet_id.clone(),
        amount: amount.clone(),
        transaction_ref: tx_ref.clone(),
    });
    ctx.deposit_api.create_deposit(req1).await.unwrap();

    // Second deposit — same tx_ref
    let req2 = Request::new(CreateDepositRequest {
        wallet_id: wallet_id.clone(),
        amount: amount.clone(),
        transaction_ref: tx_ref.clone(),
    });
    ctx.deposit_api.create_deposit(req2).await.unwrap();

    let wallet = ctx
        .wallet_service
        .get_wallet(&wallet_id)
        .await
        .unwrap()
        .unwrap();

    // Should only be credited once
    assert_decimal_eq!(wallet.available, amount_val);
    assert_decimal_eq!(wallet.total, amount_val);
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
    // 500,000 cents = $5,000.00
    let wallet = ctx
        .seed_wallet(ctx.account_a, ctx.assets.usd, 5000.0, 0.0, 5000.0)
        .await;
    let wallet_id = wallet.id.to_string();

    let withdraw_amount_val = helpers::to_atomic_usd(1000.0); // $1,000.00
    let withdraw_amount = withdraw_amount_val.to_string();

    let req = Request::new(CreateWithdrawalRequest {
        wallet_id: wallet_id.clone(),
        amount: withdraw_amount.clone(),
        address: "destination-address-abc".to_string(),
    });
    ctx.withdrawal_api.create_withdrawal(req).await.unwrap();

    let wallet = ctx
        .wallet_service
        .get_wallet(&wallet_id)
        .await
        .unwrap()
        .unwrap();

    let expected_available = helpers::to_atomic_usd(4000.0); // $5,000 - $1,000
    assert_decimal_eq!(wallet.available, expected_available);
    assert_decimal_eq!(wallet.locked, withdraw_amount_val);
    assert_decimal_eq!(&wallet.total, "500000"); // total unchanged
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
    // 500,000 cents = $5,000.00
    let wallet = ctx
        .seed_wallet(ctx.account_a, ctx.assets.usd, 5000.0, 0.0, 5000.0)
        .await;
    let wallet_id = wallet.id.to_string();

    let withdraw_amount = "100000";

    // Request withdrawal (should lock funds)
    let req = Request::new(CreateWithdrawalRequest {
        wallet_id: wallet_id.clone(),
        amount: withdraw_amount.to_string(),
        address: "destination-address-abc".to_string(),
    });
    let create_resp = ctx.withdrawal_api.create_withdrawal(req).await.unwrap();
    let withdrawal_id = create_resp.into_inner().withdrawal.unwrap().id;

    // Simulate on-chain confirmation — update status to "completed"
    // In a real system, completing a withdrawal also debits the locked amount
    // from total. For now we simulate this via direct wallet mutation.
    if let Some(mut wallet) = ctx.wallet_service.get_wallet(&wallet_id).await.unwrap() {
        let locked = wallet.locked;
        let total = wallet.total;
        let amount = Decimal::from_str(withdraw_amount).unwrap();
        wallet.locked = locked - amount;
        wallet.total = total - amount;
        ctx.wallet_service.update_wallet(wallet).await.unwrap();
    }

    let wallet = ctx
        .wallet_service
        .get_wallet(&wallet_id)
        .await
        .unwrap()
        .unwrap();

    assert_decimal_eq!(&wallet.locked, "0");
    assert_decimal_eq!(&wallet.total, "400000");

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
    // 500,000 cents = $5,000.00
    let wallet = ctx
        .seed_wallet(ctx.account_a, ctx.assets.usd, 5000.0, 0.0, 5000.0)
        .await;
    let wallet_id = wallet.id.to_string();

    let withdraw_amount = "100000";

    // Step 1: Request withdrawal (should lock funds)
    let req = Request::new(CreateWithdrawalRequest {
        wallet_id: wallet_id.clone(),
        amount: withdraw_amount.to_string(),
        address: "destination-address-xyz".to_string(),
    });
    let create_resp = ctx.withdrawal_api.create_withdrawal(req).await.unwrap();
    let withdrawal_id = create_resp.into_inner().withdrawal.unwrap().id;

    // Step 2: Cancel the withdrawal
    let cancel_req = Request::new(CancelWithdrawalRequest {
        withdrawal_id: withdrawal_id.clone(),
    });
    let cancel_resp = ctx
        .withdrawal_api
        .cancel_withdrawal(cancel_req)
        .await
        .unwrap();
    assert!(
        cancel_resp.into_inner().success,
        "Cancellation should succeed"
    );

    // Step 3: Verify funds are back in available
    // Note: cancellation must unlock funds (move locked → available).
    // The current implementation removes the withdrawal record but does not
    // credit the wallet. This assertion will fail until that logic is added.
    let wallet = ctx
        .wallet_service
        .get_wallet(&wallet_id)
        .await
        .unwrap()
        .unwrap();

    assert_decimal_eq!(&wallet.available, "500000");
    assert_decimal_eq!(&wallet.locked, "0");
    assert_decimal_eq!(&wallet.total, "500000");
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
    // 1,000,000 sats = 0.01 BTC
    let wallet = ctx
        .seed_wallet(ctx.account_a, ctx.assets.btc, 0.01, 0.0, 0.01)
        .await;
    let wallet_id = wallet.id.to_string();

    // Attempt to withdraw 100 satoshis — below the typical minimum of 1,000
    let req = Request::new(CreateWithdrawalRequest {
        wallet_id: wallet_id.clone(),
        amount: "100".to_string(), // 100 satoshis
        address: "bc1qminwithdrawal".to_string(),
    });

    let result = ctx.withdrawal_api.create_withdrawal(req).await;

    // Expect an error for sub-minimum withdrawal
    assert!(
        result.is_err(),
        "Withdrawal below minimum should be rejected; current impl may accept it (gap)"
    );

    // Wallet must be completely untouched
    let wallet = ctx
        .wallet_service
        .get_wallet(&wallet_id)
        .await
        .unwrap()
        .unwrap();
    assert_decimal_eq!(&wallet.available, "1000000");
    assert_decimal_eq!(&wallet.locked, "0");
}

/// Test: Withdrawal Exceeds Available Balance Is Rejected
///
/// A user cannot withdraw more than their `available` balance. Locked funds
/// (e.g., in open orders) are not withdrawable.
///
/// Setup: 500 total, 400 locked, 100 available.
/// Action: Attempt to withdraw 200.
/// Expect: Error (insufficient funds), wallet balances unchanged.
#[tokio::test]
async fn test_withdrawal_exceeds_available_rejected() {
    let ctx = InMemoryTestContext::new();
    // 100 available, 400 locked, 500 total
    let wallet = ctx
        .seed_wallet(ctx.account_a, ctx.assets.usd, 100.0, 400.0, 500.0)
        .await;
    let wallet_id = wallet.id.to_string();

    let req = Request::new(CreateWithdrawalRequest {
        wallet_id: wallet_id.clone(),
        amount: helpers::to_atomic_usd(200.0).to_string(), // Request 200 > 100
        address: "addr".to_string(),
    });

    let result = ctx.withdrawal_api.create_withdrawal(req).await;

    assert!(
        result.is_err(),
        "Withdrawal exceeding available balance should be rejected"
    );

    // Verify balances unchanged
    let wallet = ctx
        .wallet_service
        .get_wallet(&wallet_id)
        .await
        .unwrap()
        .unwrap();
    assert_decimal_eq!(wallet.available, helpers::to_atomic_usd(100.0));
    assert_decimal_eq!(wallet.locked, helpers::to_atomic_usd(400.0));
    assert_decimal_eq!(wallet.total, helpers::to_atomic_usd(500.0));
}

/// Test: Withdrawal of Locked Funds Rejected
///
/// This explicitly verifies that the "locked" portion of a wallet is not
/// available for withdrawal, even if the total balance is sufficient.
///
/// Setup: 500 total, 400 locked, 100 available.
/// Action: Attempt to withdraw 150 (total > 150, but available < 150).
#[tokio::test]
async fn test_withdrawal_of_locked_funds_rejected() {
    let ctx = InMemoryTestContext::new();
    // 100 available, 400 locked, 500 total
    let wallet = ctx
        .seed_wallet(ctx.account_a, ctx.assets.usd, 100.0, 400.0, 500.0)
        .await;
    let wallet_id = wallet.id.to_string();

    let req = Request::new(CreateWithdrawalRequest {
        wallet_id: wallet_id.clone(),
        amount: helpers::to_atomic_usd(150.0).to_string(),
        address: "addr".to_string(),
    });

    let result = ctx.withdrawal_api.create_withdrawal(req).await;
    assert!(
        result.is_err(),
        "Withdrawal accessing locked funds should be rejected"
    );
}

/// Test: Deposit Below Minimum Rejected
///
/// Deposits below a configured minimum threshold (to prevent dust spam) must be rejected.
///
/// Action: Deposit 1 satoshi (0.00000001 BTC).
/// Expect: Error (amount too low).
#[tokio::test]
async fn test_deposit_below_minimum_rejected() {
    let ctx = InMemoryTestContext::new();
    let wallet_id = ctx
        .create_wallet_api(&ctx.account_a.to_string(), &ctx.assets.btc.to_string())
        .await;

    // Attempt to deposit 1 satoshi
    let req = Request::new(CreateDepositRequest {
        wallet_id: wallet_id.clone(),
        amount: "1".to_string(),
        transaction_ref: "tx-dust-1".to_string(),
    });

    let result = ctx.deposit_api.create_deposit(req).await;
    assert!(
        result.is_err(),
        "Deposit below minimum (dust) should be rejected"
    );
}

/// Test: Withdrawal Above Maximum Rejected
///
/// Withdrawals exceeding the daily or per-transaction limit must be rejected,
/// even if the user has sufficient funds.
///
/// Setup: Wallet with $20M available.
/// Action: Attempt to withdraw $15M (assuming max is e.g. $10M).
/// Expect: Rejection (limit exceeded).
#[tokio::test]
async fn test_withdrawal_above_maximum_rejected() {
    let ctx = InMemoryTestContext::new();
    // Seed with $20M
    let wallet = ctx
        .seed_wallet(
            ctx.account_a,
            ctx.assets.usd,
            20_000_000.0,
            0.0,
            20_000_000.0,
        )
        .await;
    let wallet_id = wallet.id.to_string();

    // Attempt to withdraw $15M
    let req = Request::new(CreateWithdrawalRequest {
        wallet_id: wallet_id.clone(),
        amount: helpers::to_atomic_usd(15_000_000.0).to_string(),
        address: "addr-limit-check".to_string(),
    });

    let result = ctx.withdrawal_api.create_withdrawal(req).await;
    assert!(
        result.is_err(),
        "Withdrawal exceeding maximum limit should be rejected"
    );
}

/// Test: Pending Withdrawal Blocks Second Withdrawal (Insufficient Funds)
///
/// If a user has 100 and requests a withdrawal of 100, those funds are locked.
/// A second request for 100 must be rejected because the funds are already
/// committed to the first withdrawal, even if it hasn't been processed on-chain.
///
/// Setup: 100 available.
/// Action 1: Withdraw 100.
/// Action 2: Withdraw 100.
/// Expect: Action 2 fails due to insufficient available funds.
#[tokio::test]
async fn test_pending_withdrawal_blocks_second_withdrawal() {
    let ctx = InMemoryTestContext::new();
    let wallet = ctx
        .seed_wallet(ctx.account_a, ctx.assets.usd, 100.0, 0.0, 100.0)
        .await;
    let wallet_id = wallet.id.to_string();

    // First withdrawal (locks 100)
    let req1 = Request::new(CreateWithdrawalRequest {
        wallet_id: wallet_id.clone(),
        amount: helpers::to_atomic_usd(100.0).to_string(),
        address: "addr1".to_string(),
    });
    ctx.withdrawal_api.create_withdrawal(req1).await.unwrap();

    // Second withdrawal (locks another 100 -> requires 200 total)
    let req2 = Request::new(CreateWithdrawalRequest {
        wallet_id: wallet_id.clone(),
        amount: helpers::to_atomic_usd(100.0).to_string(),
        address: "addr2".to_string(),
    });

    let result = ctx.withdrawal_api.create_withdrawal(req2).await;
    assert!(
        result.is_err(),
        "Second withdrawal should be rejected due to insufficient available funds"
    );
}

/// Test: Deposit To Frozen Wallet Rejected
///
/// A wallet in 'frozen' status (e.g. for compliance investigation) cannot receive
/// deposits. This prevents funds from entering a suspicious account.
///
/// Setup: Wallet created, then updated to status="frozen".
/// Action: Attempt deposit.
/// Expect: Rejection.
#[tokio::test]
async fn test_deposit_to_frozen_wallet_rejected() {
    let ctx = InMemoryTestContext::new();
    let wallet_id = ctx
        .create_wallet_api(&ctx.account_a.to_string(), &ctx.assets.usd.to_string())
        .await;

    // Freeze wallet
    let freeze_req = Request::new(UpdateWalletRequest {
        wallet_id: wallet_id.clone(),
        status: "frozen".to_string(),
    });
    ctx.wallet_api.update_wallet(freeze_req).await.unwrap();

    // Attempt deposit
    let req = Request::new(CreateDepositRequest {
        wallet_id: wallet_id.clone(),
        amount: helpers::to_atomic_usd(100.0).to_string(),
        transaction_ref: "tx-frozen".to_string(),
    });

    let result = ctx.deposit_api.create_deposit(req).await;
    assert!(
        result.is_err(),
        "Deposit to frozen wallet should be rejected"
    );
}

/// Test: Withdrawal From Frozen Wallet Rejected
///
/// A frozen wallet cannot be withdrawn from. This prevents funds from leaving
/// a suspicious account.
///
/// Setup: Wallet created, updated to status="frozen".
/// Action: Attempt withdrawal.
/// Expect: Rejection.
#[tokio::test]
async fn test_withdrawal_from_frozen_wallet_rejected() {
    let ctx = InMemoryTestContext::new();
    let wallet = ctx
        .seed_wallet(ctx.account_a, ctx.assets.usd, 100.0, 0.0, 100.0)
        .await;
    let wallet_id = wallet.id.to_string();

    // Freeze wallet
    let freeze_req = Request::new(UpdateWalletRequest {
        wallet_id: wallet_id.clone(),
        status: "frozen".to_string(),
    });
    ctx.wallet_api.update_wallet(freeze_req).await.unwrap();

    // Attempt withdrawal
    let req = Request::new(CreateWithdrawalRequest {
        wallet_id: wallet_id.clone(),
        amount: helpers::to_atomic_usd(10.0).to_string(),
        address: "addr-frozen".to_string(),
    });

    let result = ctx.withdrawal_api.create_withdrawal(req).await;
    assert!(
        result.is_err(),
        "Withdrawal from frozen wallet should be rejected"
    );
}
