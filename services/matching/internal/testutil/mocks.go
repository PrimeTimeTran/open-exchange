package testutil

import (
	"context"

	"github.com/open-exchange/matching_engine/internal/engine"
	"github.com/open-exchange/matching_engine/internal/events"
	ledger "github.com/open-exchange/matching_engine/proto/ledger"
	"github.com/stretchr/testify/mock"
	"google.golang.org/grpc"
)

// MockStore is a mock implementation of service.Store
type MockStore struct {
	mock.Mock
}

func (m *MockStore) SaveOrderBook(ctx context.Context, ob *engine.OrderBook) error {
	args := m.Called(ctx, ob)
	return args.Error(0)
}

func (m *MockStore) LoadOrderBook(ctx context.Context, instrumentID string) (*engine.OrderBook, error) {
	args := m.Called(ctx, instrumentID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*engine.OrderBook), args.Error(1)
}

func (m *MockStore) ListOrderBooks(ctx context.Context) ([]string, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]string), args.Error(1)
}

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

// MockLedgerClient is a mock implementation of ledger.OrderServiceClient
type MockLedgerClient struct {
	mock.Mock
}

// Ensure MockLedgerClient implements the interface
var _ ledger.OrderServiceClient = (*MockLedgerClient)(nil)

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

func (m *MockLedgerClient) ProcessTrade(ctx context.Context, in *ledger.ProcessTradeRequest, opts ...grpc.CallOption) (*ledger.ProcessTradeResponse, error) {
	args := m.Called(ctx, in, opts)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*ledger.ProcessTradeResponse), args.Error(1)
}

func (m *MockLedgerClient) CancelOrder(ctx context.Context, in *ledger.CancelOrderRequest, opts ...grpc.CallOption) (*ledger.CancelOrderResponse, error) {
	args := m.Called(ctx, in, opts)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*ledger.CancelOrderResponse), args.Error(1)
}

func (m *MockLedgerClient) DeleteOrder(ctx context.Context, in *ledger.DeleteOrderRequest, opts ...grpc.CallOption) (*ledger.DeleteOrderResponse, error) {
	args := m.Called(ctx, in, opts)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*ledger.DeleteOrderResponse), args.Error(1)
}

// MockSettlementClient is a mock implementation of ledger.SettlementClient
type MockSettlementClient struct {
	mock.Mock
}

// Ensure MockSettlementClient implements the interface
var _ ledger.SettlementClient = (*MockSettlementClient)(nil)

func (m *MockSettlementClient) Commit(ctx context.Context, in *ledger.CommitRequest, opts ...grpc.CallOption) (*ledger.CommitResponse, error) {
	args := m.Called(ctx, in, opts)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*ledger.CommitResponse), args.Error(1)
}

func (m *MockStore) EnqueueMatches(ctx context.Context, matches interface{}) error {
	args := m.Called(ctx, matches)
	return args.Error(0)
}

func (m *MockStore) DequeueMatches(ctx context.Context) ([]byte, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]byte), args.Error(1)
}
