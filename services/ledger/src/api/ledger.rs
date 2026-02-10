use tonic::transport::Channel;
use tonic::{Request, Response, Status};

use crate::proto::ledger::*;
use crate::proto::ledger::ledger_service_server::LedgerService;
use crate::proto::matching::matching_client::MatchingClient;

use crate::domain::users::UserService;
use crate::domain::assets::AssetService;
use crate::domain::wallets::WalletService;
use crate::domain::accounts::AccountService;
use crate::domain::deposits::DepositService;
use crate::domain::orders::OrderService;
use crate::domain::withdrawals::WithdrawalService;

use crate::api::handlers::{
    order_handler,
    user_handler,
    account_handler,
    wallet_handler,
    asset_handler,
    deposit_handler,
    withdrawal_handler
};

#[derive(Debug)]
pub struct LedgerImpl {
    order_service: OrderService,
    user_service: UserService,
    account_service: AccountService,
    wallet_service: WalletService,
    deposit_service: DepositService,
    withdrawal_service: WithdrawalService,
    asset_service: AssetService,
    matching_client: Option<MatchingClient<Channel>>,
}

use crate::infra::repositories::{InMemoryAccountRepository, InMemoryOrderRepository};

impl LedgerImpl {
    pub fn new(
        order_service: OrderService,
        account_service: AccountService,
        wallet_service: WalletService,
        asset_service: AssetService,
        matching_client: Option<MatchingClient<Channel>>,
    ) -> Self {
        Self {
            order_service,
            account_service,
            user_service: UserService::new(),
            wallet_service,
            deposit_service: DepositService::new(),
            withdrawal_service: WithdrawalService::new(),
            asset_service,
            matching_client,
        }
    }

    pub fn new_test() -> Self {
        use std::sync::Arc;
        use crate::infra::repositories::memory::InMemoryAssetRepository;
        use crate::infra::repositories::InMemoryWalletRepository;
        use crate::infra::repositories::memory::InMemoryInstrumentRepository;
        
        let account_repo = Arc::new(InMemoryAccountRepository::new());
        let order_repo = Arc::new(InMemoryOrderRepository::new());
        let wallet_repo = Arc::new(InMemoryWalletRepository::new());
        let asset_repo = Arc::new(InMemoryAssetRepository::new());
        let instrument_repo = Arc::new(InMemoryInstrumentRepository::new());

        let account_service = AccountService::new(account_repo);
        
        let wallet_service = WalletService::new(wallet_repo);
        let asset_service = AssetService::new(asset_repo, instrument_repo);
        
        let order_service = OrderService::new(
            order_repo, 
            Arc::new(wallet_service.clone()), 
            Arc::new(asset_service.clone())
        );

        Self {
            order_service,
            account_service,
            user_service: UserService::new(),
            wallet_service,
            deposit_service: DepositService::new(),
            withdrawal_service: WithdrawalService::new(),
            asset_service,
            matching_client: None,
        }
    }
}

#[tonic::async_trait]
impl LedgerService for LedgerImpl {
    async fn record_order(
        &self,
        request: Request<RecordOrderRequest>,
    ) -> Result<Response<RecordOrderResponse>, Status> {
        order_handler::record_order(
            &self.order_service,
            &self.asset_service,
            &self.matching_client,
            request
        ).await
    }

    async fn cancel_order(
        &self,
        request: Request<CancelOrderRequest>,
    ) -> Result<Response<CancelOrderResponse>, Status> {
        order_handler::cancel_order(&self.order_service, request).await
    }

    async fn delete_order(
        &self,
        _request: Request<DeleteOrderRequest>,
    ) -> Result<Response<DeleteOrderResponse>, Status> {
        Err(Status::unimplemented("delete_order not implemented"))
    }

    async fn get_open_orders(
        &self,
        request: Request<GetOpenOrdersRequest>,
    ) -> Result<Response<GetOpenOrdersResponse>, Status> {
        order_handler::get_open_orders(&self.order_service, request).await
    }

    async fn record_trade(
        &self,
        _request: Request<RecordTradeRequest>,
    ) -> Result<Response<RecordTradeResponse>, Status> {
        Err(Status::unimplemented("record_trade not implemented"))
    }

    // --- User Management ---

    async fn create_user(
        &self,
        request: Request<CreateUserRequest>,
    ) -> Result<Response<CreateUserResponse>, Status> {
        user_handler::create_user(&self.user_service, request).await
    }

    async fn get_user(
        &self,
        request: Request<GetUserRequest>,
    ) -> Result<Response<GetUserResponse>, Status> {
        user_handler::get_user(&self.user_service, request).await
    }

    async fn update_user(
        &self,
        request: Request<UpdateUserRequest>,
    ) -> Result<Response<UpdateUserResponse>, Status> {
        user_handler::update_user(&self.user_service, request).await
    }

    async fn delete_user(
        &self,
        request: Request<DeleteUserRequest>,
    ) -> Result<Response<DeleteUserResponse>, Status> {
        user_handler::delete_user(&self.user_service, request).await
    }

    // --- Account Management ---

    async fn create_account(
        &self,
        request: Request<CreateAccountRequest>,
    ) -> Result<Response<CreateAccountResponse>, Status> {
        account_handler::create_account(&self.account_service, request).await
    }

    async fn get_account(
        &self,
        request: Request<GetAccountRequest>,
    ) -> Result<Response<GetAccountResponse>, Status> {
        account_handler::get_account(&self.account_service, request).await
    }

