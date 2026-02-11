package server

import (
	"context"
	"fmt"
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

const bufSize = 1024 * 1024

func setupTestServer(t *testing.T) (pb.MatchingClient, *testutil.MockLedgerClient, *testutil.MockSettlementClient, *testutil.MockPublisher, *testutil.MockStore, func()) {
	lis := bufconn.Listen(bufSize)

	eng := engine.NewEngine()
	mockLedger := new(testutil.MockLedgerClient)
	mockSettlement := new(testutil.MockSettlementClient)
	mockPublisher := new(testutil.MockPublisher)
	mockStore := new(testutil.MockStore)
	
	// Default mock behavior for background worker
	mockStore.On("DequeueMatches", mock.Anything).Return([]byte(nil), fmt.Errorf("queue empty"))

	svc := service.NewMatchingService(eng, mockLedger, mockSettlement, mockPublisher, mockStore)
	serverImpl := NewMatchingServer(svc)

	s := grpc.NewServer()
	pb.RegisterMatchingServer(s, serverImpl)

	go func() {
		if err := s.Serve(lis); err != nil {
			// Server might be closed during cleanup, ignore error
		}
	}()

	dialer := func(context.Context, string) (net.Conn, error) {
		return lis.Dial()
	}

	conn, err := grpc.NewClient("passthrough://bufnet", grpc.WithContextDialer(dialer), grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		t.Fatalf("Failed to dial bufnet: %v", err)
	}

	client := pb.NewMatchingClient(conn)

	return client, mockLedger, mockSettlement, mockPublisher, mockStore, func() {
		conn.Close()
		s.Stop()
		lis.Close()
	}
}

func TestMatchingServer_PlaceOrder_Success(t *testing.T) {
	client, mockLedger, _, mockPublisher, mockStore, cleanup := setupTestServer(t)
	defer cleanup()

	ctx := context.Background()

	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.Anything).Return(nil)
	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	req := &pb.PlaceOrderRequest{
		Order: testutil.NewOrder("order_123", common.OrderSide_ORDER_SIDE_BUY, 50000, 1.0),
	}

	resp, err := client.PlaceOrder(ctx, req)

	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.True(t, resp.Success)
	assert.Equal(t, "order_123", resp.OrderId)

	mockLedger.AssertExpectations(t)
	mockPublisher.AssertExpectations(t)
}

func TestMatchingServer_CancelOrder_Success(t *testing.T) {
	client, mockLedger, _, mockPublisher, mockStore, cleanup := setupTestServer(t)
	defer cleanup()

	ctx := context.Background()

	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.Anything).Return(nil)
	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	_, err := client.PlaceOrder(ctx, &pb.PlaceOrderRequest{
		Order: testutil.NewOrder("order_to_cancel", common.OrderSide_ORDER_SIDE_BUY, 50000, 1.0),
	})
	assert.NoError(t, err)

	mockLedger.On("CancelOrder", mock.Anything, mock.MatchedBy(func(req *ledger.CancelOrderRequest) bool {
		return req.OrderId == "order_to_cancel"
	}), mock.Anything).Return(&ledger.CancelOrderResponse{Success: true}, nil)
	
	mockPublisher.On("PublishOrderCancelled", mock.Anything, mock.Anything).Return(nil)

	req := &pb.CancelOrderRequest{
		OrderId:      "order_to_cancel",
		InstrumentId: "BTC-USD",
	}
	resp, err := client.CancelOrder(ctx, req)

	assert.NoError(t, err)
	assert.True(t, resp.Success)

	mockLedger.AssertExpectations(t)
	mockPublisher.AssertExpectations(t)
}

