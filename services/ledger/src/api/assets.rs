use crate::proto::ledger::*;
use crate::proto::ledger::asset_service_server::AssetService;
use crate::domain::assets::AssetService as AssetDomainService;
use std::sync::Arc;
use tonic::{Request, Response, Status};

pub struct AssetServiceImpl {
    asset_service: Arc<AssetDomainService>,
}

impl AssetServiceImpl {
    pub fn new(asset_service: Arc<AssetDomainService>) -> Self {
        Self { asset_service }
    }
}

#[tonic::async_trait]
impl AssetService for AssetServiceImpl {
    async fn get_asset(
        &self,
        request: Request<GetAssetRequest>,
    ) -> Result<Response<GetAssetResponse>, Status> {
        let req = request.into_inner();
        
        let asset = if !req.asset_id.is_empty() {
            self.asset_service.get_asset(&req.asset_id).await.map_err(|e| Status::internal(e.to_string()))?
        } else if !req.symbol.is_empty() {
            self.asset_service.get_asset_by_symbol(&req.symbol).await.map_err(|e| Status::internal(e.to_string()))?
        } else {
            return Err(Status::invalid_argument("asset_id or symbol required"));
        };

        if let Some(a) = asset {
            Ok(Response::new(GetAssetResponse {
                asset: Some(a),
            }))
        } else {
            Err(Status::not_found("Asset not found"))
        }
    }

    async fn list_assets(
        &self,
        _request: Request<ListAssetsRequest>,
    ) -> Result<Response<ListAssetsResponse>, Status> {
        let assets = self.asset_service.list_assets().await.map_err(|e| Status::internal(e.to_string()))?;
        Ok(Response::new(ListAssetsResponse {
            assets,
        }))
    }

    async fn create_asset(
        &self,
        request: Request<CreateAssetRequest>,
    ) -> Result<Response<CreateAssetResponse>, Status> {
        let req = request.into_inner();
        
        let asset = self.asset_service.create_new_asset(
            req.symbol,
            req.klass,
            req.precision,
        ).await;

        Ok(Response::new(CreateAssetResponse {
            asset: Some(asset),
        }))
    }

    async fn create_instrument(
        &self,
        request: Request<CreateInstrumentRequest>,
    ) -> Result<Response<CreateInstrumentResponse>, Status> {
        let req = request.into_inner();
        
        let instrument = self.asset_service.create_new_instrument(
            req.symbol,
            req.r#type,
            req.base_asset_id,
            req.quote_asset_id,
        ).await;

        Ok(Response::new(CreateInstrumentResponse {
            instrument: Some(instrument),
        }))
    }
}
