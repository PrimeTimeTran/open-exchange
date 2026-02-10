use tonic::{Request, Response, Status};
use crate::proto::ledger::*;
use crate::domain::assets::AssetService;

pub async fn get_asset(
    asset_service: &AssetService,
    request: Request<GetAssetRequest>,
) -> Result<Response<GetAssetResponse>, Status> {
    let req = request.into_inner();
    
    let asset = if !req.asset_id.is_empty() {
        asset_service.get_asset(&req.asset_id).await.map_err(|e| Status::internal(e.to_string()))?
    } else if !req.symbol.is_empty() {
        asset_service.get_asset_by_symbol(&req.symbol).await.map_err(|e| Status::internal(e.to_string()))?
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

pub async fn list_assets(
    asset_service: &AssetService,
    _request: Request<ListAssetsRequest>,
) -> Result<Response<ListAssetsResponse>, Status> {
    let assets = asset_service.list_assets().await.map_err(|e| Status::internal(e.to_string()))?;
    Ok(Response::new(ListAssetsResponse {
        assets,
    }))
}

pub async fn create_asset(
    asset_service: &AssetService,
    request: Request<CreateAssetRequest>,
) -> Result<Response<CreateAssetResponse>, Status> {
    let req = request.into_inner();
    
    let asset = asset_service.create_new_asset(
        req.symbol,
        req.klass,
        req.precision,
    );

    Ok(Response::new(CreateAssetResponse {
        asset: Some(asset),
    }))
}

pub async fn create_instrument(
    asset_service: &AssetService,
    request: Request<CreateInstrumentRequest>,
) -> Result<Response<CreateInstrumentResponse>, Status> {
    let req = request.into_inner();
    
    let instrument = asset_service.create_new_instrument(
        req.symbol,
        req.r#type,
        req.base_asset_id,
        req.quote_asset_id,
    ).await;

    Ok(Response::new(CreateInstrumentResponse {
        instrument: Some(instrument),
    }))
}