func TestMatchingServer_PlaceOrder_MatchSuccess(t *testing.T) {
	client, _, mockSettlement, mockPublisher, mockStore, cleanup := setupTestServer(t)
	defer cleanup()
	ctx := context.Background()

	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.Anything).Return(nil)
	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	makerOrder := testutil.NewOrder("maker_sell", common.OrderSide_ORDER_SIDE_SELL, 50000, 1.0)
	makerOrder.AccountId = "user1"
	_, err := client.PlaceOrder(ctx, &pb.PlaceOrderRequest{
		Order: makerOrder,
	})
	assert.NoError(t, err)

	mockStore.On("EnqueueMatches", mock.Anything, mock.MatchedBy(func(req *ledger.CommitRequest) bool {
		if len(req.Matches) != 1 {
			return false
		}
		match := req.Matches[0]
		return match.MakerOrderId == "maker_sell" && match.TakerOrderId == "taker_buy"
	})).Return(nil)
	
	mockSettlement.AssertNotCalled(t, "Commit")
	
	mockPublisher.On("PublishTrade", mock.Anything, mock.Anything).Return(nil)
	
	takerOrder := testutil.NewOrder("taker_buy", common.OrderSide_ORDER_SIDE_BUY, 50000, 1.0)
	takerOrder.AccountId = "user2"
	req := &pb.PlaceOrderRequest{
		Order: takerOrder,
	}
	resp, err := client.PlaceOrder(ctx, req)

	assert.NoError(t, err)
	assert.True(t, resp.Success)

	mockSettlement.AssertExpectations(t)
	mockPublisher.AssertExpectations(t)
}

func TestMatchingServer_PlaceOrder_InvalidInput(t *testing.T) {
	client, _, _, _, _, cleanup := setupTestServer(t)
	defer cleanup()

	ctx := context.Background()

	badOrder := testutil.NewOrder("bad_order", common.OrderSide_ORDER_SIDE_BUY, 50000, 1.0)
	badOrder.InstrumentId = ""
	req := &pb.PlaceOrderRequest{
		Order: badOrder,
	}

	resp, err := client.PlaceOrder(ctx, req)

	assert.NoError(t, err)
	assert.False(t, resp.Success)
	assert.NotEmpty(t, resp.ErrorMessage)
	assert.Contains(t, resp.ErrorMessage, "instrument ID is required")
}

func TestMatchingServer_CancelOrder_NotFound(t *testing.T) {
	client, mockLedger, _, _, _, cleanup := setupTestServer(t)
	defer cleanup()

	ctx := context.Background()

	// Update: The service calls Engine first. If not found, it returns error immediately and DOES NOT call Ledger.
	// So we should NOT expect Ledger call here.

	req := &pb.CancelOrderRequest{
		OrderId:      "ghost_order",
		InstrumentId: "BTC-USD",
	}
	resp, err := client.CancelOrder(ctx, req)

	assert.NoError(t, err)
	assert.False(t, resp.Success)
	assert.Contains(t, resp.ErrorMessage, "failed to cancel order")

	mockLedger.AssertExpectations(t)
}

func TestMatchingServer_PlaceOrder_TradeLedgerFailure(t *testing.T) {
	client, _, mockSettlement, mockPublisher, mockStore, cleanup := setupTestServer(t)
	defer cleanup()

	ctx := context.Background()

	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.Anything).Return(nil)
	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	makerOrder := testutil.NewOrder("maker_sell", common.OrderSide_ORDER_SIDE_SELL, 50000, 1.0)
	makerOrder.AccountId = "user1"
	_, err := client.PlaceOrder(ctx, &pb.PlaceOrderRequest{
		Order: makerOrder,
	})
	assert.NoError(t, err)

	// 2. Execute: Place a Buy Order (Taker) that matches
	// Expectations: Ledger returns actual ERROR for Commit
	// But since we are optimistic, we still publish the trade because it happened in the engine.
	mockStore.On("EnqueueMatches", mock.Anything, mock.Anything).Return(assert.AnError)
	mockSettlement.AssertNotCalled(t, "Commit")

	// PublishTrade is NOT called because EnqueueMatches fails critical path
	// mockPublisher.On("PublishTrade", mock.Anything, mock.Anything).Return(nil)

	takerOrder := testutil.NewOrder("taker_buy", common.OrderSide_ORDER_SIDE_BUY, 50000, 1.0)
	takerOrder.AccountId = "user2"
	req := &pb.PlaceOrderRequest{
		Order: takerOrder,
	}

	resp, err := client.PlaceOrder(ctx, req)

	assert.NoError(t, err)
	// Update: With optimistic matching, failure to enqueue (persist) to ledger is a critical error,
	// and we should report failure to the client.
	assert.False(t, resp.Success)
	
	mockStore.AssertExpectations(t)
    mockPublisher.AssertExpectations(t)
}
