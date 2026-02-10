package testutil

import (
	"context"

	"github.com/open-exchange/matching_engine/internal/events"
	ledger "github.com/open-exchange/matching_engine/proto/ledger"
	"github.com/stretchr/testify/mock"
	"google.golang.org/grpc"
)

// MockPublisher is a mock implementation of events.Publisher
type MockPublisher struct {
	mock.Mock
}

func (m *MockPublisher) PublishTrade(ctx context.Context, event events.TradeEvent) error {
	args := m.Called(ctx, event)
	return args.Error(0)
}

func (m *MockPublisher) PublishOrderCancelled(ctx context.Context, event events.OrderCancelledEvent) error {
	args := m.Called(ctx, event)
	return args.Error(0)
}

func (m *MockPublisher) PublishOrderBookEvent(ctx context.Context, event events.OrderBookEvent) error {
	args := m.Called(ctx, event)
	return args.Error(0)
}

// MockLedgerClient is a mock implementation of ledger.LedgerServiceClient
type MockLedgerClient struct {
	mock.Mock
}

// Ensure MockLedgerClient implements the interface
var _ ledger.LedgerServiceClient = (*MockLedgerClient)(nil)

func (m *MockLedgerClient) RecordOrder(ctx context.Context, in *ledger.RecordOrderRequest, opts ...grpc.CallOption) (*ledger.RecordOrderResponse, error) {
	args := m.Called(ctx, in, opts)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*ledger.RecordOrderResponse), args.Error(1)
}

func (m *MockLedgerClient) GetOpenOrders(ctx context.Context, in *ledger.GetOpenOrdersRequest, opts ...grpc.CallOption) (*ledger.GetOpenOrdersResponse, error) {
	args := m.Called(ctx, in, opts)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*ledger.GetOpenOrdersResponse), args.Error(1)
}

func (m *MockLedgerClient) RecordTrade(ctx context.Context, in *ledger.RecordTradeRequest, opts ...grpc.CallOption) (*ledger.RecordTradeResponse, error) {
	args := m.Called(ctx, in, opts)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*ledger.RecordTradeResponse), args.Error(1)
}

func (m *MockLedgerClient) CancelOrder(ctx context.Context, in *ledger.CancelOrderRequest, opts ...grpc.CallOption) (*ledger.CancelOrderResponse, error) {
	args := m.Called(ctx, in, opts)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*ledger.CancelOrderResponse), args.Error(1)
}

