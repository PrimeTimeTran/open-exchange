package service

import (
	"context"
	"testing"

	"github.com/open-exchange/matching_engine/internal/engine"
	"github.com/open-exchange/matching_engine/internal/events"
	"github.com/open-exchange/matching_engine/internal/testutil"
	common "github.com/open-exchange/matching_engine/proto/common"
	ledger "github.com/open-exchange/matching_engine/proto/ledger"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func setupServiceTest() (*MatchingService, *engine.Engine, *testutil.MockLedgerClient, *testutil.MockPublisher) {
	eng := engine.NewEngine()
	mockLedger := new(testutil.MockLedgerClient)
	mockPublisher := new(testutil.MockPublisher)
	svc := NewMatchingService(eng, mockLedger, mockPublisher)
	return svc, eng, mockLedger, mockPublisher
}

func TestPlaceOrder(t *testing.T) {
	// Setup
	svc, eng, _, mockPublisher := setupServiceTest()

	order := testutil.NewOrder("new_order", common.OrderSide_ORDER_SIDE_BUY, 55000, 0.5)

	// Expectations
	// RecordOrder is no longer called by Matching Service (Ledger calls Matching)
	// mockLedger.On("RecordOrder", mock.Anything, mock.Anything, mock.Anything).Return(&ledger.RecordOrderResponse{
	// 	Success: true,
	// }, nil)

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
	svc, eng, mockLedger, mockPublisher := setupServiceTest()

	// Pre-fill the engine with a sell order
	sellOrder := testutil.NewOrder("sell_1", common.OrderSide_ORDER_SIDE_SELL, 50000, 1.0)
	sellOrder.AccountId = "user1"
	eng.ProcessOrder(engine.NewOrderFromProto(sellOrder), nil)

	// New Buy Order that matches
	order := testutil.NewOrder("buy_1", common.OrderSide_ORDER_SIDE_BUY, 50000, 0.5)
	order.AccountId = "user2"

	// Expectations
	// RecordOrder is no longer called by Matching Service (Ledger calls Matching)
	// mockLedger.On("RecordOrder", mock.Anything, mock.Anything, mock.Anything).Return(&ledger.RecordOrderResponse{
	// 	Success: true,
	// }, nil)

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
	svc, eng, mockLedger, mockPublisher := setupServiceTest()

	// Pre-fill
	eng.ProcessOrder(engine.NewOrderFromProto(testutil.NewOrder("order_to_cancel", common.OrderSide_ORDER_SIDE_BUY, 50000, 1.0)), nil)

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

func TestRecoverState(t *testing.T) {
	// Setup
	svc, eng, mockLedger, _ := setupServiceTest()

	// Mock Data: 2 existing orders
	existingOrders := []*common.Order{
		testutil.NewOrder("order1", common.OrderSide_ORDER_SIDE_BUY, 50000, 1.0),
		testutil.NewOrder("order2", common.OrderSide_ORDER_SIDE_SELL, 60000, 2.0),
	}

	// Expectations
	// RecoverState passes explicit empty string for InstrumentId
	mockLedger.On("GetOpenOrders", mock.Anything, &ledger.GetOpenOrdersRequest{
		InstrumentId: "",
	}, mock.Anything).Return(&ledger.GetOpenOrdersResponse{
		Orders: existingOrders,
	}, nil)

	// Execute
	err := svc.RecoverState(context.Background())

	// Assert
	assert.NoError(t, err)
	
	// Verify Engine State
	book := eng.GetOrderBook("BTC-USD")
	assert.Len(t, book.Bids, 1)
	assert.Equal(t, "order1", book.Bids[0].ID)
	assert.Len(t, book.Asks, 1)
	assert.Equal(t, "order2", book.Asks[0].ID)
	
	mockLedger.AssertExpectations(t)
}

func TestRecoverState_LedgerError(t *testing.T) {
	// Setup
	svc, _, mockLedger, _ := setupServiceTest()

	// Expectations
	mockLedger.On("GetOpenOrders", mock.Anything, mock.Anything, mock.Anything).Return(nil, assert.AnError)

	// Execute
	err := svc.RecoverState(context.Background())

	// Assert
	assert.Error(t, err)
	mockLedger.AssertExpectations(t)
}
