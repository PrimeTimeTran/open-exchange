package service

import (
	"context"
	"testing"

	"github.com/open-exchange/matching_engine/internal/engine"
	"github.com/open-exchange/matching_engine/internal/events"
	common "github.com/open-exchange/matching_engine/proto/common"
	ledger "github.com/open-exchange/matching_engine/proto/ledger"
	"github.com/stretchr/testify/assert"
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

func TestSyncOrderBook(t *testing.T) {
	// Setup
	eng := engine.NewEngine()
	mockLedger := new(MockLedgerClient)
	mockPublisher := new(MockPublisher)
	svc := NewMatchingService(eng, mockLedger, mockPublisher)

	// Mock Data: 2 existing orders
	existingOrders := []*common.Order{
		{
			Id:           "order1",
			Side:         common.OrderSide_ORDER_SIDE_BUY,
			Type:         common.OrderType_ORDER_TYPE_LIMIT,
			Price:        "50000",
			Quantity:     "1.0",
			InstrumentId: "BTC-USD",
		},
		{
			Id:           "order2",
			Side:         common.OrderSide_ORDER_SIDE_SELL,
			Type:         common.OrderType_ORDER_TYPE_LIMIT,
			Price:        "60000",
			Quantity:     "2.0",
			InstrumentId: "BTC-USD",
		},
	}

	// Expectations
	mockLedger.On("GetOpenOrders", mock.Anything, mock.Anything, mock.Anything).Return(&ledger.GetOpenOrdersResponse{
		Orders: existingOrders,
	}, nil)

	// Execute
	err := svc.SyncOrderBook(context.Background())

	// Assert
	assert.NoError(t, err)
	
	// Verify Engine State
	book := eng.GetOrderBook("BTC-USD")
	assert.Len(t, book.Bids, 1)
	assert.Equal(t, "order1", book.Bids[0].ID)
	assert.Len(t, book.Asks, 1)
	assert.Equal(t, "order2", book.Asks[0].ID)
}

func TestPlaceOrder(t *testing.T) {
	// Setup
	eng := engine.NewEngine()
	mockLedger := new(MockLedgerClient)
	mockPublisher := new(MockPublisher)
	svc := NewMatchingService(eng, mockLedger, mockPublisher)

	order := &common.Order{
		Id:           "new_order",
		Side:         common.OrderSide_ORDER_SIDE_BUY,
		Type:         common.OrderType_ORDER_TYPE_LIMIT,
		Price:        "55000",
		Quantity:     "0.5",
		InstrumentId: "BTC-USD",
	}

	// Expectations
	mockLedger.On("RecordOrder", mock.Anything, mock.Anything, mock.Anything).Return(&ledger.RecordOrderResponse{
		Success: true,
	}, nil)

	// Expect PublishOrderBookEvent
	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.Anything).Return(nil)

	// Execute
	id, err := svc.PlaceOrder(context.Background(), order)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, "new_order", id)

	// Verify it's in the engine
	book := eng.GetOrderBook("BTC-USD")
	assert.Len(t, book.Bids, 1)

	mockPublisher.AssertExpectations(t)
}

func TestPlaceOrder_WithMatch(t *testing.T) {
	// Setup
	eng := engine.NewEngine()
	mockLedger := new(MockLedgerClient)
	mockPublisher := new(MockPublisher)
	svc := NewMatchingService(eng, mockLedger, mockPublisher)

	// Pre-fill the engine with a sell order
	eng.ProcessOrder(engine.NewOrderFromProto(&common.Order{
		Id:           "sell_1",
		Side:         common.OrderSide_ORDER_SIDE_SELL,
		Type:         common.OrderType_ORDER_TYPE_LIMIT,
		Price:        "50000",
		Quantity:     "1.0",
		InstrumentId: "BTC-USD",
	}), nil)

	// New Buy Order that matches
	order := &common.Order{
		Id:           "buy_1",
		Side:         common.OrderSide_ORDER_SIDE_BUY,
		Type:         common.OrderType_ORDER_TYPE_LIMIT,
		Price:        "50000",
		Quantity:     "0.5",
		InstrumentId: "BTC-USD",
	}

	// Expectations
	mockLedger.On("RecordOrder", mock.Anything, mock.Anything, mock.Anything).Return(&ledger.RecordOrderResponse{
		Success: true,
	}, nil)

	// Expect RecordTrade to be called once
	mockLedger.On("RecordTrade", mock.Anything, mock.MatchedBy(func(req *ledger.RecordTradeRequest) bool {
		return req.MakerOrderId == "sell_1" && req.TakerOrderId == "buy_1" && req.Quantity == "0.500000"
	}), mock.Anything).Return(&ledger.RecordTradeResponse{
		Success: true,
	}, nil)

	// Expect PublishOrderBookEvent (likely multiple times, for match and partial fill remaining)
	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.Anything).Return(nil)

	// Expect PublishTrade to be called once
	mockPublisher.On("PublishTrade", mock.Anything, mock.MatchedBy(func(event events.TradeEvent) bool {
		return event.MakerOrderID == "sell_1" && event.TakerOrderID == "buy_1" && event.Quantity == 0.5
	})).Return(nil)

	// Execute
	id, err := svc.PlaceOrder(context.Background(), order)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, "buy_1", id)

	// Verify RecordTrade was called
	mockLedger.AssertExpectations(t)
	mockPublisher.AssertExpectations(t)
}

func TestCancelOrder(t *testing.T) {
	// Setup
	eng := engine.NewEngine()
	mockLedger := new(MockLedgerClient)
	mockPublisher := new(MockPublisher)
	svc := NewMatchingService(eng, mockLedger, mockPublisher)

	// Pre-fill
	eng.ProcessOrder(engine.NewOrderFromProto(&common.Order{
		Id:           "order_to_cancel",
		Side:         common.OrderSide_ORDER_SIDE_BUY,
		Type:         common.OrderType_ORDER_TYPE_LIMIT,
		Price:        "50000",
		Quantity:     "1.0",
		InstrumentId: "BTC-USD",
	}), nil)

	// Expectations
	mockLedger.On("CancelOrder", mock.Anything, mock.MatchedBy(func(req *ledger.CancelOrderRequest) bool {
		return req.OrderId == "order_to_cancel"
	}), mock.Anything).Return(&ledger.CancelOrderResponse{
		Success: true,
	}, nil)

	mockPublisher.On("PublishOrderCancelled", mock.Anything, mock.MatchedBy(func(event events.OrderCancelledEvent) bool {
		return event.OrderID == "order_to_cancel" && event.InstrumentID == "BTC-USD"
	})).Return(nil)

	// Execute
	err := svc.CancelOrder(context.Background(), "order_to_cancel", "BTC-USD")

	// Assert
	assert.NoError(t, err)

	// Verify removed from engine
	book := eng.GetOrderBook("BTC-USD")
	assert.Len(t, book.Bids, 0)

	mockLedger.AssertExpectations(t)
	mockPublisher.AssertExpectations(t)
}
