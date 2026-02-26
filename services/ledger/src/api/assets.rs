use crate::domain::assets::AssetService as AssetDomainService;
use crate::proto::ledger::asset_service_server::AssetService;
use crate::proto::ledger::*;
use std::sync::Arc;
use tonic::{Request, Response, Status};
use uuid::Uuid;

pub struct AssetServiceImpl {
    asset_service: Arc<AssetDomainService>,
}

impl AssetServiceImpl {
    pub fn new(asset_service: Arc<AssetDomainService>) -> Self {
        Self { asset_service }
    }
}

fn to_proto_asset(asset: crate::domain::assets::model::Asset) -> crate::proto::common::Asset {
    crate::proto::common::Asset {
        id: asset.id.to_string(),
        tenant_id: asset.tenant_id.to_string(),
        symbol: asset.symbol,
        klass: asset.r#type,
        precision: asset.decimals,
        is_fractional: true,
        decimals: asset.decimals,
        meta: asset.meta.to_string(),
        created_at: asset.created_at.timestamp_millis(),
        updated_at: asset.updated_at.timestamp_millis(),
    }
}

fn to_proto_instrument(
    instrument: crate::domain::instruments::model::Instrument,
) -> crate::proto::common::Instrument {
    crate::proto::common::Instrument {
        id: instrument.id.to_string(),
        tenant_id: instrument.tenant_id.to_string(),
        symbol: instrument.symbol,
        r#type: instrument.r#type,
        status: instrument.status,
        underlying_asset_id: instrument.underlying_asset_id.to_string(),
        quote_asset_id: instrument.quote_asset_id.to_string(),
        meta: instrument.meta.to_string(),
        created_at: instrument.created_at.timestamp_millis(),
        updated_at: instrument.updated_at.timestamp_millis(),
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
            let uuid = Uuid::parse_str(&req.asset_id)
                .map_err(|_| Status::invalid_argument("Invalid asset_id"))?;
            self.asset_service
                .get_asset(uuid)
                .await
                .map_err(|e| Status::internal(e.to_string()))?
        } else if !req.symbol.is_empty() {
            self.asset_service
                .get_asset_by_symbol(&req.symbol)
                .await
                .map_err(|e| Status::internal(e.to_string()))?
        } else {
            return Err(Status::invalid_argument("asset_id or symbol required"));
        };

        if let Some(a) = asset {
            Ok(Response::new(GetAssetResponse {
                asset: Some(to_proto_asset(a)),
            }))
        } else {
            Err(Status::not_found("Asset not found"))
        }
    }

    async fn list_assets(
        &self,
        _request: Request<ListAssetsRequest>,
    ) -> Result<Response<ListAssetsResponse>, Status> {
        let assets = self
            .asset_service
            .list_assets()
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let proto_assets = assets.into_iter().map(to_proto_asset).collect();
        Ok(Response::new(ListAssetsResponse {
            assets: proto_assets,
        }))
    }

    async fn create_asset(
        &self,
        request: Request<CreateAssetRequest>,
    ) -> Result<Response<CreateAssetResponse>, Status> {
        let req = request.into_inner();

        let asset = self
            .asset_service
            .create_new_asset(req.symbol, req.klass, req.precision)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(CreateAssetResponse {
            asset: Some(to_proto_asset(asset)),
        }))
    }

    async fn create_instrument(
        &self,
        request: Request<CreateInstrumentRequest>,
    ) -> Result<Response<CreateInstrumentResponse>, Status> {
        let req = request.into_inner();

        let instrument = self
            .asset_service
            .create_new_instrument(
                req.symbol,
                req.r#type,
                req.base_asset_id,
                req.quote_asset_id,
            )
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(CreateInstrumentResponse {
            instrument: Some(to_proto_instrument(instrument)),
        }))
    }
}
