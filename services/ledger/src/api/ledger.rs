use uuid::Uuid;
use tonic::transport::Channel;
use tonic::{Request, Response, Status};

use crate::proto::ledger::*;
use crate::proto::common::{OrderSide, OrderStatus};
use crate::proto::ledger::ledger_service_server::LedgerService;
use crate::proto::matching::matching_engine_client::MatchingEngineClient;

use crate::domain::users::UserService;
use crate::domain::assets::AssetService;
use crate::domain::wallets::WalletService;
use crate::domain::accounts::AccountService;
use crate::domain::deposits::DepositService;
use crate::domain::orders::{OrderService, Order};
use crate::domain::withdrawals::WithdrawalService;

#[derive(Debug)]
pub struct LedgerImpl {
    order_service: OrderService,
    user_service: UserService,
    account_service: AccountService,
    wallet_service: WalletService,
    deposit_service: DepositService,
    withdrawal_service: WithdrawalService,
    asset_service: AssetService,
    matching_client: Option<MatchingEngineClient<Channel>>,
}

use crate::infra::repositories::{InMemoryAccountRepository, InMemoryOrderRepository};

impl LedgerImpl {
    pub fn new(
        order_service: OrderService,
        account_service: AccountService,
        wallet_service: WalletService,
        asset_service: AssetService,
        matching_client: Option<MatchingEngineClient<Channel>>,
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
        let req = request.into_inner();
        
        if let Some(proto_order) = req.order {
            let order_id = if proto_order.id.is_empty() {
                Uuid::new_v4()
            } else {
                Uuid::parse_str(&proto_order.id).map_err(|_| Status::invalid_argument("Invalid order ID"))?
            };

            let tenant_id = Uuid::parse_str(&proto_order.tenant_id).unwrap_or_default();
            let account_id = Uuid::parse_str(&proto_order.account_id).unwrap_or_default();
            let instrument_id = Uuid::parse_str(&proto_order.instrument_id).unwrap_or_default();

            // Convert Proto Enum (i32) to Domain String
            let side_str = match OrderSide::try_from(proto_order.side).unwrap_or(OrderSide::Unspecified) {
                OrderSide::Buy => "buy",
                OrderSide::Sell => "sell",
                _ => "unspecified",
            }.to_string();

            let status_str = match OrderStatus::try_from(proto_order.status).unwrap_or(OrderStatus::Unspecified) {
                OrderStatus::Open => "open",
                OrderStatus::PartiallyFilled => "partial",
                OrderStatus::Filled => "filled",
                OrderStatus::Cancelled => "cancelled",
                OrderStatus::Rejected => "rejected",
                _ => "unspecified",
            }.to_string();

            let order = Order {
                id: order_id,
                tenant_id,
                account_id,
                instrument_id,
                side: side_str,
                quantity: proto_order.quantity.parse().unwrap_or(0.0),
                price: proto_order.price.parse().unwrap_or(0.0),
                status: status_str,
                filled_quantity: proto_order.quantity_filled.parse().unwrap_or(0.0),
                average_fill_price: 0.0,
                meta: serde_json::from_str(&proto_order.meta).unwrap_or(serde_json::json!({})),
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            };

            let order_for_matching = crate::proto::common::Order {
                id: order.id.to_string(),
                tenant_id: order.tenant_id.to_string(),
                account_id: order.account_id.to_string(),
                instrument_id: order.instrument_id.to_string(),
                side: proto_order.side,
                r#type: proto_order.r#type,
                price: order.price.to_string(),
                quantity: order.quantity.to_string(),
                quantity_filled: order.filled_quantity.to_string(),
                time_in_force: proto_order.time_in_force,
                status: OrderStatus::Open as i32,
                meta: order.meta.to_string(),
                created_at: order.created_at.timestamp_millis(),
                updated_at: order.updated_at.timestamp_millis(),
            };

            // OrderService handles validation and reservation internally now
            match self.order_service.create_order(order).await {
                Ok(_) => {
                    // Call Matching Engine
                    if let Some(client) = &self.matching_client {
                        let mut matching_client = client.clone();
                        let request = tonic::Request::new(crate::proto::matching::PlaceOrderRequest {
                            order: Some(order_for_matching),
                        });

                        tokio::spawn(async move {
                            match matching_client.place_order(request).await {
                                Ok(response) => println!("Successfully forwarded order to matching engine: {:?}", response),
                                Err(e) => eprintln!("Failed to forward order to matching engine: {}", e),
                            }
                        });
                    }
                },
                Err(crate::error::AppError::ValidationError(msg)) => return Err(Status::failed_precondition(msg)),
                Err(e) => return Err(Status::internal(e.to_string())),
            }
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
         let order_id = Uuid::parse_str(&req.order_id).map_err(|_| Status::invalid_argument("Invalid order ID"))?;
         
         match self.order_service.cancel_order(order_id).await {
             Ok(_) => Ok(Response::new(CancelOrderResponse {
                 success: true,
                 message: "Order cancelled".to_string(),
             })),
             Err(crate::error::AppError::NotFound(_)) => Ok(Response::new(CancelOrderResponse {
                 success: false,
                 message: "Order not found".to_string(),
             })),
             Err(e) => Err(Status::internal(e.to_string())),
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
        let orders = self.order_service.list_open_orders().await
            .map_err(|e| Status::internal(e.to_string()))?;
            
        let proto_orders = orders.into_iter().map(|o| {
            let side_enum = match o.side.as_str() {
                "buy" => OrderSide::Buy,
                "sell" => OrderSide::Sell,
                _ => OrderSide::Unspecified,
            };
            
            let status_enum = match o.status.as_str() {
                "open" => OrderStatus::Open,
                "partial" => OrderStatus::PartiallyFilled,
                "filled" => OrderStatus::Filled,
                "cancelled" => OrderStatus::Cancelled,
                "rejected" => OrderStatus::Rejected,
                _ => OrderStatus::Unspecified,
            };

            crate::proto::common::Order {
                id: o.id.to_string(),
                tenant_id: o.tenant_id.to_string(),
                account_id: o.account_id.to_string(),
                instrument_id: o.instrument_id.to_string(),
                side: side_enum as i32,
                quantity: o.quantity.to_string(),
                price: o.price.to_string(),
                status: status_enum as i32,
                quantity_filled: o.filled_quantity.to_string(),
                meta: o.meta.to_string(),
                created_at: o.created_at.timestamp_millis(),
                updated_at: o.updated_at.timestamp_millis(),
                r#type: 0, // Default or map if stored
                time_in_force: 0, // Default or map if stored
            }
        }).collect();

        Ok(Response::new(GetOpenOrdersResponse {
            orders: proto_orders,
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

    // --- Wallet Management ---

    async fn create_wallet(
        &self,
        request: Request<CreateWalletRequest>,
    ) -> Result<Response<CreateWalletResponse>, Status> {
        let req = request.into_inner();
        
        let wallet = self.wallet_service.create_new_wallet(
            req.account_id,
            req.asset_id,
        ).await.map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(CreateWalletResponse {
            wallet: Some(wallet),
        }))
    }

    async fn get_wallet(
        &self,
        request: Request<GetWalletRequest>,
    ) -> Result<Response<GetWalletResponse>, Status> {
        let req = request.into_inner();
        if let Some(wallet) = self.wallet_service.get_wallet(&req.wallet_id).await.map_err(|e| Status::internal(e.to_string()))? {
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
        
        if let Some(mut wallet) = self.wallet_service.get_wallet(&req.wallet_id).await.map_err(|e| Status::internal(e.to_string()))? {
             if !req.status.is_empty() {
                 wallet.status = req.status;
             }
             wallet.updated_at = chrono::Utc::now().timestamp_millis();
             
             let updated = self.wallet_service.update_wallet(wallet.clone()).await.map_err(|e| Status::internal(e.to_string()))?;
             
             Ok(Response::new(UpdateWalletResponse {
                 wallet: Some(updated),
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
        let wallets = self.wallet_service.list_wallets(&req.account_id).await.map_err(|e| Status::internal(e.to_string()))?;
        Ok(Response::new(ListWalletsResponse {
            wallets,
        }))
    }

    // --- Asset Management ---

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

    // --- Deposit Management ---

    async fn create_deposit(
        &self,
        request: Request<CreateDepositRequest>,
    ) -> Result<Response<CreateDepositResponse>, Status> {
        let req = request.into_inner();
        
        let deposit = self.deposit_service.create_new_deposit(
            req.wallet_id.clone(),
            req.amount.clone(),
            req.transaction_ref,
        );

        // Update Wallet Balance
        if let Some(mut wallet) = self.wallet_service.get_wallet(&req.wallet_id).await.unwrap_or(None) {
            let current_avail: f64 = wallet.available.parse().unwrap_or(0.0);
            let deposit_amount: f64 = req.amount.parse().unwrap_or(0.0);
            let current_total: f64 = wallet.total.parse().unwrap_or(0.0);
            
            wallet.available = (current_avail + deposit_amount).to_string();
            wallet.total = (current_total + deposit_amount).to_string();
            wallet.updated_at = chrono::Utc::now().timestamp_millis();
            
            let _ = self.wallet_service.update_wallet(wallet).await;
        }

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
        ).await;

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
