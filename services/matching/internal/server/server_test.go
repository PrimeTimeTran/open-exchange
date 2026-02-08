package server

import (
	"context"
	"net"
	"testing"

	"github.com/open-exchange/matching_engine/internal/engine"
	"github.com/open-exchange/matching_engine/internal/events"
	"github.com/open-exchange/matching_engine/internal/service"
	common "github.com/open-exchange/matching_engine/proto/common"
	ledger "github.com/open-exchange/matching_engine/proto/ledger"
	pb "github.com/open-exchange/matching_engine/proto/matching"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/test/bufconn"
)

// server_test.go contains integration tests for the gRPC server layer.
// It uses an in-memory network listener (bufconn) to simulate a full gRPC client-server connection
// without opening actual TCP ports. This ensures that the gRPC handlers, serialization, and
// dependency injection wiring are working correctly.

const bufSize = 1024 * 1024

// setupTestServer spins up an in-memory gRPC server with the MatchingEngine service registered.
// It returns the client to talk to this server, the mock dependencies to set expectations, and a cleanup function.
func setupTestServer(t *testing.T) (pb.MatchingEngineClient, *MockLedgerClient, *MockPublisher, func()) {
	// 1. Create In-Memory Listener
	lis := bufconn.Listen(bufSize)

	// 2. Initialize Dependencies (Mocks & Engine)
	eng := engine.NewEngine()
	mockLedger := new(MockLedgerClient)
	mockPublisher := new(MockPublisher)

	// 3. Create Service & Server
	svc := service.NewMatchingService(eng, mockLedger, mockPublisher)
	serverImpl := NewMatchingServer(svc)

	// 4. Create and Start gRPC Server
	s := grpc.NewServer()
	pb.RegisterMatchingEngineServer(s, serverImpl)

	go func() {
		if err := s.Serve(lis); err != nil {
			// Server might be closed during cleanup, ignore error
		}
	}()

	// 5. Create gRPC Client connected to in-memory listener
	dialer := func(context.Context, string) (net.Conn, error) {
		return lis.Dial()
	}

	conn, err := grpc.NewClient("passthrough://bufnet", grpc.WithContextDialer(dialer), grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		t.Fatalf("Failed to dial bufnet: %v", err)
	}

	client := pb.NewMatchingEngineClient(conn)

	// Cleanup closure
	cleanup := func() {
		conn.Close()
		s.Stop()
		lis.Close()
	}

	return client, mockLedger, mockPublisher, cleanup
}

func TestMatchingServer_PlaceOrder_Success(t *testing.T) {
	// Verifies that PlaceOrder gRPC call is correctly routed to the service, dependencies are called, and response is returned.
	client, mockLedger, mockPublisher, cleanup := setupTestServer(t)
	defer cleanup()

	ctx := context.Background()

	// Expectations
	mockLedger.On("RecordOrder", mock.Anything, mock.Anything).Return(&ledger.RecordOrderResponse{Success: true}, nil)
	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.Anything).Return(nil)

	// Request
	req := &pb.PlaceOrderRequest{
		Order: &common.Order{
			Id:           "order_123",
			Side:         common.OrderSide_ORDER_SIDE_BUY,
			Type:         common.OrderType_ORDER_TYPE_LIMIT,
			Price:        "50000",
			Quantity:     "1.0",
			InstrumentId: "BTC-USD",
		},
	}

	// Execute
	resp, err := client.PlaceOrder(ctx, req)

	// Assertions
	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.True(t, resp.Success)
	assert.Equal(t, "order_123", resp.OrderId)

	mockLedger.AssertExpectations(t)
	mockPublisher.AssertExpectations(t)
}

func TestMatchingServer_CancelOrder_Success(t *testing.T) {
	// Verifies that CancelOrder gRPC call is correctly processed.
	client, mockLedger, mockPublisher, cleanup := setupTestServer(t)
	defer cleanup()

	ctx := context.Background()

	// Setup: Place order first so it can be cancelled
	// Note: We bypass gRPC for setup to focus test on CancelOrder, or we can just mock the Service internals if we could.
	// Since we rely on the real engine state, we must actually place the order first.
	
	// Expectations for Placement
	mockLedger.On("RecordOrder", mock.Anything, mock.Anything).Return(&ledger.RecordOrderResponse{Success: true}, nil)
	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.Anything).Return(nil)

	_, err := client.PlaceOrder(ctx, &pb.PlaceOrderRequest{
		Order: &common.Order{
			Id:           "order_to_cancel",
			Side:         common.OrderSide_ORDER_SIDE_BUY,
			Type:         common.OrderType_ORDER_TYPE_LIMIT,
			Price:        "50000",
			Quantity:     "1.0",
			InstrumentId: "BTC-USD",
		},
	})
	assert.NoError(t, err)

	// Expectations for Cancellation
	mockLedger.On("CancelOrder", mock.Anything, mock.MatchedBy(func(req *ledger.CancelOrderRequest) bool {
		return req.OrderId == "order_to_cancel"
	})).Return(&ledger.CancelOrderResponse{Success: true}, nil)
	
	mockPublisher.On("PublishOrderCancelled", mock.Anything, mock.Anything).Return(nil)

	// Execute Cancel
	req := &pb.CancelOrderRequest{
		OrderId:      "order_to_cancel",
		InstrumentId: "BTC-USD",
	}
	resp, err := client.CancelOrder(ctx, req)

	// Assertions
	assert.NoError(t, err)
	assert.True(t, resp.Success)

	mockLedger.AssertExpectations(t)
	mockPublisher.AssertExpectations(t)
}

