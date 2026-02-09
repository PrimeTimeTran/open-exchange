package engine

import (
	"testing"
	"time"

	"github.com/open-exchange/matching_engine/internal/events"
	common "github.com/open-exchange/matching_engine/proto/common"
	"github.com/stretchr/testify/assert"
)

// Helper to create an order with AccountID (since the one in orderbook_test.go is not exported or we want to be explicit)
func createOrderWithAccount(id string, side common.OrderSide, orderType common.OrderType, price, qty float64, accountID string) *Order {
	return &Order{
		ID:           id,
		Side:         side,
		Type:         orderType,
		Price:        price,
		Quantity:     qty,
		InstrumentID: "BTC-USD",
		AccountID:    accountID,
		Timestamp:    time.Now().UnixNano(),
	}
}

func TestSelfTradePrevention_LimitBuy(t *testing.T) {
	ob := NewOrderBook("BTC-USD")

	// 1. Setup: User A places a Sell Order (Ask) at 100.0
	askOrder := createOrderWithAccount("ask1", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 10.0, "userA")
	trades, events1, _ := ob.ProcessOrder(askOrder, nil)
	assert.Empty(t, trades)
	assert.Len(t, ob.Asks, 1)
	assert.Equal(t, events.OrderCreated, events1[0].Type)

	// 2. Setup: User B places a Sell Order (Ask) at 101.0 (Worse price)
	askOrderB := createOrderWithAccount("ask2", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 101.0, 10.0, "userB")
	ob.ProcessOrder(askOrderB, nil)
	assert.Len(t, ob.Asks, 2)

	// 3. Action: User A places a Buy Order (Bid) at 101.0
	// This should normally match ask1 (100.0) then ask2 (101.0).
	// BUT because ask1 is also User A, it should cancel ask1 and match ask2.
	buyOrder := createOrderWithAccount("buy1", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 101.0, 5.0, "userA")
	trades2, events2, _ := ob.ProcessOrder(buyOrder, nil)

	// Assertions

	// Should match ask2 (User B) because ask1 (User A) should have been cancelled by STP.
	// Wait, let's trace the logic.
	// matchLimitBuy loop:
	// 1. Checks best Ask (ask1 @ 100.0).
	// 2. ask1.AccountID == buyOrder.AccountID ("userA" == "userA") -> STP triggered.
	// 3. ask1 is removed from Asks. CANCELLED event emitted.
	// 4. Loop continues.
	// 5. Next Ask is ask2 @ 101.0.
	// 6. ask2.AccountID != buyOrder.AccountID ("userB" != "userA").
	// 7. Matches! Trade generated.

	// Check Trades
	assert.Len(t, trades2, 1)
	assert.Equal(t, "ask2", trades2[0].MakerOrderID)
	assert.Equal(t, "buy1", trades2[0].TakerOrderID)
	assert.Equal(t, 101.0, trades2[0].Price)
	assert.Equal(t, 5.0, trades2[0].Quantity)

	// Check Events
	// Expect:
	// 1. OrderCancelled (ask1)
	// 2. OrderUpdated (ask2 - partial fill) OR OrderFilled (if buy matched full ask2)
	// In this case, buy=5, ask2=10. So ask2 is partially filled.

	// Check for Cancellation Event
	foundCancel := false
	for _, e := range events2 {
		if e.Type == events.OrderCancelled && e.OrderID == "ask1" {
			foundCancel = true
			break
		}
	}
	assert.True(t, foundCancel, "Should have emitted OrderCancelled for ask1")

	// Check Order Book State
	// ask1 should be gone.
	// ask2 should be there with remaining qty 5.0.
	assert.Len(t, ob.Asks, 1)
	assert.Equal(t, "ask2", ob.Asks[0].ID)
	assert.Equal(t, 5.0, ob.Asks[0].Remaining())
}

func TestSelfTradePrevention_LimitSell(t *testing.T) {
	ob := NewOrderBook("BTC-USD")

	// 1. Setup: User A places a Buy Order (Bid) at 100.0
	bidOrder := createOrderWithAccount("bid1", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 10.0, "userA")
	ob.ProcessOrder(bidOrder, nil)

	// 2. Action: User A places a Sell Order (Ask) at 100.0
	// Should trigger STP on bid1.
	sellOrder := createOrderWithAccount("sell1", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 5.0, "userA")
	trades, events2, _ := ob.ProcessOrder(sellOrder, nil)

	// Assertions
	assert.Empty(t, trades) // No trades, because bid1 was cancelled and there are no other bids.

	// Check Events for Cancel
	foundCancel := false
	for _, e := range events2 {
		if e.Type == events.OrderCancelled && e.OrderID == "bid1" {
			foundCancel = true
			break
		}
	}
	assert.True(t, foundCancel, "Should have emitted OrderCancelled for bid1")

	// Check Order Book
	// bid1 should be removed.
	// sell1 should be added as a resting Ask (since it didn't match anything after bid1 was removed).
	assert.Empty(t, ob.Bids)
	assert.Len(t, ob.Asks, 1)
	assert.Equal(t, "sell1", ob.Asks[0].ID)
}