// Stubs for unused Ledger methods to satisfy interface
func (m *MockLedgerClient) DeleteOrder(ctx context.Context, in *ledger.DeleteOrderRequest, opts ...grpc.CallOption) (*ledger.DeleteOrderResponse, error) { return nil, nil }
func (m *MockLedgerClient) CreateUser(ctx context.Context, in *ledger.CreateUserRequest, opts ...grpc.CallOption) (*ledger.CreateUserResponse, error) { return nil, nil }
func (m *MockLedgerClient) GetUser(ctx context.Context, in *ledger.GetUserRequest, opts ...grpc.CallOption) (*ledger.GetUserResponse, error) { return nil, nil }
func (m *MockLedgerClient) UpdateUser(ctx context.Context, in *ledger.UpdateUserRequest, opts ...grpc.CallOption) (*ledger.UpdateUserResponse, error) { return nil, nil }
func (m *MockLedgerClient) DeleteUser(ctx context.Context, in *ledger.DeleteUserRequest, opts ...grpc.CallOption) (*ledger.DeleteUserResponse, error) { return nil, nil }
func (m *MockLedgerClient) CreateAccount(ctx context.Context, in *ledger.CreateAccountRequest, opts ...grpc.CallOption) (*ledger.CreateAccountResponse, error) { return nil, nil }
func (m *MockLedgerClient) GetAccount(ctx context.Context, in *ledger.GetAccountRequest, opts ...grpc.CallOption) (*ledger.GetAccountResponse, error) { return nil, nil }
func (m *MockLedgerClient) UpdateAccount(ctx context.Context, in *ledger.UpdateAccountRequest, opts ...grpc.CallOption) (*ledger.UpdateAccountResponse, error) { return nil, nil }
func (m *MockLedgerClient) DeleteAccount(ctx context.Context, in *ledger.DeleteAccountRequest, opts ...grpc.CallOption) (*ledger.DeleteAccountResponse, error) { return nil, nil }
func (m *MockLedgerClient) ListAccounts(ctx context.Context, in *ledger.ListAccountsRequest, opts ...grpc.CallOption) (*ledger.ListAccountsResponse, error) { return nil, nil }
func (m *MockLedgerClient) CreateWallet(ctx context.Context, in *ledger.CreateWalletRequest, opts ...grpc.CallOption) (*ledger.CreateWalletResponse, error) { return nil, nil }
func (m *MockLedgerClient) GetWallet(ctx context.Context, in *ledger.GetWalletRequest, opts ...grpc.CallOption) (*ledger.GetWalletResponse, error) { return nil, nil }
func (m *MockLedgerClient) UpdateWallet(ctx context.Context, in *ledger.UpdateWalletRequest, opts ...grpc.CallOption) (*ledger.UpdateWalletResponse, error) { return nil, nil }
func (m *MockLedgerClient) DeleteWallet(ctx context.Context, in *ledger.DeleteWalletRequest, opts ...grpc.CallOption) (*ledger.DeleteWalletResponse, error) { return nil, nil }
func (m *MockLedgerClient) ListWallets(ctx context.Context, in *ledger.ListWalletsRequest, opts ...grpc.CallOption) (*ledger.ListWalletsResponse, error) { return nil, nil }
func (m *MockLedgerClient) CreateDeposit(ctx context.Context, in *ledger.CreateDepositRequest, opts ...grpc.CallOption) (*ledger.CreateDepositResponse, error) { return nil, nil }
func (m *MockLedgerClient) GetDeposit(ctx context.Context, in *ledger.GetDepositRequest, opts ...grpc.CallOption) (*ledger.GetDepositResponse, error) { return nil, nil }
func (m *MockLedgerClient) UpdateDeposit(ctx context.Context, in *ledger.UpdateDepositRequest, opts ...grpc.CallOption) (*ledger.UpdateDepositResponse, error) { return nil, nil }
func (m *MockLedgerClient) CancelDeposit(ctx context.Context, in *ledger.CancelDepositRequest, opts ...grpc.CallOption) (*ledger.CancelDepositResponse, error) { return nil, nil }
func (m *MockLedgerClient) ListDeposits(ctx context.Context, in *ledger.ListDepositsRequest, opts ...grpc.CallOption) (*ledger.ListDepositsResponse, error) { return nil, nil }
func (m *MockLedgerClient) CreateWithdrawal(ctx context.Context, in *ledger.CreateWithdrawalRequest, opts ...grpc.CallOption) (*ledger.CreateWithdrawalResponse, error) { return nil, nil }
func (m *MockLedgerClient) GetWithdrawal(ctx context.Context, in *ledger.GetWithdrawalRequest, opts ...grpc.CallOption) (*ledger.GetWithdrawalResponse, error) { return nil, nil }
func (m *MockLedgerClient) UpdateWithdrawal(ctx context.Context, in *ledger.UpdateWithdrawalRequest, opts ...grpc.CallOption) (*ledger.UpdateWithdrawalResponse, error) { return nil, nil }
func (m *MockLedgerClient) CancelWithdrawal(ctx context.Context, in *ledger.CancelWithdrawalRequest, opts ...grpc.CallOption) (*ledger.CancelWithdrawalResponse, error) { return nil, nil }
func (m *MockLedgerClient) ListWithdrawals(ctx context.Context, in *ledger.ListWithdrawalsRequest, opts ...grpc.CallOption) (*ledger.ListWithdrawalsResponse, error) { return nil, nil }
func (m *MockLedgerClient) CreateAsset(ctx context.Context, in *ledger.CreateAssetRequest, opts ...grpc.CallOption) (*ledger.CreateAssetResponse, error) { return nil, nil }
func (m *MockLedgerClient) GetAsset(ctx context.Context, in *ledger.GetAssetRequest, opts ...grpc.CallOption) (*ledger.GetAssetResponse, error) { return nil, nil }
func (m *MockLedgerClient) ListAssets(ctx context.Context, in *ledger.ListAssetsRequest, opts ...grpc.CallOption) (*ledger.ListAssetsResponse, error) { return nil, nil }
func (m *MockLedgerClient) CreateInstrument(ctx context.Context, in *ledger.CreateInstrumentRequest, opts ...grpc.CallOption) (*ledger.CreateInstrumentResponse, error) { return nil, nil }
func (m *MockLedgerClient) GetSystemAccount(ctx context.Context, in *ledger.GetSystemAccountRequest, opts ...grpc.CallOption) (*ledger.GetSystemAccountResponse, error) { return nil, nil }
