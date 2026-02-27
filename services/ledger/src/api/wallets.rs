use crate::domain::wallets::WalletService as WalletDomainService;
use crate::proto::ledger::wallet_service_server::WalletService;
use crate::proto::ledger::*;
use std::sync::Arc;
use tonic::{Request, Response, Status};

fn to_proto_wallet(wallet: crate::domain::wallets::Wallet) -> crate::proto::common::Wallet {
    crate::proto::common::Wallet {
        id: wallet.id.to_string(),
        tenant_id: wallet.tenant_id.to_string(),
        user_id: wallet.user_id,
        account_id: wallet.account_id.to_string(),
        asset_id: wallet.asset_id.to_string(),
        available: wallet.available.to_string(),
        locked: wallet.locked.to_string(),
        total: wallet.total.to_string(),
        status: wallet.status,
        meta: wallet.meta.to_string(),
        version: wallet.version,
        created_at: wallet.created_at.timestamp_millis(),
        updated_at: wallet.updated_at.timestamp_millis(),
    }
}

pub struct WalletServiceImpl {
    wallet_service: Arc<WalletDomainService>,
}

impl WalletServiceImpl {
    pub fn new(wallet_service: Arc<WalletDomainService>) -> Self {
        Self { wallet_service }
    }

    pub async fn list_wallets_internal(
        &self,
        account_id: &str,
    ) -> Result<Vec<crate::domain::wallets::Wallet>, Status> {
        self.wallet_service
            .list_wallets(account_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))
    }
}

#[tonic::async_trait]
impl WalletService for WalletServiceImpl {
    async fn create_wallet(
        &self,
        request: Request<CreateWalletRequest>,
    ) -> Result<Response<CreateWalletResponse>, Status> {
        let req = request.into_inner();

        let wallet = self
            .wallet_service
            .create_new_wallet(req.account_id, req.asset_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(CreateWalletResponse {
            wallet: Some(to_proto_wallet(wallet)),
        }))
    }

    async fn get_wallet(
        &self,
        request: Request<GetWalletRequest>,
    ) -> Result<Response<GetWalletResponse>, Status> {
        let req = request.into_inner();
        if let Some(wallet) = self
            .wallet_service
            .get_wallet(&req.wallet_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?
        {
            Ok(Response::new(GetWalletResponse {
                wallet: Some(to_proto_wallet(wallet)),
            }))
        } else {
            Err(Status::not_found("Wallet not found"))
        }
    }

    async fn update_wallet(
        &self,
        request: Request<UpdateWalletRequest>,
    ) -> Result<Response<UpdateWalletResponse>, Status> {
        let req = request.into_inner();

        if let Some(mut wallet) = self
            .wallet_service
            .get_wallet(&req.wallet_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?
        {
            if !req.status.is_empty() {
                wallet.status = req.status;
            }
            wallet.updated_at = chrono::Utc::now();

            let updated = self
                .wallet_service
                .update_wallet(wallet.clone())
                .await
                .map_err(|e| Status::internal(e.to_string()))?;

            Ok(Response::new(UpdateWalletResponse {
                wallet: Some(to_proto_wallet(updated)),
            }))
        } else {
            Err(Status::not_found("Wallet not found"))
        }
    }

    async fn delete_wallet(
        &self,
        request: Request<DeleteWalletRequest>,
    ) -> Result<Response<DeleteWalletResponse>, Status> {
        let req = request.into_inner();
        match self.wallet_service.delete_wallet(&req.wallet_id).await {
            Ok(_) => Ok(Response::new(DeleteWalletResponse {
                success: true,
                message: "Wallet deleted".to_string(),
            })),
            Err(crate::error::AppError::NotFound(_)) => Err(Status::not_found("Wallet not found")),
            Err(e) => Err(Status::internal(e.to_string())),
        }
    }

    async fn list_wallets(
        &self,
        request: Request<ListWalletsRequest>,
    ) -> Result<Response<ListWalletsResponse>, Status> {
        let req = request.into_inner();
        let wallets = self
            .wallet_service
            .list_wallets(&req.account_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;
        Ok(Response::new(ListWalletsResponse {
            wallets: wallets.into_iter().map(to_proto_wallet).collect(),
        }))
    }
}
