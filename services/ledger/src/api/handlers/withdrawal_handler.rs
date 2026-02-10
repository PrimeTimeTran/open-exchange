use tonic::{Request, Response, Status};
use crate::proto::ledger::*;
use crate::domain::withdrawals::WithdrawalService;

pub async fn create_withdrawal(
    withdrawal_service: &WithdrawalService,
    request: Request<CreateWithdrawalRequest>,
) -> Result<Response<CreateWithdrawalResponse>, Status> {
    let req = request.into_inner();
    
    let withdrawal = withdrawal_service.create_new_withdrawal(
        req.wallet_id,
        req.amount,
        req.address,
    );

    Ok(Response::new(CreateWithdrawalResponse {
        withdrawal: Some(withdrawal),
    }))
}

pub async fn get_withdrawal(
    withdrawal_service: &WithdrawalService,
    request: Request<GetWithdrawalRequest>,
) -> Result<Response<GetWithdrawalResponse>, Status> {
    let req = request.into_inner();
    if let Some(withdrawal) = withdrawal_service.get_withdrawal(&req.withdrawal_id) {
            Ok(Response::new(GetWithdrawalResponse {
                withdrawal: Some(withdrawal),
            }))
    } else {
            Err(Status::not_found("Withdrawal not found"))
    }
}

pub async fn update_withdrawal(
    withdrawal_service: &WithdrawalService,
    request: Request<UpdateWithdrawalRequest>,
) -> Result<Response<UpdateWithdrawalResponse>, Status> {
    let req = request.into_inner();
    
    if let Some(mut withdrawal) = withdrawal_service.get_withdrawal(&req.withdrawal_id) {
            if !req.status.is_empty() {
                withdrawal.status = req.status;
            }
            withdrawal.updated_at = chrono::Utc::now().timestamp_millis();
            
            withdrawal_service.update_withdrawal(withdrawal.clone());
            
            Ok(Response::new(UpdateWithdrawalResponse {
                withdrawal: Some(withdrawal),
            }))
    } else {
            Err(Status::not_found("Withdrawal not found"))
    }
}

pub async fn cancel_withdrawal(
    withdrawal_service: &WithdrawalService,
    request: Request<CancelWithdrawalRequest>,
) -> Result<Response<CancelWithdrawalResponse>, Status> {
    let req = request.into_inner();
    if withdrawal_service.cancel_withdrawal(&req.withdrawal_id) {
            Ok(Response::new(CancelWithdrawalResponse {
                success: true,
                message: "Withdrawal cancelled".to_string(),
            }))
    } else {
            Err(Status::not_found("Withdrawal not found"))
    }
}

pub async fn list_withdrawals(
    withdrawal_service: &WithdrawalService,
    request: Request<ListWithdrawalsRequest>,
) -> Result<Response<ListWithdrawalsResponse>, Status> {
    let req = request.into_inner();
    let withdrawals = withdrawal_service.list_withdrawals(&req.wallet_id);
    Ok(Response::new(ListWithdrawalsResponse {
        withdrawals,
    }))
}