func TestMatchingServer_PlaceOrder_InvalidInput(t *testing.T) {
	// Verifies that PlaceOrder returns failure when input validation fails (e.g., missing InstrumentID).
	client, mockLedger, _, cleanup := setupTestServer(t)
	defer cleanup()

	ctx := context.Background()

	// Current implementation calls Ledger BEFORE validation.
	// So we must expect this call.
	mockLedger.On("RecordOrder", mock.Anything, mock.Anything).Return(&ledger.RecordOrderResponse{Success: true}, nil)

	// Request with missing InstrumentID
	req := &pb.PlaceOrderRequest{
		Order: &common.Order{
			Id:       "bad_order",
			Side:     common.OrderSide_ORDER_SIDE_BUY,
			Type:     common.OrderType_ORDER_TYPE_LIMIT,
			Price:    "50000",
			Quantity: "1.0",
			// InstrumentId intentionally omitted
		},
	}

	resp, err := client.PlaceOrder(ctx, req)

	// Assertions
	assert.NoError(t, err) // gRPC call itself succeeds
	assert.False(t, resp.Success)
	assert.NotEmpty(t, resp.ErrorMessage)
	assert.Contains(t, resp.ErrorMessage, "instrument ID is required")
	
	mockLedger.AssertExpectations(t)
}

func TestMatchingServer_CancelOrder_NotFound(t *testing.T) {
	// Verifies that CancelOrder returns failure when the order does not exist in the engine.
	client, mockLedger, _, cleanup := setupTestServer(t)
	defer cleanup()

	ctx := context.Background()

	// Update: The service now calls Ledger FIRST.
	// We expect the Ledger to be called. We can mock it to succeed, so we hit the Engine error.
	mockLedger.On("CancelOrder", mock.Anything, mock.MatchedBy(func(req *ledger.CancelOrderRequest) bool {
		return req.OrderId == "ghost_order"
	})).Return(&ledger.CancelOrderResponse{Success: true}, nil)

	req := &pb.CancelOrderRequest{
		OrderId:      "ghost_order",
		InstrumentId: "BTC-USD",
	}
	resp, err := client.CancelOrder(ctx, req)

	// Assertions
	assert.NoError(t, err)
	assert.False(t, resp.Success)
	// It should fail because the engine returns "order not found"
	assert.Contains(t, resp.ErrorMessage, "failed to cancel order")
	
	mockLedger.AssertExpectations(t)
}

func TestMatchingServer_PlaceOrder_LedgerFailure(t *testing.T) {
	// Verifies that if Ledger service fails to record the order, the request fails.
	client, mockLedger, _, cleanup := setupTestServer(t)
	defer cleanup()

	ctx := context.Background()

	// Expectations: Ledger returns actual ERROR (simulating connection fail or 500)
	// Returning RecordOrderResponse{Success: false} is technically a successful gRPC call with a business logic failure.
	// The service currently checks `if err != nil`.
	mockLedger.On("RecordOrder", mock.Anything, mock.Anything).Return((*ledger.RecordOrderResponse)(nil), assert.AnError)

	req := &pb.PlaceOrderRequest{
		Order: &common.Order{
			Id:           "order_fail",
			Side:         common.OrderSide_ORDER_SIDE_BUY,
			Type:         common.OrderType_ORDER_TYPE_LIMIT,
			Price:        "50000",
			Quantity:     "1.0",
			InstrumentId: "BTC-USD",
		},
	}

	resp, err := client.PlaceOrder(ctx, req)

	// Assertions
	assert.NoError(t, err) // The gRPC call to MatchingServer succeeds, but returns logic error
	assert.False(t, resp.Success)
	assert.Contains(t, resp.ErrorMessage, "failed to record order")
	
	mockLedger.AssertExpectations(t)
}

// --- Mocks Definitions ---

type MockLedgerClient struct {
	mock.Mock
}

// Ensure MockLedgerClient implements the interface
var _ ledger.LedgerServiceClient = (*MockLedgerClient)(nil)

func (m *MockLedgerClient) RecordOrder(ctx context.Context, in *ledger.RecordOrderRequest, opts ...grpc.CallOption) (*ledger.RecordOrderResponse, error) {
	args := m.Called(ctx, in)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*ledger.RecordOrderResponse), args.Error(1)
}

func (m *MockLedgerClient) CancelOrder(ctx context.Context, in *ledger.CancelOrderRequest, opts ...grpc.CallOption) (*ledger.CancelOrderResponse, error) {
	args := m.Called(ctx, in)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*ledger.CancelOrderResponse), args.Error(1)
}

func (m *MockLedgerClient) RecordTrade(ctx context.Context, in *ledger.RecordTradeRequest, opts ...grpc.CallOption) (*ledger.RecordTradeResponse, error) {
	args := m.Called(ctx, in)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*ledger.RecordTradeResponse), args.Error(1)
}

func (m *MockLedgerClient) GetOpenOrders(ctx context.Context, in *ledger.GetOpenOrdersRequest, opts ...grpc.CallOption) (*ledger.GetOpenOrdersResponse, error) {
	args := m.Called(ctx, in)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*ledger.GetOpenOrdersResponse), args.Error(1)
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
func (m *MockLedgerClient) CreateInstrument(ctx context.Context, in *ledger.CreateInstrumentRequest, opts ...grpc.CallOption) (*ledger.CreateInstrumentResponse, error) { return nil, nil }
func (m *MockLedgerClient) GetSystemAccount(ctx context.Context, in *ledger.GetSystemAccountRequest, opts ...grpc.CallOption) (*ledger.GetSystemAccountResponse, error) { return nil, nil }

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
