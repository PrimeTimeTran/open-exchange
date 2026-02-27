use crate::domain::wallets::WalletService;
use crate::domain::withdrawals::WithdrawalService as WithdrawalDomainService;
use crate::error::AppError;
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

fn to_proto_withdrawal(
    w: crate::domain::withdrawals::model::Withdrawal,
) -> crate::proto::common::Withdrawal {
    crate::proto::common::Withdrawal {
        id: w.id.to_string(),
        tenant_id: w.tenant_id.to_string(),
        account_id: w.account_id.to_string(),
        asset_id: w.asset_id,
        wallet_id: w.wallet_id.to_string(),
        amount: w.amount.to_string(),
        fee: w.fee.to_string(),
        status: w.status,
        destination_address: w.destination_address,
        destination_tag: w.destination_tag.unwrap_or_default(),
        tx_hash: w.tx_hash.unwrap_or_default(),
        meta: w.meta.to_string(),
        created_at: w.created_at.timestamp_millis(),
        updated_at: w.updated_at.timestamp_millis(),
        ..Default::default()
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

        let available = wallet.available;

        if available < amount {
            return Err(Status::failed_precondition(format!(
                "Insufficient funds: available {}, requested {}",
                available, amount
            )));
        }

        let mut wallet = wallet;
        let tenant_id = wallet.tenant_id;
        let account_id = wallet.account_id;
        let asset_id = wallet.asset_id.to_string();

        let _locked = wallet.locked;
        wallet.available -= amount;
        wallet.locked += amount;
        wallet.updated_at = chrono::Utc::now();

        self.wallet_service
            .update_wallet(wallet)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let withdrawal = self
            .withdrawal_service
            .create_new_withdrawal(
                tenant_id,
                account_id,
                asset_id,
                req.wallet_id,
                req.amount,
                req.address,
            )
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(CreateWithdrawalResponse {
            withdrawal: Some(to_proto_withdrawal(withdrawal)),
        }))
    }

    async fn get_withdrawal(
        &self,
        request: Request<GetWithdrawalRequest>,
    ) -> Result<Response<GetWithdrawalResponse>, Status> {
        let req = request.into_inner();
        match self
            .withdrawal_service
            .get_withdrawal(&req.withdrawal_id)
            .await
        {
            Ok(withdrawal) => Ok(Response::new(GetWithdrawalResponse {
                withdrawal: Some(to_proto_withdrawal(withdrawal)),
            })),
            Err(AppError::NotFound(_)) => Err(Status::not_found("Withdrawal not found")),
            Err(e) => Err(Status::internal(e.to_string())),
        }
    }

    async fn update_withdrawal(
        &self,
        request: Request<UpdateWithdrawalRequest>,
    ) -> Result<Response<UpdateWithdrawalResponse>, Status> {
        let req = request.into_inner();

        let mut withdrawal = self
            .withdrawal_service
            .get_withdrawal(&req.withdrawal_id)
            .await
            .map_err(|e| match e {
                AppError::NotFound(_) => Status::not_found("Withdrawal not found"),
                _ => Status::internal(e.to_string()),
            })?;

        if !req.status.is_empty() {
            withdrawal.status = req.status;
        }
        withdrawal.updated_at = chrono::Utc::now();

        self.withdrawal_service
            .update_withdrawal(withdrawal.clone())
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(UpdateWithdrawalResponse {
            withdrawal: Some(to_proto_withdrawal(withdrawal)),
        }))
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
            .await
            .map_err(|e| match e {
                AppError::NotFound(_) => Status::not_found("Withdrawal not found"),
                _ => Status::internal(e.to_string()),
            })?;

        // Unlock funds: move amount from locked → available
        if let Ok(Some(mut wallet)) = self
            .wallet_service
            .get_wallet(&withdrawal.wallet_id.to_string())
            .await
        {
            let amount = withdrawal.amount;
            wallet.available += amount;
            wallet.locked = (wallet.locked - amount).max(Decimal::ZERO);
            wallet.updated_at = chrono::Utc::now();
            let _ = self.wallet_service.update_wallet(wallet).await;
        }

        self.withdrawal_service
            .cancel_withdrawal(&req.withdrawal_id)
            .await
            .map_err(|e| match e {
                AppError::NotFound(_) => Status::not_found("Withdrawal not found"),
                _ => Status::internal(e.to_string()),
            })?;

        Ok(Response::new(CancelWithdrawalResponse {
            success: true,
            message: "Withdrawal cancelled".to_string(),
        }))
    }

    async fn list_withdrawals(
        &self,
        request: Request<ListWithdrawalsRequest>,
    ) -> Result<Response<ListWithdrawalsResponse>, Status> {
        let req = request.into_inner();
        let withdrawals = self
            .withdrawal_service
            .list_withdrawals(&req.wallet_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;
        Ok(Response::new(ListWithdrawalsResponse {
            withdrawals: withdrawals.into_iter().map(to_proto_withdrawal).collect(),
        }))
    }
}
