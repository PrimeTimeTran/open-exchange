package engine

import (
	"testing"
	"time"

	common "github.com/open-exchange/matching_engine/proto/common"
	"github.com/stretchr/testify/assert"
)

func createOrder(id string, side common.OrderSide, orderType common.OrderType, price, qty float64, instrumentID, accountID string) *Order {
	return &Order{
		ID:           id,
		Side:         side,
		Type:         orderType,
		Price:        price,
		Quantity:     qty,
		InstrumentID: instrumentID,
		Timestamp:    time.Now().UnixNano(),
		AccountID:    accountID,
	}
}

func TestLimitOrder_MatchBuy(t *testing.T) {
	ob := NewOrderBook("BTC-USD")

	// Setup: Add a sell order (Ask)
	askOrder := createOrder("ask1", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 10.0, "BTC-USD", "user_ask1")
	ob.ProcessOrder(askOrder, nil)

	// Action: Add a matching buy order
	buyOrder := createOrder("buy1", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 5.0, "BTC-USD", "user_buy1")
	trades, _, _ := ob.ProcessOrder(buyOrder, nil)

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
	bidOrder := createOrder("bid1", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 10.0, "BTC-USD", "user_bid1")
	ob.ProcessOrder(bidOrder, nil)

	// Action: Add a matching sell order
	sellOrder := createOrder("sell1", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 5.0, "BTC-USD", "user_sell1")
	trades, _, _ := ob.ProcessOrder(sellOrder, nil)

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
	bidOrder := createOrder("bid1", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 99.0, 10.0, "BTC-USD", "user_bid1")
	trades, _, _ := ob.ProcessOrder(bidOrder, nil)

	// Assert
	assert.Empty(t, trades)
	assert.Len(t, ob.Bids, 1)
	assert.Equal(t, "bid1", ob.Bids[0].ID)

	// Action: Add a sell order (Ask) higher than bid
	askOrder := createOrder("ask1", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 101.0, 10.0, "BTC-USD", "user_ask1")
	trades2, _, _ := ob.ProcessOrder(askOrder, nil)

	// Assert
	assert.Empty(t, trades2)
	assert.Len(t, ob.Asks, 1)
	assert.Equal(t, "ask1", ob.Asks[0].ID)
}

func TestOrderBook_CancelOrder(t *testing.T) {
	ob := NewOrderBook("BTC-USD")

	// Add Order
	order := createOrder("bid1", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 10.0, "BTC-USD", "user_bid1")
	ob.ProcessOrder(order, nil)

	// Assert it's there
	assert.Len(t, ob.Bids, 1)

	// Cancel it
	cancelled := ob.CancelOrder("bid1")
	assert.NotNil(t, cancelled)
	assert.Equal(t, "bid1", cancelled.ID)
	assert.Len(t, ob.Bids, 0)

	// Cancel non-existent
	cancelled2 := ob.CancelOrder("bid1")
	assert.Nil(t, cancelled2)
}

func TestOrderBook_Sorting(t *testing.T) {
	ob := NewOrderBook("BTC-USD")

	// Add Bids: 100, 102, 101
	ob.ProcessOrder(createOrder("bid1", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 10.0, "BTC-USD", "user_bid1"), nil)
	ob.ProcessOrder(createOrder("bid2", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 102.0, 10.0, "BTC-USD", "user_bid2"), nil)
	ob.ProcessOrder(createOrder("bid3", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_LIMIT, 101.0, 10.0, "BTC-USD", "user_bid3"), nil)

	// Expected Bids Order: 102, 101, 100 (DESC)
	assert.Len(t, ob.Bids, 3)
	assert.Equal(t, 102.0, ob.Bids[0].Price)
	assert.Equal(t, 101.0, ob.Bids[1].Price)
	assert.Equal(t, 100.0, ob.Bids[2].Price)

	// Add Asks: 105, 103, 104
	ob.ProcessOrder(createOrder("ask1", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 105.0, 10.0, "BTC-USD", "user_ask1"), nil)
	ob.ProcessOrder(createOrder("ask2", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 103.0, 10.0, "BTC-USD", "user_ask2"), nil)
	ob.ProcessOrder(createOrder("ask3", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 104.0, 10.0, "BTC-USD", "user_ask3"), nil)

	// Expected Asks Order: 103, 104, 105 (ASC)
	assert.Len(t, ob.Asks, 3)
	assert.Equal(t, 103.0, ob.Asks[0].Price)
	assert.Equal(t, 104.0, ob.Asks[1].Price)
	assert.Equal(t, 105.0, ob.Asks[2].Price)
}

func TestMarketOrder_Match(t *testing.T) {
	ob := NewOrderBook("BTC-USD")

	// Setup: Add asks at different prices
	ob.ProcessOrder(createOrder("ask1", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 100.0, 5.0, "BTC-USD", "user_ask1"), nil)
	ob.ProcessOrder(createOrder("ask2", common.OrderSide_ORDER_SIDE_SELL, common.OrderType_ORDER_TYPE_LIMIT, 101.0, 5.0, "BTC-USD", "user_ask2"), nil)

	// Action: Market Buy for 8.0 units
	marketBuy := createOrder("buy1", common.OrderSide_ORDER_SIDE_BUY, common.OrderType_ORDER_TYPE_MARKET, 0, 8.0, "BTC-USD", "user_buy1")
	trades, _, _ := ob.ProcessOrder(marketBuy, nil)

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
