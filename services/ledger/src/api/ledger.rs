use tonic::{Request, Response, Status};
use crate::proto::ledger::ledger_service_server::LedgerService;
use crate::proto::ledger::*;
use crate::proto::common;
use crate::domain::orders::OrderService;
use crate::domain::users::UserService;
use crate::domain::accounts::AccountService;
use crate::domain::wallets::WalletService;
use crate::domain::deposits::DepositService;
use crate::domain::withdrawals::WithdrawalService;
use crate::domain::assets::AssetService;
use sqlx::PgPool;

#[derive(Debug, Default)]
pub struct LedgerImpl {
    #[allow(dead_code)]
    db_pool: Option<PgPool>, // Optional for now to keep Default deriving working until full refactor
    order_service: OrderService,
    user_service: UserService,
    account_service: AccountService,
    wallet_service: WalletService,
    deposit_service: DepositService,
    withdrawal_service: WithdrawalService,
    asset_service: AssetService,
}

impl LedgerImpl {
    pub fn new(db_pool: PgPool) -> Self {
        Self {
            db_pool: Some(db_pool),
            order_service: OrderService::new(),
            user_service: UserService::new(),
            account_service: AccountService::new(),
            wallet_service: WalletService::new(),
            deposit_service: DepositService::new(),
            withdrawal_service: WithdrawalService::new(),
            asset_service: AssetService::new(),
        }
    }

    pub fn new_test() -> Self {
        Self {
            db_pool: None,
            order_service: OrderService::new(),
            user_service: UserService::new(),
            account_service: AccountService::new(),
            wallet_service: WalletService::new(),
            deposit_service: DepositService::new(),
            withdrawal_service: WithdrawalService::new(),
            asset_service: AssetService::new(),
        }
    }
}

#[tonic::async_trait]
impl LedgerService for LedgerImpl {
    async fn record_order(
        &self,
        request: Request<RecordOrderRequest>,
    ) -> Result<Response<RecordOrderResponse>, Status> {
        let req = request.into_inner();
        println!("Ledger: Recording order: {:?}", req.order);

        if let Some(order) = req.order {
             self.order_service.record_order(order);
        }

        Ok(Response::new(RecordOrderResponse {
            transaction_id: "tx-12345".to_string(),
            success: true,
            message: "Order recorded in ledger".to_string(),
        }))
    }

    async fn cancel_order(
        &self,
        request: Request<CancelOrderRequest>,
    ) -> Result<Response<CancelOrderResponse>, Status> {
         let req = request.into_inner();
         
         if self.order_service.cancel_order(&req.order_id) {
             Ok(Response::new(CancelOrderResponse {
                 success: true,
                 message: "Order cancelled".to_string(),
             }))
         } else {
             Ok(Response::new(CancelOrderResponse {
                 success: false,
                 message: "Order not found".to_string(),
             }))
         }
    }

    async fn delete_order(
        &self,
        _request: Request<DeleteOrderRequest>,
    ) -> Result<Response<DeleteOrderResponse>, Status> {
        Err(Status::unimplemented("delete_order not implemented"))
    }

    async fn get_open_orders(
        &self,
        _request: Request<GetOpenOrdersRequest>,
    ) -> Result<Response<GetOpenOrdersResponse>, Status> {
        let orders = self.order_service.get_open_orders();
        Ok(Response::new(GetOpenOrdersResponse {
            orders,
        }))
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
        let req = request.into_inner();
        
        let user = self.user_service.create_new_user(
            req.email,
            req.password,
            req.first_name,
            req.last_name,
        );

        Ok(Response::new(CreateUserResponse {
            user: Some(user),
        }))
    }

    async fn get_user(
        &self,
        request: Request<GetUserRequest>,
    ) -> Result<Response<GetUserResponse>, Status> {
        let req = request.into_inner();
        if let Some(user) = self.user_service.get_user(&req.user_id) {
             Ok(Response::new(GetUserResponse {
                 user: Some(user),
             }))
        } else {
             Err(Status::not_found("User not found"))
        }
    }

    async fn update_user(
        &self,
        request: Request<UpdateUserRequest>,
    ) -> Result<Response<UpdateUserResponse>, Status> {
        let req = request.into_inner();
        if let Some(user) = req.user {
             if self.user_service.update_user(user.clone()) {
                 Ok(Response::new(UpdateUserResponse {
                     user: Some(user),
                 }))
             } else {
                 Err(Status::not_found("User not found"))
             }
        } else {
             Err(Status::invalid_argument("User is required"))
        }
    }

    async fn delete_user(
        &self,
        request: Request<DeleteUserRequest>,
    ) -> Result<Response<DeleteUserResponse>, Status> {
        let req = request.into_inner();
        if self.user_service.delete_user(&req.user_id) {
             Ok(Response::new(DeleteUserResponse {
                 success: true,
                 message: "User deleted".to_string(),
             }))
        } else {
             Err(Status::not_found("User not found"))
        }
    }

