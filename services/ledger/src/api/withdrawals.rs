use crate::proto::ledger::*;
use crate::proto::ledger::withdrawal_service_server::WithdrawalService;
use crate::domain::withdrawals::WithdrawalService as WithdrawalDomainService;
use std::sync::Arc;
use tonic::{Request, Response, Status};

pub struct WithdrawalServiceImpl {
    withdrawal_service: Arc<WithdrawalDomainService>,
}

impl WithdrawalServiceImpl {
    pub fn new(withdrawal_service: Arc<WithdrawalDomainService>) -> Self {
        Self { withdrawal_service }
    }
}

#[tonic::async_trait]
impl WithdrawalService for WithdrawalServiceImpl {
    async fn create_withdrawal(
        &self,
        request: Request<CreateWithdrawalRequest>,
    ) -> Result<Response<CreateWithdrawalResponse>, Status> {
        let req = request.into_inner();
        
        let withdrawal = self.withdrawal_service.create_new_withdrawal(
            req.wallet_id,
            req.amount,
            req.address,
        );

        Ok(Response::new(CreateWithdrawalResponse {
            withdrawal: Some(withdrawal),
        }))
    }

    async fn get_withdrawal(
        &self,
        request: Request<GetWithdrawalRequest>,
    ) -> Result<Response<GetWithdrawalResponse>, Status> {
        let req = request.into_inner();
        if let Some(withdrawal) = self.withdrawal_service.get_withdrawal(&req.withdrawal_id) {
                Ok(Response::new(GetWithdrawalResponse {
                    withdrawal: Some(withdrawal),
                }))
        } else {
                Err(Status::not_found("Withdrawal not found"))
        }
    }

    async fn update_withdrawal(
        &self,
        request: Request<UpdateWithdrawalRequest>,
    ) -> Result<Response<UpdateWithdrawalResponse>, Status> {
        let req = request.into_inner();
        
        if let Some(mut withdrawal) = self.withdrawal_service.get_withdrawal(&req.withdrawal_id) {
                if !req.status.is_empty() {
                    withdrawal.status = req.status;
                }
                withdrawal.updated_at = chrono::Utc::now().timestamp_millis();
                
                self.withdrawal_service.update_withdrawal(withdrawal.clone());
                
                Ok(Response::new(UpdateWithdrawalResponse {
                    withdrawal: Some(withdrawal),
                }))
        } else {
                Err(Status::not_found("Withdrawal not found"))
        }
    }

    async fn cancel_withdrawal(
        &self,
        request: Request<CancelWithdrawalRequest>,
    ) -> Result<Response<CancelWithdrawalResponse>, Status> {
        let req = request.into_inner();
        if self.withdrawal_service.cancel_withdrawal(&req.withdrawal_id) {
                Ok(Response::new(CancelWithdrawalResponse {
                    success: true,
                    message: "Withdrawal cancelled".to_string(),
                }))
        } else {
                Err(Status::not_found("Withdrawal not found"))
        }
    }

    async fn list_withdrawals(
        &self,
        request: Request<ListWithdrawalsRequest>,
    ) -> Result<Response<ListWithdrawalsResponse>, Status> {
        let req = request.into_inner();
        let withdrawals = self.withdrawal_service.list_withdrawals(&req.wallet_id);
        Ok(Response::new(ListWithdrawalsResponse {
            withdrawals,
        }))
    }
}
