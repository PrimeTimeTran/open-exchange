use crate::domain::accounts::AccountService;
use crate::domain::deposits::DepositService as DepositDomainService;
use crate::domain::wallets::WalletService;
use crate::proto::ledger::deposit_service_server::DepositService;
use crate::proto::ledger::*;
use rust_decimal::Decimal;
use std::str::FromStr;
use std::sync::Arc;
use tonic::{Request, Response, Status};
use uuid::Uuid;

pub struct DepositServiceImpl {
    deposit_service: Arc<DepositDomainService>,
    wallet_service: Arc<WalletService>,
    account_service: Arc<AccountService>,
}

impl DepositServiceImpl {
    pub fn new(
        deposit_service: Arc<DepositDomainService>,
        wallet_service: Arc<WalletService>,
        account_service: Arc<AccountService>,
    ) -> Self {
        Self {
            deposit_service,
            wallet_service,
            account_service,
        }
    }
}

#[tonic::async_trait]
impl DepositService for DepositServiceImpl {
    async fn create_deposit(
        &self,
        request: Request<CreateDepositRequest>,
    ) -> Result<Response<CreateDepositResponse>, Status> {
        let req = request.into_inner();

        // Idempotency: if a deposit with the same tx_hash already exists for
        // this wallet, return it without crediting the wallet a second time.
        let existing = self
            .deposit_service
            .list_deposits(&req.wallet_id)
            .into_iter()
            .find(|d| d.tx_hash == req.transaction_ref);

        if let Some(deposit) = existing {
            return Ok(Response::new(CreateDepositResponse {
                deposit: Some(deposit),
            }));
        }

        // Reject deposits to closed accounts
        if let Ok(Some(wallet)) = self.wallet_service.get_wallet(&req.wallet_id).await {
            if let Ok(account_id) = Uuid::parse_str(&wallet.account_id) {
                if let Ok(Some(account)) = self.account_service.get_account(account_id).await {
                    if account.status == "closed" {
                        return Err(Status::failed_precondition(
                            "Cannot deposit to a closed account",
                        ));
                    }
                }
            }
        }

        let deposit = self.deposit_service.create_new_deposit(
            req.wallet_id.clone(),
            req.amount.clone(),
            req.transaction_ref,
        );

        // Update Wallet Balance
        if let Some(mut wallet) = self
            .wallet_service
            .get_wallet(&req.wallet_id)
            .await
            .unwrap_or(None)
        {
            let current_avail = Decimal::from_str(&wallet.available).unwrap_or_default();
            let deposit_amount = Decimal::from_str(&req.amount).unwrap_or_default();
            let current_total = Decimal::from_str(&wallet.total).unwrap_or_default();

            wallet.available = (current_avail + deposit_amount).to_string();
            wallet.total = (current_total + deposit_amount).to_string();
            wallet.updated_at = chrono::Utc::now().timestamp_millis();

            let _ = self.wallet_service.update_wallet(wallet).await;
        }

        Ok(Response::new(CreateDepositResponse {
            deposit: Some(deposit),
        }))
    }

    async fn get_deposit(
        &self,
        request: Request<GetDepositRequest>,
    ) -> Result<Response<GetDepositResponse>, Status> {
        let req = request.into_inner();
        if let Some(deposit) = self.deposit_service.get_deposit(&req.deposit_id) {
            Ok(Response::new(GetDepositResponse {
                deposit: Some(deposit),
            }))
        } else {
            Err(Status::not_found("Deposit not found"))
        }
    }

    async fn update_deposit(
        &self,
        request: Request<UpdateDepositRequest>,
    ) -> Result<Response<UpdateDepositResponse>, Status> {
        let req = request.into_inner();

        if let Some(mut deposit) = self.deposit_service.get_deposit(&req.deposit_id) {
            if !req.status.is_empty() {
                deposit.status = req.status;
            }
            deposit.confirmations = req.confirmations;
            deposit.updated_at = chrono::Utc::now().timestamp_millis();

            self.deposit_service.update_deposit(deposit.clone());

            Ok(Response::new(UpdateDepositResponse {
                deposit: Some(deposit),
            }))
        } else {
            Err(Status::not_found("Deposit not found"))
        }
    }

    async fn cancel_deposit(
        &self,
        request: Request<CancelDepositRequest>,
    ) -> Result<Response<CancelDepositResponse>, Status> {
        let req = request.into_inner();
        if self.deposit_service.cancel_deposit(&req.deposit_id) {
            Ok(Response::new(CancelDepositResponse {
                success: true,
                message: "Deposit cancelled".to_string(),
            }))
        } else {
            Err(Status::not_found("Deposit not found"))
        }
    }

    async fn list_deposits(
        &self,
        request: Request<ListDepositsRequest>,
    ) -> Result<Response<ListDepositsResponse>, Status> {
        let req = request.into_inner();
        let deposits = self.deposit_service.list_deposits(&req.wallet_id);
        Ok(Response::new(ListDepositsResponse { deposits }))
    }
}
