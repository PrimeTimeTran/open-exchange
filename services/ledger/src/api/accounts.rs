use crate::proto::ledger::*;
use crate::proto::ledger::account_service_server::AccountService;
use crate::domain::accounts::AccountService as AccountDomainService;
use uuid::Uuid;
use std::sync::Arc;
use tonic::{Request, Response, Status};

pub struct AccountServiceImpl {
    account_service: Arc<AccountDomainService>,
}

impl AccountServiceImpl {
    pub fn new(account_service: Arc<AccountDomainService>) -> Self {
        Self { account_service }
    }
}

#[tonic::async_trait]
impl AccountService for AccountServiceImpl {
    async fn create_account(
        &self,
        request: Request<CreateAccountRequest>,
    ) -> Result<Response<CreateAccountResponse>, Status> {
        let req = request.into_inner();
        
        let name = format!("{}_account", req.r#type);
        let account = self.account_service.create_new_account(
            req.user_id,
            name,
            req.r#type,
        ).await.map_err(|e| Status::internal(e.to_string()))?;

        let proto_account = crate::proto::common::Account {
            id: account.id.to_string(),
            tenant_id: account.tenant_id,
            user_id: account.user_id,
            r#type: account.r#type,
            status: account.status,
            meta: account.meta.to_string(),
            created_at: account.created_at.timestamp_millis(),
            updated_at: account.updated_at.timestamp_millis(),
        };

        Ok(Response::new(CreateAccountResponse {
            account: Some(proto_account),
        }))
    }

    async fn get_account(
        &self,
        request: Request<GetAccountRequest>,
    ) -> Result<Response<GetAccountResponse>, Status> {
        let req = request.into_inner();
        let account_id = Uuid::parse_str(&req.account_id)
            .map_err(|_| Status::invalid_argument("Invalid account ID"))?;

        if let Some(account) = self.account_service.get_account(account_id).await.map_err(|e| Status::internal(e.to_string()))? {
                let proto_account = crate::proto::common::Account {
                id: account.id.to_string(),
                tenant_id: account.tenant_id,
                user_id: account.user_id,
                r#type: account.r#type,
                status: account.status,
                meta: account.meta.to_string(),
                created_at: account.created_at.timestamp_millis(),
                updated_at: account.updated_at.timestamp_millis(),
            };

                Ok(Response::new(GetAccountResponse {
                    account: Some(proto_account),
                }))
        } else {
                Err(Status::not_found("Account not found"))
        }
    }

    async fn list_accounts(
        &self,
        request: Request<ListAccountsRequest>,
    ) -> Result<Response<ListAccountsResponse>, Status> {
        let req = request.into_inner();
        let user_id = req.user_id;

        // Use the repository's list_by_user capability (via service)
        // If user_id is empty, this might return all or nothing depending on implementation.
        // Assuming we want to support listing by user_id primarily.
        
        // Note: The service signature for list_accounts takes &str for user_id based on domain/accounts/service.rs
        let accounts = self.account_service.list_accounts(&user_id).await.map_err(|e| Status::internal(e.to_string()))?;
        
        let proto_accounts: Vec<crate::proto::common::Account> = accounts.into_iter()
            .map(|a| crate::proto::common::Account {
                id: a.id.to_string(),
                tenant_id: a.tenant_id,
                user_id: a.user_id,
                r#type: a.r#type,
                status: a.status,
                meta: a.meta.to_string(),
                created_at: a.created_at.timestamp_millis(),
                updated_at: a.updated_at.timestamp_millis(),
            })
            .collect();

        Ok(Response::new(ListAccountsResponse {
            accounts: proto_accounts,
        }))
    }

    async fn update_account(
        &self,
        request: Request<UpdateAccountRequest>,
    ) -> Result<Response<UpdateAccountResponse>, Status> {
            let req = request.into_inner();
            let account_id = Uuid::parse_str(&req.account_id)
            .map_err(|_| Status::invalid_argument("Invalid account ID"))?;
            
            // Fetch existing to update
            if let Some(mut account) = self.account_service.get_account(account_id).await.map_err(|e| Status::internal(e.to_string()))? {
                if !req.status.is_empty() {
                    account.status = req.status;
                }
                if !req.r#type.is_empty() {
                    account.r#type = req.r#type;
                }
                account.updated_at = chrono::Utc::now();
                
                let updated = self.account_service.update_account(account).await
                    .map_err(|e| Status::internal(e.to_string()))?;
                
                let proto_account = crate::proto::common::Account {
                id: updated.id.to_string(),
                tenant_id: updated.tenant_id,
                user_id: updated.user_id,
                r#type: updated.r#type,
                status: updated.status,
                meta: updated.meta.to_string(),
                created_at: updated.created_at.timestamp_millis(),
                updated_at: updated.updated_at.timestamp_millis(),
            };

                Ok(Response::new(UpdateAccountResponse {
                    account: Some(proto_account),
                }))
            } else {
                Err(Status::not_found("Account not found"))
            }
    }

    async fn delete_account(
        &self,
        request: Request<DeleteAccountRequest>,
    ) -> Result<Response<DeleteAccountResponse>, Status> {
            let req = request.into_inner();
            let account_id = Uuid::parse_str(&req.account_id)
            .map_err(|_| Status::invalid_argument("Invalid account ID"))?;

        match self.account_service.delete_account(account_id).await {
                Ok(_) => Ok(Response::new(DeleteAccountResponse {
                    success: true,
                    message: "Account deleted".to_string(),
                })),
                Err(crate::error::AppError::NotFound(_)) => Err(Status::not_found("Account not found")),
                Err(e) => Err(Status::internal(e.to_string())),
        }
    }

    async fn get_system_account(
        &self,
        _request: Request<GetSystemAccountRequest>,
    ) -> Result<Response<GetSystemAccountResponse>, Status> {
        Err(Status::unimplemented("get_system_account not implemented"))
    }
}
