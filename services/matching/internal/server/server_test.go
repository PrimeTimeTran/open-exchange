package server

import (
	"context"
	"net"
	"testing"

	"github.com/open-exchange/matching_engine/internal/engine"
	"github.com/open-exchange/matching_engine/internal/service"
	"github.com/open-exchange/matching_engine/internal/testutil"
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

// setupTestServer spins up an in-memory gRPC server with the Matching service registered.
// It returns the client to talk to this server, the mock dependencies to set expectations, and a cleanup function.
func setupTestServer(t *testing.T) (pb.MatchingClient, *testutil.MockLedgerClient, *testutil.MockPublisher, *testutil.MockStore, func()) {
	// 1. Create In-Memory Listener
	lis := bufconn.Listen(bufSize)

	// 2. Initialize Dependencies (Mocks & Engine)
	eng := engine.NewEngine()
	mockLedger := new(testutil.MockLedgerClient)
	mockPublisher := new(testutil.MockPublisher)
	mockStore := new(testutil.MockStore)

	// 3. Create Service & Server
	svc := service.NewMatchingService(eng, mockLedger, mockPublisher, mockStore)
	serverImpl := NewMatchingServer(svc)

	// 4. Create and Start gRPC Server
	s := grpc.NewServer()
	pb.RegisterMatchingServer(s, serverImpl)

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

	client := pb.NewMatchingClient(conn)

	// Cleanup closure
	cleanup := func() {
		conn.Close()
		s.Stop()
		lis.Close()
	}

	return client, mockLedger, mockPublisher, mockStore, cleanup
}

func TestMatchingServer_PlaceOrder_Success(t *testing.T) {
	// Verifies that PlaceOrder gRPC call is correctly routed to the service, dependencies are called, and response is returned.
	client, mockLedger, mockPublisher, mockStore, cleanup := setupTestServer(t)
	defer cleanup()

	ctx := context.Background()

	// Expectations
	// RecordOrder is no longer called
	// mockLedger.On("RecordOrder", mock.Anything, mock.Anything).Return(&ledger.RecordOrderResponse{Success: true}, nil)
	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.Anything).Return(nil)
	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	// Request
	req := &pb.PlaceOrderRequest{
		Order: testutil.NewOrder("order_123", common.OrderSide_ORDER_SIDE_BUY, 50000, 1.0),
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
	client, mockLedger, mockPublisher, mockStore, cleanup := setupTestServer(t)
	defer cleanup()

	ctx := context.Background()

	// Setup: Place order first so it can be cancelled
	// Note: We bypass gRPC for setup to focus test on CancelOrder, or we can just mock the Service internals if we could.
	// Since we rely on the real engine state, we must actually place the order first.
	
	// Expectations for Placement
	// mockLedger.On("RecordOrder", mock.Anything, mock.Anything).Return(&ledger.RecordOrderResponse{Success: true}, nil)
	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.Anything).Return(nil)
	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	_, err := client.PlaceOrder(ctx, &pb.PlaceOrderRequest{
		Order: testutil.NewOrder("order_to_cancel", common.OrderSide_ORDER_SIDE_BUY, 50000, 1.0),
	})
	assert.NoError(t, err)

	// Expectations for Cancellation
	mockLedger.On("CancelOrder", mock.Anything, mock.MatchedBy(func(req *ledger.CancelOrderRequest) bool {
		return req.OrderId == "order_to_cancel"
	}), mock.Anything).Return(&ledger.CancelOrderResponse{Success: true}, nil)
	
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

func TestMatchingServer_PlaceOrder_MatchSuccess(t *testing.T) {
	// Verifies that when an order matches, ProcessTrade is called on the Ledger service.
	client, mockLedger, mockPublisher, mockStore, cleanup := setupTestServer(t)
	defer cleanup()

	ctx := context.Background()

	// 1. Setup: Place a Sell Order (Maker)
	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.Anything).Return(nil)
	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	makerOrder := testutil.NewOrder("maker_sell", common.OrderSide_ORDER_SIDE_SELL, 50000, 1.0)
	makerOrder.AccountId = "user1"
	_, err := client.PlaceOrder(ctx, &pb.PlaceOrderRequest{
		Order: makerOrder,
	})
	assert.NoError(t, err)

	// 2. Execute: Place a Buy Order (Taker) that matches
	// Expect ProcessTrade to be called
	mockLedger.On("ProcessTrade", mock.Anything, mock.MatchedBy(func(req *ledger.ProcessTradeRequest) bool {
		// Note: Prices/Quantities are strings in proto
		return req.MakerOrderId == "maker_sell" && req.TakerOrderId == "taker_buy"
	}), mock.Anything).Return(&ledger.ProcessTradeResponse{Success: true}, nil)
	
	// Expect Trade Event
	mockPublisher.On("PublishTrade", mock.Anything, mock.Anything).Return(nil)
	
	takerOrder := testutil.NewOrder("taker_buy", common.OrderSide_ORDER_SIDE_BUY, 50000, 1.0)
	takerOrder.AccountId = "user2"
	req := &pb.PlaceOrderRequest{
		Order: takerOrder,
	}
	resp, err := client.PlaceOrder(ctx, req)

	// Assertions
	assert.NoError(t, err)
	assert.True(t, resp.Success)

	mockLedger.AssertExpectations(t)
	mockPublisher.AssertExpectations(t)
}

