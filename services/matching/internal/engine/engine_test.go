package engine

import (
	"testing"

	common "github.com/open-exchange/matching_engine/proto/common"
	"github.com/stretchr/testify/assert"
)

func TestEngine_ProcessOrder_AddsToBook(t *testing.T) {
	eng := NewEngine()

	// 1. Create a BTC-USD order
	// createOrder is defined in orderbook_test.go which is in the same package
	order := createOrder("btc_order_1", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 50000.0, 1.5)
	order.InstrumentID = "BTC-USD"

	// 2. Process the order
	trades, _, err := eng.ProcessOrder(order)
	assert.NoError(t, err)
	assert.Empty(t, trades, "Expected no trades for the first order in the book")

	// 3. Verify the order was added to the correct book
	// Check that the book exists
	eng.mu.RLock()
	btcBook, exists := eng.OrderBooks["BTC-USD"]
	eng.mu.RUnlock()
	
	assert.True(t, exists, "Order book for BTC-USD should be created")
	assert.NotNil(t, btcBook)

	// Check that the order is in the book
	assert.Len(t, btcBook.Bids, 1)
	assert.Equal(t, "btc_order_1", btcBook.Bids[0].ID)
	assert.Equal(t, 1.5, btcBook.Bids[0].Quantity)
}

func TestEngine_ProcessOrder_MultipleInstrumentsIsolation(t *testing.T) {
	eng := NewEngine()

	// BTC Order
	btcOrder := createOrder("btc_1", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 60000.0, 2.0)
	btcOrder.InstrumentID = "BTC-USD"
	eng.ProcessOrder(btcOrder)

	// ETH Order
	ethOrder := createOrder("eth_1", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 3000.0, 10.0)
	ethOrder.InstrumentID = "ETH-USD"
	eng.ProcessOrder(ethOrder)

	// Verify BTC Book
	btcBook := eng.GetOrderBook("BTC-USD")
	assert.Len(t, btcBook.Asks, 1)
	assert.Equal(t, "btc_1", btcBook.Asks[0].ID)
	assert.Empty(t, btcBook.Bids)

	// Verify ETH Book
	ethBook := eng.GetOrderBook("ETH-USD")
	assert.Len(t, ethBook.Bids, 1)
	assert.Equal(t, "eth_1", ethBook.Bids[0].ID)
	assert.Empty(t, ethBook.Asks)
}
