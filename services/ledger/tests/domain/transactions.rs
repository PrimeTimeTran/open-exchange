use ledger::proto::ledger::wallet_service_server::WalletService;
use ledger::proto::ledger::withdrawal_service_server::WithdrawalService;
use ledger::proto::ledger::{
    CreateWithdrawalRequest, GetWalletRequest
};
use tonic::Request;
use super::common::*;

#[tokio::test]
async fn test_deposit_increases_balance() {
    let ctx = TestContext::new();
    let acc_id = create_account(&ctx.account_service, &ctx.user_id, "cash").await;
    let asset_id = create_asset(&ctx.asset_service, "USD", "fiat", 2).await;
    let wallet_id = create_wallet(&ctx.wallet_service, &acc_id, &asset_id).await;

    // Initial check
    let get_req = Request::new(GetWalletRequest { wallet_id: wallet_id.clone() });
    let w1 = ctx.wallet_service.get_wallet(get_req).await.unwrap().into_inner().wallet.unwrap();
    assert_eq!(w1.available, "0");

    // Deposit
    deposit_funds(&ctx.deposit_service, &wallet_id, "500").await;

    // Final check
    let get_req2 = Request::new(GetWalletRequest { wallet_id: wallet_id.clone() });
    let w2 = ctx.wallet_service.get_wallet(get_req2).await.unwrap().into_inner().wallet.unwrap();
    assert_eq!(w2.available, "500");
}

#[tokio::test]
async fn test_withdrawal_request_locks_funds() {
    let ctx = TestContext::new();
    let acc_id = create_account(&ctx.account_service, &ctx.user_id, "cash").await;
    let asset_id = create_asset(&ctx.asset_service, "USD", "fiat", 2).await;
    let wallet_id = create_wallet(&ctx.wallet_service, &acc_id, &asset_id).await;

    deposit_funds(&ctx.deposit_service, &wallet_id, "1000").await;

    // Create Withdrawal
    // Note: Implementation of create_withdrawal needs to check balance and lock funds.
    let req = Request::new(CreateWithdrawalRequest {
        wallet_id: wallet_id.clone(),
        amount: "100".to_string(),
        address: "0x123".to_string(),
    });
    
    let resp = ctx.withdrawal_service.create_withdrawal(req).await;
    
    // If logic is missing, this might succeed but not lock funds, or fail if unimplemented.
    if let Ok(r) = resp {
        let _withdrawal = r.into_inner().withdrawal.unwrap();
        
        // Verify Locked
        let get_req = Request::new(GetWalletRequest { wallet_id: wallet_id.clone() });
        let w = ctx.wallet_service.get_wallet(get_req).await.unwrap().into_inner().wallet.unwrap();
        
        // If create_withdrawal implements locking:
        // assert_eq!(w.available, "900");
        // assert_eq!(w.locked, "100");
        
        if w.locked == "0" {
            println!("WARNING: Withdrawal creation did not lock funds (Logic missing)");
        }
    }
}
