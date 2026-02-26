use crate::domain::wallets::WalletService;
use crate::domain::withdrawals::WithdrawalService as WithdrawalDomainService;
use crate::proto::ledger::withdrawal_service_server::WithdrawalService;
use crate::proto::ledger::*;
use rust_decimal::Decimal;
use std::str::FromStr;
use std::sync::Arc;
use tonic::{Request, Response, Status};

/// Minimum withdrawal amount in atomic units (asset-agnostic).
/// 1 000 = 1 000 satoshis for BTC, or $0.10 for a 2-decimal asset.
const MIN_WITHDRAWAL_AMOUNT: u64 = 1_000;

pub struct WithdrawalServiceImpl {
    withdrawal_service: Arc<WithdrawalDomainService>,
    wallet_service: Arc<WalletService>,
}

impl WithdrawalServiceImpl {
    pub fn new(
        withdrawal_service: Arc<WithdrawalDomainService>,
        wallet_service: Arc<WalletService>,
    ) -> Self {
        Self {
            withdrawal_service,
            wallet_service,
        }
    }
}

#[tonic::async_trait]
impl WithdrawalService for WithdrawalServiceImpl {
    async fn create_withdrawal(
        &self,
        request: Request<CreateWithdrawalRequest>,
    ) -> Result<Response<CreateWithdrawalResponse>, Status> {
        let req = request.into_inner();

        // Validate minimum withdrawal amount
        let amount = Decimal::from_str(&req.amount)
            .map_err(|_| Status::invalid_argument("Invalid withdrawal amount"))?;

        if amount < Decimal::from(MIN_WITHDRAWAL_AMOUNT) {
            return Err(Status::invalid_argument(format!(
                "Withdrawal amount {} is below the minimum of {}",
                amount, MIN_WITHDRAWAL_AMOUNT
            )));
        }

        // Lock funds: move amount from available → locked
        let wallet = self
            .wallet_service
            .get_wallet(&req.wallet_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?
            .ok_or_else(|| Status::not_found("Wallet not found"))?;

        let available = Decimal::from_str(&wallet.available).unwrap_or_default();

        if available < amount {
            return Err(Status::failed_precondition(format!(
                "Insufficient funds: available {}, requested {}",
                available, amount
            )));
        }

        let mut wallet = wallet;
        let locked = Decimal::from_str(&wallet.locked).unwrap_or_default();
        wallet.available = (available - amount).to_string();
        wallet.locked = (locked + amount).to_string();
        wallet.updated_at = chrono::Utc::now().timestamp_millis();

        self.wallet_service
            .update_wallet(wallet)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let withdrawal =
            self.withdrawal_service
                .create_new_withdrawal(req.wallet_id, req.amount, req.address);

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

            self.withdrawal_service
                .update_withdrawal(withdrawal.clone());

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

        // Look up the withdrawal so we can unlock the funds before removing it
        let withdrawal = self
            .withdrawal_service
            .get_withdrawal(&req.withdrawal_id)
            .ok_or_else(|| Status::not_found("Withdrawal not found"))?;

        // Unlock funds: move amount from locked → available
        if let Ok(Some(mut wallet)) = self.wallet_service.get_wallet(&withdrawal.wallet_id).await {
            let amount = Decimal::from_str(&withdrawal.amount).unwrap_or_default();
            let available = Decimal::from_str(&wallet.available).unwrap_or_default();
            let locked = Decimal::from_str(&wallet.locked).unwrap_or_default();
            wallet.available = (available + amount).to_string();
            wallet.locked = (locked - amount).max(Decimal::ZERO).to_string();
            wallet.updated_at = chrono::Utc::now().timestamp_millis();
            let _ = self.wallet_service.update_wallet(wallet).await;
        }

        if self
            .withdrawal_service
            .cancel_withdrawal(&req.withdrawal_id)
        {
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
        Ok(Response::new(ListWithdrawalsResponse { withdrawals }))
    }
}