    async fn list_accounts(
        &self,
        request: Request<ListAccountsRequest>,
    ) -> Result<Response<ListAccountsResponse>, Status> {
        account_handler::list_accounts(&self.account_service, request).await
    }

    async fn update_account(
        &self,
        request: Request<UpdateAccountRequest>,
    ) -> Result<Response<UpdateAccountResponse>, Status> {
        account_handler::update_account(&self.account_service, request).await
    }

    async fn delete_account(
        &self,
        request: Request<DeleteAccountRequest>,
    ) -> Result<Response<DeleteAccountResponse>, Status> {
        account_handler::delete_account(&self.account_service, request).await
    }

    // --- Wallet Management ---

    async fn create_wallet(
        &self,
        request: Request<CreateWalletRequest>,
    ) -> Result<Response<CreateWalletResponse>, Status> {
        wallet_handler::create_wallet(&self.wallet_service, request).await
    }

    async fn get_wallet(
        &self,
        request: Request<GetWalletRequest>,
    ) -> Result<Response<GetWalletResponse>, Status> {
        wallet_handler::get_wallet(&self.wallet_service, request).await
    }

    async fn update_wallet(
        &self,
        request: Request<UpdateWalletRequest>,
    ) -> Result<Response<UpdateWalletResponse>, Status> {
        wallet_handler::update_wallet(&self.wallet_service, request).await
    }

    async fn delete_wallet(
        &self,
        request: Request<DeleteWalletRequest>,
    ) -> Result<Response<DeleteWalletResponse>, Status> {
        wallet_handler::delete_wallet(&self.wallet_service, request).await
    }

    async fn list_wallets(
        &self,
        request: Request<ListWalletsRequest>,
    ) -> Result<Response<ListWalletsResponse>, Status> {
        wallet_handler::list_wallets(&self.wallet_service, request).await
    }

    // --- Asset Management ---

    async fn get_asset(
        &self,
        request: Request<GetAssetRequest>,
    ) -> Result<Response<GetAssetResponse>, Status> {
        asset_handler::get_asset(&self.asset_service, request).await
    }

    async fn list_assets(
        &self,
        request: Request<ListAssetsRequest>,
    ) -> Result<Response<ListAssetsResponse>, Status> {
        asset_handler::list_assets(&self.asset_service, request).await
    }
    
    async fn create_asset(
        &self,
        request: Request<CreateAssetRequest>,
    ) -> Result<Response<CreateAssetResponse>, Status> {
        asset_handler::create_asset(&self.asset_service, request).await
    }

    async fn create_instrument(
        &self,
        request: Request<CreateInstrumentRequest>,
    ) -> Result<Response<CreateInstrumentResponse>, Status> {
        asset_handler::create_instrument(&self.asset_service, request).await
    }

    // --- Deposit Management ---

    async fn create_deposit(
        &self,
        request: Request<CreateDepositRequest>,
    ) -> Result<Response<CreateDepositResponse>, Status> {
        deposit_handler::create_deposit(&self.deposit_service, &self.wallet_service, request).await
    }

    async fn get_deposit(
        &self,
        request: Request<GetDepositRequest>,
    ) -> Result<Response<GetDepositResponse>, Status> {
        deposit_handler::get_deposit(&self.deposit_service, request).await
    }

    async fn update_deposit(
        &self,
        request: Request<UpdateDepositRequest>,
    ) -> Result<Response<UpdateDepositResponse>, Status> {
        deposit_handler::update_deposit(&self.deposit_service, request).await
    }

    async fn cancel_deposit(
        &self,
        request: Request<CancelDepositRequest>,
    ) -> Result<Response<CancelDepositResponse>, Status> {
        deposit_handler::cancel_deposit(&self.deposit_service, request).await
    }

    async fn list_deposits(
        &self,
        request: Request<ListDepositsRequest>,
    ) -> Result<Response<ListDepositsResponse>, Status> {
        deposit_handler::list_deposits(&self.deposit_service, request).await
    }

    // --- Withdrawal Management ---

    async fn create_withdrawal(
        &self,
        request: Request<CreateWithdrawalRequest>,
    ) -> Result<Response<CreateWithdrawalResponse>, Status> {
        withdrawal_handler::create_withdrawal(&self.withdrawal_service, request).await
    }

    async fn get_withdrawal(
        &self,
        request: Request<GetWithdrawalRequest>,
    ) -> Result<Response<GetWithdrawalResponse>, Status> {
        withdrawal_handler::get_withdrawal(&self.withdrawal_service, request).await
    }

    async fn update_withdrawal(
        &self,
        request: Request<UpdateWithdrawalRequest>,
    ) -> Result<Response<UpdateWithdrawalResponse>, Status> {
        withdrawal_handler::update_withdrawal(&self.withdrawal_service, request).await
    }

    async fn cancel_withdrawal(
        &self,
        request: Request<CancelWithdrawalRequest>,
    ) -> Result<Response<CancelWithdrawalResponse>, Status> {
        withdrawal_handler::cancel_withdrawal(&self.withdrawal_service, request).await
    }

    async fn list_withdrawals(
        &self,
        request: Request<ListWithdrawalsRequest>,
    ) -> Result<Response<ListWithdrawalsResponse>, Status> {
        withdrawal_handler::list_withdrawals(&self.withdrawal_service, request).await
    }
    
    async fn get_system_account(
        &self,
        _request: Request<GetSystemAccountRequest>,
    ) -> Result<Response<GetSystemAccountResponse>, Status> {
        Err(Status::unimplemented("get_system_account not implemented"))
    }
}
