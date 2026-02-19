use crate::proto::ledger::*;
use crate::domain::wallets::WalletService;
use crate::domain::deposits::DepositService;
use std::str::FromStr;
use rust_decimal::Decimal;
use tonic::{Request, Response, Status};

pub async fn create_deposit(
    deposit_service: &DepositService,
    wallet_service: &WalletService,
    request: Request<CreateDepositRequest>,
) -> Result<Response<CreateDepositResponse>, Status> {
    let req = request.into_inner();
    
    let deposit = deposit_service.create_new_deposit(
        req.wallet_id.clone(),
        req.amount.clone(),
        req.transaction_ref,
    );

    // Update Wallet Balance
    if let Some(mut wallet) = wallet_service.get_wallet(&req.wallet_id).await.unwrap_or(None) {
        let current_avail = Decimal::from_str(&wallet.available).unwrap_or_default();
        let deposit_amount = Decimal::from_str(&req.amount).unwrap_or_default();
        let current_total = Decimal::from_str(&wallet.total).unwrap_or_default();
        
        wallet.available = (current_avail + deposit_amount).to_string();
        wallet.total = (current_total + deposit_amount).to_string();
        wallet.updated_at = chrono::Utc::now().timestamp_millis();
        
        let _ = wallet_service.update_wallet(wallet).await;
    }

    Ok(Response::new(CreateDepositResponse {
        deposit: Some(deposit),
    }))
}

pub async fn get_deposit(
    deposit_service: &DepositService,
    request: Request<GetDepositRequest>,
) -> Result<Response<GetDepositResponse>, Status> {
    let req = request.into_inner();
    if let Some(deposit) = deposit_service.get_deposit(&req.deposit_id) {
            Ok(Response::new(GetDepositResponse {
                deposit: Some(deposit),
            }))
    } else {
            Err(Status::not_found("Deposit not found"))
    }
}

pub async fn update_deposit(
    deposit_service: &DepositService,
    request: Request<UpdateDepositRequest>,
) -> Result<Response<UpdateDepositResponse>, Status> {
    let req = request.into_inner();
    
    if let Some(mut deposit) = deposit_service.get_deposit(&req.deposit_id) {
            if !req.status.is_empty() {
                deposit.status = req.status;
            }
            deposit.confirmations = req.confirmations;
            deposit.updated_at = chrono::Utc::now().timestamp_millis();
            
            deposit_service.update_deposit(deposit.clone());
            
            Ok(Response::new(UpdateDepositResponse {
                deposit: Some(deposit),
            }))
    } else {
            Err(Status::not_found("Deposit not found"))
    }
}

pub async fn cancel_deposit(
    deposit_service: &DepositService,
    request: Request<CancelDepositRequest>,
) -> Result<Response<CancelDepositResponse>, Status> {
    let req = request.into_inner();
    if deposit_service.cancel_deposit(&req.deposit_id) {
            Ok(Response::new(CancelDepositResponse {
                success: true,
                message: "Deposit cancelled".to_string(),
            }))
    } else {
            Err(Status::not_found("Deposit not found"))
    }
}

pub async fn list_deposits(
    deposit_service: &DepositService,
    request: Request<ListDepositsRequest>,
) -> Result<Response<ListDepositsResponse>, Status> {
    let req = request.into_inner();
    let deposits = deposit_service.list_deposits(&req.wallet_id);
    Ok(Response::new(ListDepositsResponse {
        deposits,
    }))
}
