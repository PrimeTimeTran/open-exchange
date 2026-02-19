package engine

import (
	"testing"

	common "github.com/open-exchange/matching_engine/proto/common"
	"github.com/stretchr/testify/assert"
)

func TestOrderBook_ProcessOrder_Limit_Match_SamePrice_MultipleOrders(t *testing.T) {
	// Verifies that multiple orders at the same price level are matched in FIFO order.
	eng := NewEngine()
	instrumentID := "BTC-USD"

	// 1. Setup: 3 Sell Orders at Price 100.0
	// Order 1: 10 units
	sell1 := createOrder("sell_1", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 10.0, instrumentID, "user1")
	eng.ProcessOrder(sell1, nil)

	// Order 2: 5 units
	sell2 := createOrder("sell_2", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 5.0, instrumentID, "user2")
	eng.ProcessOrder(sell2, nil)

	// Order 3: 20 units
	sell3 := createOrder("sell_3", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 20.0, instrumentID, "user3")
	eng.ProcessOrder(sell3, nil)

	// Verify initial state
	eng.mu.RLock()
	book := eng.OrderBooks[instrumentID]
	eng.mu.RUnlock()
	
	asks := book.Asks()
	assert.Len(t, asks, 3)
	assert.Equal(t, "sell_1", asks[0].ID)
	assert.Equal(t, "sell_2", asks[1].ID)
	assert.Equal(t, "sell_3", asks[2].ID)

	// 2. Action: Buy Order consumes 25 units (10 + 5 + 10)
	buy := createOrder("buy_big", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 25.0, instrumentID, "user_buy")
	
	trades, _, err := eng.ProcessOrder(buy, nil)
	assert.NoError(t, err)

	// 3. Assert Trades
	assert.Len(t, trades, 3)

	// Trade 1: Matches sell_1 (10 units)
	assert.Equal(t, "sell_1", trades[0].MakerOrderID)
	assert.Equal(t, 10.0, trades[0].Quantity)

	// Trade 2: Matches sell_2 (5 units)
	assert.Equal(t, "sell_2", trades[1].MakerOrderID)
	assert.Equal(t, 5.0, trades[1].Quantity)

	// Trade 3: Matches sell_3 (10 units partial)
	assert.Equal(t, "sell_3", trades[2].MakerOrderID)
	assert.Equal(t, 10.0, trades[2].Quantity)

	// 4. Verify Book State
	asksAfter := book.Asks()
	assert.Len(t, asksAfter, 1)
	
	// Only sell_3 remains with 10 units (20 original - 10 matched)
	remaining := asksAfter[0]
	assert.Equal(t, "sell_3", remaining.ID)
	assert.Equal(t, 10.0, remaining.Remaining())
}

func TestOrderBook_ProcessOrder_Limit_Match_MultiplePrices_MultipleOrders(t *testing.T) {
	// Verifies walking through multiple price levels, with multiple orders at each level.
	eng := NewEngine()
	instrumentID := "ETH-USD"

	// 1. Setup
	// Price 99: Sell A (10)
	sellA := createOrder("sell_A", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 99.0, 10.0, instrumentID, "userA")
	eng.ProcessOrder(sellA, nil)

	// Price 100: Sell B (10), Sell C (10)
	sellB := createOrder("sell_B", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 10.0, instrumentID, "userB")
	eng.ProcessOrder(sellB, nil)
	
	sellC := createOrder("sell_C", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 10.0, instrumentID, "userC")
	eng.ProcessOrder(sellC, nil)

	// Price 101: Sell D (10)
	sellD := createOrder("sell_D", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 101.0, 10.0, instrumentID, "userD")
	eng.ProcessOrder(sellD, nil)

	// 2. Action: Buy 25 units at Limit 100.0
	// Should clear 99 (10), then 100 (10 + 5 from C)
	buy := createOrder("buy_multi", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 25.0, instrumentID, "userBuy")
	
	trades, _, err := eng.ProcessOrder(buy, nil)
	assert.NoError(t, err)

	// 3. Assert Trades
	assert.Len(t, trades, 3)

	// Trade 1: Best Price 99 (sell_A)
	assert.Equal(t, "sell_A", trades[0].MakerOrderID)
	assert.Equal(t, 99.0, trades[0].Price)
	assert.Equal(t, 10.0, trades[0].Quantity)

	// Trade 2: Next Best Price 100, First Order (sell_B)
	assert.Equal(t, "sell_B", trades[1].MakerOrderID)
	assert.Equal(t, 100.0, trades[1].Price)
	assert.Equal(t, 10.0, trades[1].Quantity)

	// Trade 3: Next Best Price 100, Second Order (sell_C), Partial Fill
	assert.Equal(t, "sell_C", trades[2].MakerOrderID)
	assert.Equal(t, 100.0, trades[2].Price)
	assert.Equal(t, 5.0, trades[2].Quantity)

	// 4. Verify Book State
	eng.mu.RLock()
	book := eng.OrderBooks[instrumentID]
	eng.mu.RUnlock()

	asks := book.Asks()
	assert.Len(t, asks, 2)

	// Remaining sell_C (5 units)
	assert.Equal(t, "sell_C", asks[0].ID)
	assert.Equal(t, 5.0, asks[0].Remaining())
	assert.Equal(t, 100.0, asks[0].Price)

	// Untouched sell_D (10 units)
	assert.Equal(t, "sell_D", asks[1].ID)
	assert.Equal(t, 10.0, asks[1].Remaining())
	assert.Equal(t, 101.0, asks[1].Price)
}
