package service

import (
	"context"
	"testing"

	"fmt"

	"github.com/open-exchange/matching_engine/internal/engine"
	"github.com/open-exchange/matching_engine/internal/events"
	"github.com/open-exchange/matching_engine/internal/testutil"
	common "github.com/open-exchange/matching_engine/proto/common"
	ledger "github.com/open-exchange/matching_engine/proto/ledger"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func setupServiceTest(startWorker bool) (*MatchingService, *engine.Engine, *testutil.MockLedgerClient, *testutil.MockSettlementClient, *testutil.MockPublisher, *testutil.MockStore) {
	eng := engine.NewEngine()
	mockLedger := new(testutil.MockLedgerClient)
	mockSettlement := new(testutil.MockSettlementClient)
	mockPublisher := new(testutil.MockPublisher)
	mockStore := new(testutil.MockStore)
	
	// Default mock behavior for background worker
	if startWorker {
		mockStore.On("DequeueMatches", mock.Anything).Return([]byte(nil), fmt.Errorf("queue empty")).Maybe()
	}

	svc := &MatchingService{
		Engine:           eng,
		LedgerClient:     mockLedger,
		SettlementClient: mockSettlement,
		Publisher:        mockPublisher,
		Store:            mockStore,
	}
	
	if startWorker {
		go svc.startSettlementWorker()
	}
	
	return svc, eng, mockLedger, mockSettlement, mockPublisher, mockStore
}

func TestPlaceOrder(t *testing.T) {
	svc, eng, _, _, mockPublisher, mockStore := setupServiceTest(true)

	order := testutil.NewOrder("new_order", common.OrderSide_ORDER_SIDE_BUY, 55000, 0.5)

	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.Anything).Return(nil)
	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	id, err := svc.PlaceOrder(context.Background(), order)

	assert.NoError(t, err)
	assert.Equal(t, "new_order", id)

	book := eng.GetOrderBook("BTC-USD")
	assert.Len(t, book.Bids(), 1)

	mockPublisher.AssertExpectations(t)
}

func TestPlaceOrder_WithMatch(t *testing.T) {
	svc, eng, _, mockSettlement, mockPublisher, mockStore := setupServiceTest(true)

	sellOrder := testutil.NewOrder("sell_1", common.OrderSide_ORDER_SIDE_SELL, 50000, 1.0)
	eng.ProcessOrder(engine.NewOrderFromProto(sellOrder), nil)

	order := testutil.NewOrder("buy_1", common.OrderSide_ORDER_SIDE_BUY, 50000, 0.5)

	mockStore.On("EnqueueMatches", mock.Anything, mock.MatchedBy(func(req *ledger.CommitRequest) bool {
		if len(req.Matches) != 1 {
			return false
		}
		match := req.Matches[0]
		// Updated to 8 decimal places to match new formatting
		return match.MakerOrderId == "sell_1" && match.TakerOrderId == "buy_1" && match.Quantity == "0.50000000"
	})).Return(nil)
	
	mockSettlement.AssertNotCalled(t, "Commit")

	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.Anything).Return(nil)

	mockPublisher.On("PublishTrade", mock.Anything, mock.MatchedBy(func(event events.TradeEvent) bool {
		return event.MakerOrderID == "sell_1" && event.TakerOrderID == "buy_1" && event.Quantity == 0.5
	})).Return(nil)

	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	id, err := svc.PlaceOrder(context.Background(), order)

	assert.NoError(t, err)
	assert.Equal(t, "buy_1", id)

	mockStore.AssertExpectations(t)
	mockPublisher.AssertExpectations(t)
}

func TestCancelOrder(t *testing.T) {
	svc, eng, mockLedger, _, mockPublisher, mockStore := setupServiceTest(true)

	eng.ProcessOrder(engine.NewOrderFromProto(testutil.NewOrder("order_to_cancel", common.OrderSide_ORDER_SIDE_BUY, 50000, 1.0)), nil)

	mockLedger.On("CancelOrder", mock.Anything, mock.MatchedBy(func(req *ledger.CancelOrderRequest) bool {
		return req.OrderId == "order_to_cancel"
	}), mock.Anything).Return(&ledger.CancelOrderResponse{
		Success: true,
	}, nil)

	mockPublisher.On("PublishOrderCancelled", mock.Anything, mock.MatchedBy(func(event events.OrderCancelledEvent) bool {
		return event.OrderID == "order_to_cancel" && event.InstrumentID == "BTC-USD"
	})).Return(nil)

	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	err := svc.CancelOrder(context.Background(), "order_to_cancel", "BTC-USD")

	assert.NoError(t, err)

	book := eng.GetOrderBook("BTC-USD")
	assert.Len(t, book.Bids(), 0)

	mockLedger.AssertExpectations(t)
	mockPublisher.AssertExpectations(t)
}

func TestRecoverState(t *testing.T) {
	svc, eng, mockLedger, _, _, mockStore := setupServiceTest(true)

	existingOrders := []*common.Order{
		testutil.NewOrder("order1", common.OrderSide_ORDER_SIDE_BUY, 50000, 1.0),
		testutil.NewOrder("order2", common.OrderSide_ORDER_SIDE_SELL, 60000, 2.0),
	}

	mockStore.On("ListOrderBooks", mock.Anything).Return([]string{}, nil)
	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	mockLedger.On("GetOpenOrders", mock.Anything, &ledger.GetOpenOrdersRequest{
		InstrumentId: "",
	}, mock.Anything).Return(&ledger.GetOpenOrdersResponse{
		Orders: existingOrders,
	}, nil)

	err := svc.RecoverState(context.Background())

	assert.NoError(t, err)
	
	book := eng.GetOrderBook("BTC-USD")
	assert.Len(t, book.Bids(), 1)
	assert.Equal(t, "order1", book.Bids()[0].ID)
	assert.Len(t, book.Asks(), 1)
	assert.Equal(t, "order2", book.Asks()[0].ID)
	
	mockLedger.AssertExpectations(t)
}

func TestRecoverState_LedgerError(t *testing.T) {
	svc, _, mockLedger, _, _, mockStore := setupServiceTest(true)

	mockStore.On("ListOrderBooks", mock.Anything).Return([]string{}, nil)
	mockLedger.On("GetOpenOrders", mock.Anything, mock.Anything, mock.Anything).Return(nil, assert.AnError)

	err := svc.RecoverState(context.Background())

	assert.Error(t, err)
	mockLedger.AssertExpectations(t)
}
