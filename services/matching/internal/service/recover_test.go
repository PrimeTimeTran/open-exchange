package service

import (
	"context"
	"os"
	"testing"

	common "github.com/open-exchange/matching_engine/proto/common"
	ledger "github.com/open-exchange/matching_engine/proto/ledger"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// TestRecoverState_LedgerOnly ensures that when RecoverState is called,
// it fetches orders from the Ledger and repopulates the engine,
// ignoring any Redis state if we force it or if Redis is empty.
//
// In the new architecture, we want to verify:
// 1. It calls LedgerClient.GetOpenOrders
// 2. It populates the Engine correctly
// 3. It respects the order of orders returned by Ledger (which we will assume is correct for now, but the test proves the hand-off).
func TestRecoverState_LedgerSourceOfTruth(t *testing.T) {
	// Setup
	svc, eng, mockLedger, _, _, mockStore := setupServiceTest(true)

	// Mock Data
	orders := []*common.Order{
		{
			Id:           "order_A",
			InstrumentId: "BTC-USD",
			Side:         common.OrderSide_ORDER_SIDE_BUY,
			Type:         common.OrderType_ORDER_TYPE_LIMIT,
			Price:        "50000.00",
			Quantity:     "1.00",
			CreatedAt:    1000,
			TenantId:     "tenant_1",
		},
		{
			Id:           "order_B",
			InstrumentId: "BTC-USD",
			Side:         common.OrderSide_ORDER_SIDE_BUY,
			Type:         common.OrderType_ORDER_TYPE_LIMIT,
			Price:        "50000.00",
			Quantity:     "1.00",
			CreatedAt:    1001, // Created later
			TenantId:     "tenant_1",
		},
	}

	// 1. Mock Store: Simulate "Redis Empty" or "Force Rebuild"
	// To be safe, we'll set the environment variable to force ledger rebuild in the test,
	// or we can mock ListOrderBooks to return empty.
	// Let's rely on the code logic: If ListOrderBooks returns empty, it goes to Ledger.
	mockStore.On("ListOrderBooks", mock.Anything).Return([]string{}, nil)

	// 2. Mock Ledger: Return orders
	mockLedger.On("GetOpenOrders", mock.Anything, mock.MatchedBy(func(req *ledger.GetOpenOrdersRequest) bool {
		return req.InstrumentId == "" // Should fetch all
	}), mock.Anything).Return(&ledger.GetOpenOrdersResponse{Orders: orders}, nil)

	// 3. Mock Store: SaveOrderBook (called at the end of recovery)
	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	// Execute
	err := svc.RecoverState(context.Background())

	// Assert
	assert.NoError(t, err)

	// Check Engine State
	ob := eng.GetOrderBook("BTC-USD")
	bids := ob.Bids()
	assert.Len(t, bids, 2)

	// Verify Order (FIFO)
	// Since both are at 50,000, Order A (created first) should be at the head of the queue.
	// The engine implementation of "append" adds to the tail.
	// So if we processed A then B, A should be first.
	assert.Equal(t, "order_A", bids[0].ID)
	assert.Equal(t, "order_B", bids[1].ID)

	mockLedger.AssertExpectations(t)
	mockStore.AssertExpectations(t)
}

// TestRecoverState_GhostMatch_prevention verifies that if we rebuild from Ledger,
// we don't accidentally "re-match" orders that might have been partially filled in a way
// that contradicts the Ledger's truth, OR (more importantly) that we DO match them if the Ledger says they are open.
//
// In this specific test case, we simulate a "Ghost Match" scenario where the Ledger returns two crossing orders
// (which shouldn't happen in a healthy state, but if it does, the engine SHOULD resolve it).
func TestRecoverState_ResolvesCrossingOrders(t *testing.T) {
	// Don't start worker to avoid dequeuing the matches we just enqueued and messing up mock counts
	svc, _, mockLedger, _, _, mockStore := setupServiceTest(false)

	// Scenario: Ledger returns a Buy @ 50k and a Sell @ 49k.
	// This implies a crash happened *before* these could match, or a race condition.
	// The Engine MUST match them immediately upon recovery to fix the state.
	orders := []*common.Order{
		{
			Id:           "buy_high",
			InstrumentId: "BTC-USD",
			Side:         common.OrderSide_ORDER_SIDE_BUY,
			Price:        "50000.00",
			Quantity:     "1.0",
			CreatedAt:    1000,
			AccountId:    "user_1",
		},
		{
			Id:           "sell_low",
			InstrumentId: "BTC-USD",
			Side:         common.OrderSide_ORDER_SIDE_SELL,
			Price:        "49000.00",
			Quantity:     "1.0",
			CreatedAt:    1001,
			AccountId:    "user_2",
		},
	}

	mockStore.On("ListOrderBooks", mock.Anything).Return([]string{}, nil)

	mockLedger.On("GetOpenOrders", mock.Anything, mock.Anything, mock.Anything).Return(&ledger.GetOpenOrdersResponse{Orders: orders}, nil)

	// Expect EnqueueMatches to be called because the engine will find a trade!
	mockStore.On("EnqueueMatches", mock.Anything, mock.MatchedBy(func(req *ledger.CommitRequest) bool {
		return len(req.Matches) == 1 &&
			req.Matches[0].MakerOrderId == "buy_high" &&
			req.Matches[0].TakerOrderId == "sell_low"
	})).Return(nil)

	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	err := svc.RecoverState(context.Background())
	assert.NoError(t, err)

	mockStore.AssertExpectations(t)
}

// TestRecoverState_ForceLedger verifies the env var override works
func TestRecoverState_ForceLedger(t *testing.T) {
	// Set Env
	os.Setenv("FORCE_REBUILD_FROM_LEDGER", "true")
	defer os.Unsetenv("FORCE_REBUILD_FROM_LEDGER")

	svc, _, mockLedger, _, _, mockStore := setupServiceTest(true)

	// Even if Redis has keys (mocking ListOrderBooks to return something),
	// we should IGNORE them and go to Ledger.
	// Note: In current implementation, if forceRebuild is true, it skips ListOrderBooks entirely.
	// So we don't even need to mock ListOrderBooks if the logic is correct.
	// But just in case, let's not mock it to prove it's NOT called.
	
	mockLedger.On("GetOpenOrders", mock.Anything, mock.Anything, mock.Anything).Return(&ledger.GetOpenOrdersResponse{Orders: []*common.Order{}}, nil)
	mockStore.On("SaveOrderBook", mock.Anything, mock.Anything).Return(nil)

	err := svc.RecoverState(context.Background())
	assert.NoError(t, err)

	mockLedger.AssertExpectations(t)
	// Ensure ListOrderBooks was NOT called
	mockStore.AssertNotCalled(t, "ListOrderBooks")
}
