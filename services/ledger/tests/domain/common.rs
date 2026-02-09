use ledger::api::ledger::LedgerImpl;
use ledger::proto::ledger::ledger_service_server::LedgerService;
use ledger::proto::ledger::{
    CreateAccountRequest, CreateWalletRequest, CreateAssetRequest, CreateInstrumentRequest, CreateDepositRequest, 
};
use ledger::proto::common::{Order, OrderSide, OrderStatus, OrderType, TimeInForce};
use tonic::Request;
use uuid::Uuid;

pub struct TestContext {
    pub service: LedgerImpl,
    pub user_id: String,
    pub tenant_id: String,
}

impl TestContext {
    pub fn new() -> Self {
        Self {
            service: LedgerImpl::new_test(),
            user_id: Uuid::new_v4().to_string(),
            tenant_id: Uuid::new_v4().to_string(),
        }
    }
}

pub async fn create_asset(service: &LedgerImpl, symbol: &str, klass: &str, precision: i32) -> String {
    let req = Request::new(CreateAssetRequest {
        symbol: symbol.to_string(),
        klass: klass.to_string(),
        precision,
    });
    service.create_asset(req).await.unwrap().into_inner().asset.unwrap().id
}

pub async fn create_instrument(service: &LedgerImpl, symbol: &str, base_id: &str, quote_id: &str) -> String {
    let req = Request::new(CreateInstrumentRequest {
        symbol: symbol.to_string(),
        r#type: "spot".to_string(),
        base_asset_id: base_id.to_string(),
        quote_asset_id: quote_id.to_string(),
    });
    service.create_instrument(req).await.unwrap().into_inner().instrument.unwrap().id
}

pub async fn create_account(service: &LedgerImpl, user_id: &str, type_: &str) -> String {
    let req = Request::new(CreateAccountRequest {
        user_id: user_id.to_string(),
        r#type: type_.to_string(),
    });
    service.create_account(req).await.unwrap().into_inner().account.unwrap().id
}

pub async fn create_wallet(service: &LedgerImpl, account_id: &str, asset_id: &str) -> String {
    let req = Request::new(CreateWalletRequest {
        account_id: account_id.to_string(),
        asset_id: asset_id.to_string(),
    });
    service.create_wallet(req).await.unwrap().into_inner().wallet.unwrap().id
}

pub async fn deposit_funds(service: &LedgerImpl, wallet_id: &str, amount: &str) {
    let req = Request::new(CreateDepositRequest {
        wallet_id: wallet_id.to_string(),
        amount: amount.to_string(),
        transaction_ref: format!("dep-{}", Uuid::new_v4()),
    });
    service.create_deposit(req).await.unwrap();
}

pub async fn create_order_object(
    ctx: &TestContext, 
    account_id: &str, 
    instrument_id: &str, 
    side: OrderSide, 
    quantity: &str, 
    price: &str
) -> Order {
    Order {
        id: Uuid::new_v4().to_string(),
        tenant_id: ctx.tenant_id.clone(),
        account_id: account_id.to_string(),
        instrument_id: instrument_id.to_string(),
        side: side as i32,
        price: price.to_string(),
        quantity: quantity.to_string(),
        quantity_filled: "0".to_string(),
        status: OrderStatus::Open as i32,
        time_in_force: TimeInForce::Gtc as i32,
        created_at: 0,
        updated_at: 0,
        r#type: OrderType::Limit as i32,
        meta: "{}".to_string(),
    }
}
