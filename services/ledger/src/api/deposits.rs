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

fn to_proto_deposit(
    deposit: crate::domain::deposits::model::Deposit,
) -> crate::proto::common::Deposit {
    crate::proto::common::Deposit {
        id: deposit.id.to_string(),
        tenant_id: deposit.tenant_id.to_string(),
        account_id: deposit.account_id.to_string(),
        wallet_id: deposit.wallet_id.to_string(),
        asset_id: deposit.asset_id.clone(),
        chain: "ethereum".to_string(),
        amount: deposit.amount.to_string(),
        status: deposit.status,
        tx_hash: deposit.transaction_ref,
        from_address: "".to_string(),
        confirmations: deposit
            .meta
            .get("confirmations")
            .and_then(|v| v.as_i64())
            .unwrap_or(0) as i32,
        required_confirmations: 12,
        detected_at: deposit.created_at.timestamp_millis(),
        confirmed_at: deposit.updated_at.timestamp_millis(),
        credited_at: deposit.updated_at.timestamp_millis(),
        meta: deposit.meta.to_string(),
        created_at: deposit.created_at.timestamp_millis(),
        updated_at: deposit.updated_at.timestamp_millis(),
    }
}

#[tonic::async_trait]
impl DepositService for DepositServiceImpl {
    async fn create_deposit(
        &self,
        request: Request<CreateDepositRequest>,
    ) -> Result<Response<CreateDepositResponse>, Status> {
        let req = request.into_inner();

        let wallet_id = Uuid::parse_str(&req.wallet_id)
            .map_err(|_| Status::invalid_argument("Invalid wallet_id"))?;

        // Idempotency: if a deposit with the same tx_hash already exists for
        // this wallet, return it without crediting the wallet a second time.
        let deposits = self
            .deposit_service
            .list_deposits(wallet_id)
            .map_err(|e| Status::internal(e.to_string()))?;

        if let Some(deposit) = deposits
            .into_iter()
            .find(|d| d.transaction_ref == req.transaction_ref)
        {
            return Ok(Response::new(CreateDepositResponse {
                deposit: Some(to_proto_deposit(deposit)),
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

        let deposit = self
            .deposit_service
            .create_new_deposit(
                req.wallet_id.clone(),
                req.amount.clone(),
                req.transaction_ref,
            )
            .map_err(|e| Status::internal(e.to_string()))?;

        // Update Wallet Balance
        // Note: This logic should ideally be transactional and part of the deposit service or a higher level orchestration
        // But for now we keep it here as it was before, just adding error handling
        if let Ok(Some(mut wallet)) = self.wallet_service.get_wallet(&req.wallet_id).await {
            let current_avail = Decimal::from_str(&wallet.available).unwrap_or_default();
            let deposit_amount = Decimal::from_str(&req.amount).unwrap_or_default();
            let current_total = Decimal::from_str(&wallet.total).unwrap_or_default();

            wallet.available = (current_avail + deposit_amount).to_string();
            wallet.total = (current_total + deposit_amount).to_string();
            wallet.updated_at = chrono::Utc::now().timestamp_millis();

            let _ = self.wallet_service.update_wallet(wallet).await;
        }

        Ok(Response::new(CreateDepositResponse {
            deposit: Some(to_proto_deposit(deposit)),
        }))
    }

    async fn get_deposit(
        &self,
        request: Request<GetDepositRequest>,
    ) -> Result<Response<GetDepositResponse>, Status> {
        let req = request.into_inner();
        let deposit_id = Uuid::parse_str(&req.deposit_id)
            .map_err(|_| Status::invalid_argument("Invalid deposit_id"))?;

        match self.deposit_service.get_deposit(deposit_id) {
            Ok(Some(deposit)) => Ok(Response::new(GetDepositResponse {
                deposit: Some(to_proto_deposit(deposit)),
            })),
            Ok(None) => Err(Status::not_found("Deposit not found")),
            Err(e) => Err(Status::internal(e.to_string())),
        }
    }

    async fn update_deposit(
        &self,
        request: Request<UpdateDepositRequest>,
    ) -> Result<Response<UpdateDepositResponse>, Status> {
        let req = request.into_inner();
        let deposit_id = Uuid::parse_str(&req.deposit_id)
            .map_err(|_| Status::invalid_argument("Invalid deposit_id"))?;

        match self.deposit_service.get_deposit(deposit_id) {
            Ok(Some(mut deposit)) => {
                if !req.status.is_empty() {
                    deposit.status = req.status;
                }

                if let Some(meta) = deposit.meta.as_object_mut() {
                    meta.insert(
                        "confirmations".to_string(),
                        serde_json::json!(req.confirmations),
                    );
                } else {
                    deposit.meta = serde_json::json!({ "confirmations": req.confirmations });
                }

                deposit.updated_at = chrono::Utc::now();

                match self.deposit_service.update_deposit(deposit.clone()) {
                    Ok(true) => Ok(Response::new(UpdateDepositResponse {
                        deposit: Some(to_proto_deposit(deposit)),
                    })),
                    Ok(false) => Err(Status::not_found("Deposit not found during update")),
                    Err(e) => Err(Status::internal(e.to_string())),
                }
            }
            Ok(None) => Err(Status::not_found("Deposit not found")),
            Err(e) => Err(Status::internal(e.to_string())),
        }
    }

    async fn cancel_deposit(
        &self,
        request: Request<CancelDepositRequest>,
    ) -> Result<Response<CancelDepositResponse>, Status> {
        let req = request.into_inner();
        let deposit_id = Uuid::parse_str(&req.deposit_id)
            .map_err(|_| Status::invalid_argument("Invalid deposit_id"))?;

        match self.deposit_service.cancel_deposit(deposit_id) {
            Ok(true) => Ok(Response::new(CancelDepositResponse {
                success: true,
                message: "Deposit cancelled".to_string(),
            })),
            Ok(false) => Err(Status::not_found("Deposit not found")),
            Err(e) => Err(Status::internal(e.to_string())),
        }
    }

    async fn list_deposits(
        &self,
        request: Request<ListDepositsRequest>,
    ) -> Result<Response<ListDepositsResponse>, Status> {
        let req = request.into_inner();
        let wallet_id = Uuid::parse_str(&req.wallet_id)
            .map_err(|_| Status::invalid_argument("Invalid wallet_id"))?;

        let deposits = self
            .deposit_service
            .list_deposits(wallet_id)
            .map_err(|e| Status::internal(e.to_string()))?;

        let proto_deposits = deposits.into_iter().map(to_proto_deposit).collect();
        Ok(Response::new(ListDepositsResponse {
            deposits: proto_deposits,
        }))
    }
}
