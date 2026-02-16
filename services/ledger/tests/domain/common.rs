use std::sync::Arc;
use tonic::Request;
use uuid::Uuid;
use rust_decimal::Decimal;
use std::str::FromStr;

pub fn assert_decimal(left: &str, right: &str) {
    let l = Decimal::from_str(left).unwrap_or_else(|_| panic!("Invalid decimal left: {}", left));
    let r = Decimal::from_str(right).unwrap_or_else(|_| panic!("Invalid decimal right: {}", right));
    assert_eq!(l, r, "Decimals not equal: {} != {}", left, right);
}

use ledger::api::{
    orders::OrderServiceImpl,
    accounts::AccountServiceImpl,
    wallets::WalletServiceImpl,
    assets::AssetServiceImpl,
    deposits::DepositServiceImpl,
    withdrawals::WithdrawalServiceImpl,
    users::UserServiceImpl,
};

use ledger::domain::{
    orders::OrderService,
    accounts::AccountService,
    wallets::WalletService,
    assets::AssetService,
    deposits::DepositService,
    withdrawals::WithdrawalService,
    users::UserService,
};

use ledger::infra::repositories::{
    InMemoryAccountRepository, 
    InMemoryOrderRepository,
    InMemoryWalletRepository,
    InMemoryFillRepository,
    memory::InMemoryAssetRepository,
    memory::InMemoryInstrumentRepository
};

use ledger::proto::ledger::{
    CreateAccountRequest, CreateWalletRequest, CreateAssetRequest, CreateInstrumentRequest, CreateDepositRequest, 
};
use ledger::proto::common::{Order, OrderSide, OrderStatus, OrderType, TimeInForce};

// Import Traits for using methods
use ledger::proto::ledger::asset_service_server::AssetService as AssetServiceTrait;
use ledger::proto::ledger::account_service_server::AccountService as AccountServiceTrait;
use ledger::proto::ledger::wallet_service_server::WalletService as WalletServiceTrait;
use ledger::proto::ledger::deposit_service_server::DepositService as DepositServiceTrait;

pub struct TestContext {
    pub order_service: OrderServiceImpl,
    pub account_service: AccountServiceImpl,
    pub wallet_service: WalletServiceImpl,
    pub asset_service: AssetServiceImpl,
    pub deposit_service: DepositServiceImpl,
    pub withdrawal_service: WithdrawalServiceImpl,
    pub user_service: UserServiceImpl,
    pub user_id: String,
    pub tenant_id: String,
}

impl TestContext {
    pub fn new() -> Self {
        let account_repo = Arc::new(InMemoryAccountRepository::new());
        let order_repo = Arc::new(InMemoryOrderRepository::new());
        let wallet_repo = Arc::new(InMemoryWalletRepository::new());
        let asset_repo = Arc::new(InMemoryAssetRepository::new());
        let instrument_repo = Arc::new(InMemoryInstrumentRepository::new());
        let fill_repo = Arc::new(InMemoryFillRepository::new());

        let account_service = Arc::new(AccountService::new(account_repo));
        let wallet_service = Arc::new(WalletService::new(wallet_repo));
        let asset_service = Arc::new(AssetService::new(asset_repo, instrument_repo));
        
        let order_service = Arc::new(OrderService::new(
            order_repo, 
            wallet_service.clone(), 
            asset_service.clone(),
            None,
        ));
        
        let deposit_service = Arc::new(DepositService::new());
        let withdrawal_service = Arc::new(WithdrawalService::new());
        let user_service = Arc::new(UserService::new());

        let order_impl = OrderServiceImpl::new(order_service, asset_service.clone(), fill_repo, None);
        let account_impl = AccountServiceImpl::new(account_service);
        let wallet_impl = WalletServiceImpl::new(wallet_service.clone());
        let asset_impl = AssetServiceImpl::new(asset_service);
        let deposit_impl = DepositServiceImpl::new(deposit_service, wallet_service.clone());
        let withdrawal_impl = WithdrawalServiceImpl::new(withdrawal_service);
        let user_impl = UserServiceImpl::new(user_service);

        Self {
            order_service: order_impl,
            account_service: account_impl,
            wallet_service: wallet_impl,
            asset_service: asset_impl,
            deposit_service: deposit_impl,
            withdrawal_service: withdrawal_impl,
            user_service: user_impl,
            user_id: Uuid::new_v4().to_string(),
            tenant_id: Uuid::new_v4().to_string(),
        }
    }
}

pub async fn create_asset(service: &AssetServiceImpl, symbol: &str, klass: &str, precision: i32) -> String {
    let req = Request::new(CreateAssetRequest {
        symbol: symbol.to_string(),
        klass: klass.to_string(),
        precision,
    });
    service.create_asset(req).await.unwrap().into_inner().asset.unwrap().id
}

pub async fn create_instrument(service: &AssetServiceImpl, symbol: &str, base_id: &str, quote_id: &str) -> String {
    let req = Request::new(CreateInstrumentRequest {
        symbol: symbol.to_string(),
        r#type: "spot".to_string(),
        base_asset_id: base_id.to_string(),
        quote_asset_id: quote_id.to_string(),
    });
    service.create_instrument(req).await.unwrap().into_inner().instrument.unwrap().id
}

pub async fn create_account(service: &AccountServiceImpl, user_id: &str, type_: &str) -> String {
    let req = Request::new(CreateAccountRequest {
        user_id: user_id.to_string(),
        r#type: type_.to_string(),
    });
    service.create_account(req).await.unwrap().into_inner().account.unwrap().id
}

pub async fn create_wallet(service: &WalletServiceImpl, account_id: &str, asset_id: &str) -> String {
    let req = Request::new(CreateWalletRequest {
        account_id: account_id.to_string(),
        asset_id: asset_id.to_string(),
    });
    service.create_wallet(req).await.unwrap().into_inner().wallet.unwrap().id
}

pub async fn deposit_funds(service: &DepositServiceImpl, wallet_id: &str, amount: &str) {
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