func TestMatchingServer_PlaceOrder_InvalidInput(t *testing.T) {
	// Verifies that PlaceOrder returns failure when input validation fails (e.g., missing InstrumentID).
	client, mockLedger, _, _, cleanup := setupTestServer(t)
	defer cleanup()

	ctx := context.Background()

	// Current implementation calls Ledger BEFORE validation.
	// So we must expect this call.
	// mockLedger.On("RecordOrder", mock.Anything, mock.Anything).Return(&ledger.RecordOrderResponse{Success: true}, nil)

	// Request with missing InstrumentID
	badOrder := testutil.NewOrder("bad_order", common.OrderSide_ORDER_SIDE_BUY, 50000, 1.0)
	badOrder.InstrumentId = ""
	req := &pb.PlaceOrderRequest{
		Order: badOrder,
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
	client, mockLedger, _, _, cleanup := setupTestServer(t)
	defer cleanup()

	ctx := context.Background()

	// Update: The service now calls Ledger FIRST.
	// We expect the Ledger to be called. We can mock it to succeed, so we hit the Engine error.
	mockLedger.On("CancelOrder", mock.Anything, mock.MatchedBy(func(req *ledger.CancelOrderRequest) bool {
		return req.OrderId == "ghost_order"
	}), mock.Anything).Return(&ledger.CancelOrderResponse{Success: true}, nil)

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

func TestMatchingServer_PlaceOrder_TradeLedgerFailure(t *testing.T) {
	// Verifies that if Ledger service fails to record a trade, the PlaceOrder request fails.
	client, mockLedger, mockPublisher, mockStore, cleanup := setupTestServer(t)
	defer cleanup()

	ctx := context.Background()

    // 1. Setup: Place a Sell Order (Maker)
	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.Anything).Return(nil)
	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	makerOrder := testutil.NewOrder("maker_sell", common.OrderSide_ORDER_SIDE_SELL, 50000, 1.0)
	makerOrder.AccountId = "user1"
	_, err := client.PlaceOrder(ctx, &pb.PlaceOrderRequest{
		Order: makerOrder,
	})
	assert.NoError(t, err)

    // 2. Execute: Place a Buy Order (Taker) that matches
	// Expectations: Ledger returns actual ERROR for ProcessTrade
	mockLedger.On("ProcessTrade", mock.Anything, mock.Anything, mock.Anything).Return((*ledger.ProcessTradeResponse)(nil), assert.AnError)
	takerOrder := testutil.NewOrder("taker_buy", common.OrderSide_ORDER_SIDE_BUY, 50000, 1.0)
	takerOrder.AccountId = "user2"
	req := &pb.PlaceOrderRequest{
		Order: takerOrder,
	}

	resp, err := client.PlaceOrder(ctx, req)

	// Assertions
	assert.NoError(t, err) // gRPC call succeeds
	assert.False(t, resp.Success) // Result indicates failure
	assert.Contains(t, resp.ErrorMessage, "failed to record trade")
	
	mockLedger.AssertExpectations(t)
    mockPublisher.AssertExpectations(t)
}

// --- Mocks Definitions ---
// Mocks are now defined in services/matching/internal/testutil/mocks.go

