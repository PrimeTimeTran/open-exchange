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

// Test 1: No Match
// Create 1 open ask for BTC_USD at $50,000 and then 1 open bid for BTC_USD at $49,500.
// The matching service should not create any matches and not call settlement.
func TestMatchingScenarios_NoMatch(t *testing.T) {
	svc, eng, _, mockSettlement, mockPublisher, mockStore := setupServiceTest()

	// 1. Setup: Place 1 Open Ask at $50,000
	// We inject directly into the engine to simulate "Existing Orders"
	askOrder := testutil.NewOrder("ask_50k", common.OrderSide_ORDER_SIDE_SELL, 50000, 1.0)
	eng.ProcessOrder(engine.NewOrderFromProto(askOrder), nil)

	// 2. Execute: Place 1 Open Bid at $49,500 (Below Ask -> No Match)
	bidOrder := testutil.NewOrder("bid_49.5k", common.OrderSide_ORDER_SIDE_BUY, 49500, 1.0)

	// Expectations
	// Settlement should NOT be called
	mockSettlement.AssertNotCalled(t, "Commit")
	
	// Publisher should publish OrderCreated (Book Event) but NOT Trade
	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.MatchedBy(func(e events.OrderBookEvent) bool {
		return e.Type == events.OrderCreated && e.OrderID == "bid_49.5k"
	})).Return(nil)
	
	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	id, err := svc.PlaceOrder(context.Background(), bidOrder)

	// Assertions
	assert.NoError(t, err)
	assert.Equal(t, "bid_49.5k", id)
	
	// Verify order book state: Both orders sit on the book
	book := eng.GetOrderBook("BTC-USD")
	assert.Len(t, book.Bids, 1) // The new bid
	assert.Len(t, book.Asks, 1) // The existing ask

	mockPublisher.AssertNotCalled(t, "PublishTrade")
	mockPublisher.AssertExpectations(t)
}

// Test 2: Single Match
// Create 1 open ask for BTC_USD at $49,000 and then 1 open bid for BTC_USD at limit of $50,000.
// Matching service should create 1 match (Incoming Bid consumes Resting Ask).
func TestMatchingScenarios_SingleMatch(t *testing.T) {
	svc, eng, _, mockSettlement, mockPublisher, mockStore := setupServiceTest()

	// 1. Setup: Place 1 Open Ask at $49,000
	askOrder := testutil.NewOrder("ask_49k", common.OrderSide_ORDER_SIDE_SELL, 49000, 1.0)
	eng.ProcessOrder(engine.NewOrderFromProto(askOrder), nil)

	// 2. Execute: Place 1 Bid at $50,000 (Crosses Ask -> Match)
	bidOrder := testutil.NewOrder("bid_50k", common.OrderSide_ORDER_SIDE_BUY, 50000, 1.0)

	// Expectations
	// Should create exactly 1 Match
	// With Outbox Pattern, we now enqueue instead of calling Commit directly.
	mockSettlement.AssertNotCalled(t, "Commit")
	mockStore.On("EnqueueMatches", mock.Anything, mock.MatchedBy(func(req *ledger.CommitRequest) bool {
		if len(req.Matches) != 1 {
			return false
		}
		match := req.Matches[0]
		// Maker (Ask) was 49k. Taker (Bid) is 50k. 
		// Execution Price is Maker Price (49k).
		return match.MakerOrderId == "ask_49k" && 
		       match.TakerOrderId == "bid_50k" && 
			   match.Price == "49000.00000000" && 
			   match.Quantity == "1.00000000"
	})).Return(nil)

	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.Anything).Return(nil)
	mockPublisher.On("PublishTrade", mock.Anything, mock.Anything).Return(nil)
	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	_, err := svc.PlaceOrder(context.Background(), bidOrder)
	assert.NoError(t, err)

	// Verify order book state: Both orders matched fully and are removed
	book := eng.GetOrderBook("BTC-USD")
	assert.Empty(t, book.Bids)
	assert.Empty(t, book.Asks)

	mockStore.AssertExpectations(t)
}

// Test 3: Multiple Matches
// Create 2 open ask for BTC_USD at $49,000 and then 1 open bid for BTC_USD at limit of $50,000.
// Matching service should create 2 matches (Bid consumes Ask1, then Bid consumes Ask2).
func TestMatchingScenarios_MultiMatch(t *testing.T) {
	svc, eng, _, mockSettlement, mockPublisher, mockStore := setupServiceTest()

	// 1. Setup: Place 2 Open Asks at $49,000 (0.5 BTC each)
	ask1 := testutil.NewOrder("ask1", common.OrderSide_ORDER_SIDE_SELL, 49000, 0.5)
	eng.ProcessOrder(engine.NewOrderFromProto(ask1), nil)
	
	ask2 := testutil.NewOrder("ask2", common.OrderSide_ORDER_SIDE_SELL, 49000, 0.5)
	eng.ProcessOrder(engine.NewOrderFromProto(ask2), nil)

	// 2. Execute: Place 1 Bid at $50,000 for 1.0 BTC (Matches both)
	bidOrder := testutil.NewOrder("bid_huge", common.OrderSide_ORDER_SIDE_BUY, 50000, 1.0)

	// Expectations
	// Should create 2 Matches
	mockSettlement.AssertNotCalled(t, "Commit")
	mockStore.On("EnqueueMatches", mock.Anything, mock.MatchedBy(func(req *ledger.CommitRequest) bool {
		if len(req.Matches) != 2 {
			return false
		}
		
		found1 := false
		found2 := false
		
		for _, m := range req.Matches {
			if m.MakerOrderId == "ask1" && m.TakerOrderId == "bid_huge" { found1 = true }
			if m.MakerOrderId == "ask2" && m.TakerOrderId == "bid_huge" { found2 = true }
		}
		
		return found1 && found2
	})).Return(nil)

	mockPublisher.On("PublishOrderBookEvent", mock.Anything, mock.Anything).Return(nil)
	// Expect 2 Trade Events to be published
	mockPublisher.On("PublishTrade", mock.Anything, mock.Anything).Return(nil).Twice()
	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	_, err := svc.PlaceOrder(context.Background(), bidOrder)
	assert.NoError(t, err)

	// Verify order book state: All orders matched fully and are removed
	book := eng.GetOrderBook("BTC-USD")
	assert.Empty(t, book.Bids)
	assert.Empty(t, book.Asks)

	mockStore.AssertExpectations(t)
}
