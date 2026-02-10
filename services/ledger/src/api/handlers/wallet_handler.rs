use tonic::{Request, Response, Status};
use crate::proto::ledger::*;
use crate::domain::wallets::WalletService;

pub async fn create_wallet(
    wallet_service: &WalletService,
    request: Request<CreateWalletRequest>,
) -> Result<Response<CreateWalletResponse>, Status> {
    let req = request.into_inner();
    
    let wallet = wallet_service.create_new_wallet(
        req.account_id,
        req.asset_id,
    ).await.map_err(|e| Status::internal(e.to_string()))?;

    Ok(Response::new(CreateWalletResponse {
        wallet: Some(wallet),
    }))
}

pub async fn get_wallet(
    wallet_service: &WalletService,
    request: Request<GetWalletRequest>,
) -> Result<Response<GetWalletResponse>, Status> {
    let req = request.into_inner();
    if let Some(wallet) = wallet_service.get_wallet(&req.wallet_id).await.map_err(|e| Status::internal(e.to_string()))? {
            Ok(Response::new(GetWalletResponse {
                wallet: Some(wallet),
            }))
    } else {
            Err(Status::not_found("Wallet not found"))
    }
}

pub async fn update_wallet(
    wallet_service: &WalletService,
    request: Request<UpdateWalletRequest>,
) -> Result<Response<UpdateWalletResponse>, Status> {
    let req = request.into_inner();
    
    if let Some(mut wallet) = wallet_service.get_wallet(&req.wallet_id).await.map_err(|e| Status::internal(e.to_string()))? {
            if !req.status.is_empty() {
                wallet.status = req.status;
            }
            wallet.updated_at = chrono::Utc::now().timestamp_millis();
            
            let updated = wallet_service.update_wallet(wallet.clone()).await.map_err(|e| Status::internal(e.to_string()))?;
            
            Ok(Response::new(UpdateWalletResponse {
                wallet: Some(updated),
            }))
    } else {
            Err(Status::not_found("Wallet not found"))
    }
}

pub async fn delete_wallet(
    wallet_service: &WalletService,
    request: Request<DeleteWalletRequest>,
) -> Result<Response<DeleteWalletResponse>, Status> {
    let req = request.into_inner();
    match wallet_service.delete_wallet(&req.wallet_id).await {
            Ok(_) => Ok(Response::new(DeleteWalletResponse {
                success: true,
                message: "Wallet deleted".to_string(),
            })),
            Err(crate::error::AppError::NotFound(_)) => Err(Status::not_found("Wallet not found")),
            Err(e) => Err(Status::internal(e.to_string())),
    }
}

pub async fn list_wallets(
    wallet_service: &WalletService,
    request: Request<ListWalletsRequest>,
) -> Result<Response<ListWalletsResponse>, Status> {
    let req = request.into_inner();
    let wallets = wallet_service.list_wallets(&req.account_id).await.map_err(|e| Status::internal(e.to_string()))?;
    Ok(Response::new(ListWalletsResponse {
        wallets,
    }))
}
