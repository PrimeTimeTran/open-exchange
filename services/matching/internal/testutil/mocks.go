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

func (m *MockLedgerClient) DeleteOrder(ctx context.Context, in *ledger.DeleteOrderRequest, opts ...grpc.CallOption) (*ledger.DeleteOrderResponse, error) {
	args := m.Called(ctx, in, opts)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*ledger.DeleteOrderResponse), args.Error(1)
}
func (m *MockLedgerClient) CreateInstrument(ctx context.Context, in *ledger.CreateInstrumentRequest, opts ...grpc.CallOption) (*ledger.CreateInstrumentResponse, error) { return nil, nil }
func (m *MockLedgerClient) GetSystemAccount(ctx context.Context, in *ledger.GetSystemAccountRequest, opts ...grpc.CallOption) (*ledger.GetSystemAccountResponse, error) { return nil, nil }