    // --- Account Management ---

    async fn create_account(
        &self,
        request: Request<CreateAccountRequest>,
    ) -> Result<Response<CreateAccountResponse>, Status> {
        let req = request.into_inner();
        
        let account = self.account_service.create_new_account(
            req.user_id,
            req.r#type,
        );

        Ok(Response::new(CreateAccountResponse {
            account: Some(account),
        }))
    }

    async fn get_account(
        &self,
        request: Request<GetAccountRequest>,
    ) -> Result<Response<GetAccountResponse>, Status> {
        let req = request.into_inner();
        if let Some(account) = self.account_service.get_account(&req.account_id) {
             Ok(Response::new(GetAccountResponse {
                 account: Some(account),
             }))
        } else {
             Err(Status::not_found("Account not found"))
        }
    }

    async fn update_account(
        &self,
        request: Request<UpdateAccountRequest>,
    ) -> Result<Response<UpdateAccountResponse>, Status> {
         let req = request.into_inner();
         
         // Fetch existing to update
         if let Some(mut account) = self.account_service.get_account(&req.account_id) {
             if !req.status.is_empty() {
                 account.status = req.status;
             }
             if !req.r#type.is_empty() {
                 account.r#type = req.r#type;
             }
             account.updated_at = chrono::Utc::now().timestamp_millis();
             
             self.account_service.update_account(account.clone());
             
             Ok(Response::new(UpdateAccountResponse {
                 account: Some(account),
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
        if self.account_service.delete_account(&req.account_id) {
             Ok(Response::new(DeleteAccountResponse {
                 success: true,
                 message: "Account deleted".to_string(),
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
        let accounts = self.account_service.list_accounts(""); // Listing all for now or empty filter
        Ok(Response::new(ListAccountsResponse {
            accounts,
        }))
    }

    // --- Wallet Management ---

    async fn create_wallet(
        &self,
        request: Request<CreateWalletRequest>,
    ) -> Result<Response<CreateWalletResponse>, Status> {
        let req = request.into_inner();
        
        let wallet = self.wallet_service.create_new_wallet(
            req.account_id,
            req.asset_id,
        );

        Ok(Response::new(CreateWalletResponse {
            wallet: Some(wallet),
        }))
    }

    async fn get_wallet(
        &self,
        request: Request<GetWalletRequest>,
    ) -> Result<Response<GetWalletResponse>, Status> {
        let req = request.into_inner();
        if let Some(wallet) = self.wallet_service.get_wallet(&req.wallet_id) {
             Ok(Response::new(GetWalletResponse {
                 wallet: Some(wallet),
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
        
        if let Some(mut wallet) = self.wallet_service.get_wallet(&req.wallet_id) {
             if !req.status.is_empty() {
                 wallet.status = req.status;
             }
             wallet.updated_at = chrono::Utc::now().timestamp_millis();
             
             self.wallet_service.update_wallet(wallet.clone());
             
             Ok(Response::new(UpdateWalletResponse {
                 wallet: Some(wallet),
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
        if self.wallet_service.delete_wallet(&req.wallet_id) {
             Ok(Response::new(DeleteWalletResponse {
                 success: true,
                 message: "Wallet deleted".to_string(),
             }))
        } else {
             Err(Status::not_found("Wallet not found"))
        }
    }

    async fn list_wallets(
        &self,
        request: Request<ListWalletsRequest>,
    ) -> Result<Response<ListWalletsResponse>, Status> {
        let req = request.into_inner();
        let wallets = self.wallet_service.list_wallets(&req.account_id);
        Ok(Response::new(ListWalletsResponse {
            wallets,
        }))
    }

    // --- Deposit Management ---

    async fn create_deposit(
        &self,
        request: Request<CreateDepositRequest>,
    ) -> Result<Response<CreateDepositResponse>, Status> {
        let req = request.into_inner();
        
        let deposit = self.deposit_service.create_new_deposit(
            req.wallet_id,
            req.amount,
            req.transaction_ref,
        );

        Ok(Response::new(CreateDepositResponse {
            deposit: Some(deposit),
        }))
    }

    async fn get_deposit(
        &self,
        request: Request<GetDepositRequest>,
    ) -> Result<Response<GetDepositResponse>, Status> {
        let req = request.into_inner();
        if let Some(deposit) = self.deposit_service.get_deposit(&req.deposit_id) {
             Ok(Response::new(GetDepositResponse {
                 deposit: Some(deposit),
             }))
        } else {
             Err(Status::not_found("Deposit not found"))
        }
    }

    async fn update_deposit(
        &self,
        request: Request<UpdateDepositRequest>,
    ) -> Result<Response<UpdateDepositResponse>, Status> {
        let req = request.into_inner();
        
        if let Some(mut deposit) = self.deposit_service.get_deposit(&req.deposit_id) {
             if !req.status.is_empty() {
                 deposit.status = req.status;
             }
             deposit.confirmations = req.confirmations;
             deposit.updated_at = chrono::Utc::now().timestamp_millis();
             
             self.deposit_service.update_deposit(deposit.clone());
             
             Ok(Response::new(UpdateDepositResponse {
                 deposit: Some(deposit),
             }))
        } else {
             Err(Status::not_found("Deposit not found"))
        }
    }

    async fn cancel_deposit(
        &self,
        request: Request<CancelDepositRequest>,
    ) -> Result<Response<CancelDepositResponse>, Status> {
        let req = request.into_inner();
        if self.deposit_service.cancel_deposit(&req.deposit_id) {
             Ok(Response::new(CancelDepositResponse {
                 success: true,
                 message: "Deposit cancelled".to_string(),
             }))
        } else {
             Err(Status::not_found("Deposit not found"))
        }
    }

    async fn list_deposits(
        &self,
        request: Request<ListDepositsRequest>,
    ) -> Result<Response<ListDepositsResponse>, Status> {
        let req = request.into_inner();
        let deposits = self.deposit_service.list_deposits(&req.wallet_id);
        Ok(Response::new(ListDepositsResponse {
            deposits,
        }))
    }

    // --- Withdrawal Management ---

    async fn create_withdrawal(
        &self,
        request: Request<CreateWithdrawalRequest>,
    ) -> Result<Response<CreateWithdrawalResponse>, Status> {
        let req = request.into_inner();
        
        let withdrawal = self.withdrawal_service.create_new_withdrawal(
            req.wallet_id,
            req.amount,
            req.address,
        );

        Ok(Response::new(CreateWithdrawalResponse {
            withdrawal: Some(withdrawal),
        }))
    }

    async fn get_withdrawal(
        &self,
        request: Request<GetWithdrawalRequest>,
    ) -> Result<Response<GetWithdrawalResponse>, Status> {
        let req = request.into_inner();
        if let Some(withdrawal) = self.withdrawal_service.get_withdrawal(&req.withdrawal_id) {
             Ok(Response::new(GetWithdrawalResponse {
                 withdrawal: Some(withdrawal),
             }))
        } else {
             Err(Status::not_found("Withdrawal not found"))
        }
    }

    async fn update_withdrawal(
        &self,
        request: Request<UpdateWithdrawalRequest>,
    ) -> Result<Response<UpdateWithdrawalResponse>, Status> {
        let req = request.into_inner();
        
        if let Some(mut withdrawal) = self.withdrawal_service.get_withdrawal(&req.withdrawal_id) {
             if !req.status.is_empty() {
                 withdrawal.status = req.status;
             }
             withdrawal.updated_at = chrono::Utc::now().timestamp_millis();
             
             self.withdrawal_service.update_withdrawal(withdrawal.clone());
             
             Ok(Response::new(UpdateWithdrawalResponse {
                 withdrawal: Some(withdrawal),
             }))
        } else {
             Err(Status::not_found("Withdrawal not found"))
        }
    }

    async fn cancel_withdrawal(
        &self,
        request: Request<CancelWithdrawalRequest>,
    ) -> Result<Response<CancelWithdrawalResponse>, Status> {
        let req = request.into_inner();
        if self.withdrawal_service.cancel_withdrawal(&req.withdrawal_id) {
             Ok(Response::new(CancelWithdrawalResponse {
                 success: true,
                 message: "Withdrawal cancelled".to_string(),
             }))
        } else {
             Err(Status::not_found("Withdrawal not found"))
        }
    }

    async fn list_withdrawals(
        &self,
        request: Request<ListWithdrawalsRequest>,
    ) -> Result<Response<ListWithdrawalsResponse>, Status> {
        let req = request.into_inner();
        let withdrawals = self.withdrawal_service.list_withdrawals(&req.wallet_id);
        Ok(Response::new(ListWithdrawalsResponse {
            withdrawals,
        }))
    }

    // --- Asset Management ---

    async fn create_asset(
        &self,
        request: Request<CreateAssetRequest>,
    ) -> Result<Response<CreateAssetResponse>, Status> {
        let req = request.into_inner();
        
        let asset = self.asset_service.create_new_asset(
            req.symbol,
            req.klass,
            req.precision,
        );

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
        );

        Ok(Response::new(CreateInstrumentResponse {
            instrument: Some(instrument),
        }))
    }

    async fn get_system_account(
        &self,
        _request: Request<GetSystemAccountRequest>,
    ) -> Result<Response<GetSystemAccountResponse>, Status> {
        Err(Status::unimplemented("get_system_account not implemented"))
    }
}
