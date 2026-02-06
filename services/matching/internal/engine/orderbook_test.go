package engine

import (
	"testing"
	"time"

	common "github.com/open-exchange/matching_engine/proto/common"
	"github.com/stretchr/testify/assert"
)

func createOrder(id string, side common.OrderSide, orderType common.OrderType, price, qty float64) *Order {
	return &Order{
		ID:           id,
		Side:         side,
		Type:         orderType,
		Price:        price,
		Quantity:     qty,
		InstrumentID: "BTC-USD",
		Timestamp:    time.Now().UnixNano(),
	}
}

func TestLimitOrder_MatchBuy(t *testing.T) {
	ob := NewOrderBook("BTC-USD")

	// Setup: Add a sell order (Ask)
	askOrder := createOrder("ask1", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 10.0)
	ob.ProcessOrder(askOrder)

	// Action: Add a matching buy order
	buyOrder := createOrder("buy1", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 5.0)
	trades, _ := ob.ProcessOrder(buyOrder)

	// Assert
	assert.Len(t, trades, 1)
	assert.Equal(t, "ask1", trades[0].MakerOrderID)
	assert.Equal(t, "buy1", trades[0].TakerOrderID)
	assert.Equal(t, 100.0, trades[0].Price)
	assert.Equal(t, 5.0, trades[0].Quantity)

	// Check Order Book State
	assert.Len(t, ob.Asks, 1) // Partially filled ask remains
	assert.Equal(t, 5.0, ob.Asks[0].Remaining())
	assert.Len(t, ob.Bids, 0) // Buy order fully filled
}

func TestLimitOrder_MatchSell(t *testing.T) {
	ob := NewOrderBook("BTC-USD")

	// Setup: Add a buy order (Bid)
	bidOrder := createOrder("bid1", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 10.0)
	ob.ProcessOrder(bidOrder)

	// Action: Add a matching sell order
	sellOrder := createOrder("sell1", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 5.0)
	trades, _ := ob.ProcessOrder(sellOrder)

	// Assert
	assert.Len(t, trades, 1)
	assert.Equal(t, "bid1", trades[0].MakerOrderID)
	assert.Equal(t, "sell1", trades[0].TakerOrderID)
	assert.Equal(t, 100.0, trades[0].Price)
	assert.Equal(t, 5.0, trades[0].Quantity)

	// Check Order Book State
	assert.Len(t, ob.Bids, 1) // Partially filled bid remains
	assert.Equal(t, 5.0, ob.Bids[0].Remaining())
	assert.Len(t, ob.Asks, 0) // Sell order fully filled
}

func TestLimitOrder_NoMatch_AddToBook(t *testing.T) {
	ob := NewOrderBook("BTC-USD")

	// Action: Add a buy order (Bid)
	bidOrder := createOrder("bid1", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 99.0, 10.0)
	trades, _ := ob.ProcessOrder(bidOrder)

	// Assert
	assert.Empty(t, trades)
	assert.Len(t, ob.Bids, 1)
	assert.Equal(t, "bid1", ob.Bids[0].ID)

	// Action: Add a sell order (Ask) higher than bid
	askOrder := createOrder("ask1", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 101.0, 10.0)
	trades2, _ := ob.ProcessOrder(askOrder)

	// Assert
	assert.Empty(t, trades2)
	assert.Len(t, ob.Asks, 1)
	assert.Equal(t, "ask1", ob.Asks[0].ID)
}

func TestOrderBook_Sorting(t *testing.T) {
	ob := NewOrderBook("BTC-USD")

	// Add Bids: 100, 102, 101
	ob.ProcessOrder(createOrder("bid1", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 10.0))
	ob.ProcessOrder(createOrder("bid2", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 102.0, 10.0))
	ob.ProcessOrder(createOrder("bid3", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 101.0, 10.0))

	// Expected Bids Order: 102, 101, 100 (DESC)
	assert.Len(t, ob.Bids, 3)
	assert.Equal(t, 102.0, ob.Bids[0].Price)
	assert.Equal(t, 101.0, ob.Bids[1].Price)
	assert.Equal(t, 100.0, ob.Bids[2].Price)

	// Add Asks: 105, 103, 104
	ob.ProcessOrder(createOrder("ask1", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 105.0, 10.0))
	ob.ProcessOrder(createOrder("ask2", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 103.0, 10.0))
	ob.ProcessOrder(createOrder("ask3", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 104.0, 10.0))

	// Expected Asks Order: 103, 104, 105 (ASC)
	assert.Len(t, ob.Asks, 3)
	assert.Equal(t, 103.0, ob.Asks[0].Price)
	assert.Equal(t, 104.0, ob.Asks[1].Price)
	assert.Equal(t, 105.0, ob.Asks[2].Price)
}

func TestMarketOrder_Match(t *testing.T) {
	ob := NewOrderBook("BTC-USD")

	// Setup: Add asks at different prices
	ob.ProcessOrder(createOrder("ask1", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 5.0))
	ob.ProcessOrder(createOrder("ask2", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 101.0, 5.0))

	// Action: Market Buy for 8.0 units
	marketBuy := createOrder("buy1", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_MARKET, 0, 8.0)
	trades, _ := ob.ProcessOrder(marketBuy)

	// Assert
	assert.Len(t, trades, 2)
	
	// First trade: matches ask1 (cheapest)
	assert.Equal(t, "ask1", trades[0].MakerOrderID)
	assert.Equal(t, 100.0, trades[0].Price)
	assert.Equal(t, 5.0, trades[0].Quantity)
	
	// Second trade: matches ask2 (next cheapest)
	assert.Equal(t, "ask2", trades[1].MakerOrderID)
	assert.Equal(t, 101.0, trades[1].Price)
	assert.Equal(t, 3.0, trades[1].Quantity) // Remaining 3.0

	// Check book
	assert.Len(t, ob.Asks, 1)
	assert.Equal(t, "ask2", ob.Asks[0].ID)
	assert.Equal(t, 2.0, ob.Asks[0].Remaining()) // 5.0 - 3.0 = 2.0
}
