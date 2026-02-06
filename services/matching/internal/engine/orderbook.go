package engine

import (
	"log"
	"sort"
	"time"

	common "github.com/open-exchange/matching_engine/proto/common"
)

type Trade struct {
	MakerOrderID string
	TakerOrderID string
	Price        float64
	Quantity     float64
	Timestamp    int64
}

type OrderBook struct {
	InstrumentID string
	Bids         []*Order // Sorted DESC by price, then ASC by time
	Asks         []*Order // Sorted ASC by price, then ASC by time
}

func NewOrderBook(instrumentID string) *OrderBook {
	return &OrderBook{
		InstrumentID: instrumentID,
		Bids:         make([]*Order, 0),
		Asks:         make([]*Order, 0),
	}
}

// ProcessOrder handles an incoming order: matches it against the book or adds it.
// Returns a list of generated trades and the updated order.
func (ob *OrderBook) ProcessOrder(order *Order) ([]Trade, error) {
	trades := []Trade{}

	if order.Type == common.OrderType_ORDER_TYPE_MARKET {
		// Market Order
		if order.Side == common.OrderSide_ORDER_SIDE_BUY {
			trades = ob.matchMarketBuy(order)
		} else {
			trades = ob.matchMarketSell(order)
		}
	} else {
		// Limit Order
		if order.Side == common.OrderSide_ORDER_SIDE_BUY {
			trades = ob.matchLimitBuy(order)
		} else {
			trades = ob.matchLimitSell(order)
		}
	}

	return trades, nil
}

func (ob *OrderBook) matchLimitBuy(order *Order) []Trade {
	trades := []Trade{}

	// Match against Asks (lowest sell price first)
	// While we have asks and the best ask is <= our limit price
	for len(ob.Asks) > 0 && ob.Asks[0].Price <= order.Price && !order.Filled() {
		bestAsk := ob.Asks[0]
		
		tradePrice := bestAsk.Price
		tradeQty := min(order.Remaining(), bestAsk.Remaining())
		
		trades = append(trades, Trade{
			MakerOrderID: bestAsk.ID,
			TakerOrderID: order.ID,
			Price:        tradePrice,
			Quantity:     tradeQty,
			Timestamp:    time.Now().Unix(),
		})
		
		order.QuantityFilled += tradeQty
		bestAsk.QuantityFilled += tradeQty
		
		if bestAsk.Filled() {
			ob.Asks = ob.Asks[1:]
		}
	}

	// If not filled, add to Bids
	if !order.Filled() {
		ob.addBid(order)
	}

	return trades
}

func (ob *OrderBook) matchLimitSell(order *Order) []Trade {
	trades := []Trade{}

	// Match against Bids (highest buy price first)
	// While we have bids and the best bid is >= our limit price
	for len(ob.Bids) > 0 && ob.Bids[0].Price >= order.Price && !order.Filled() {
		bestBid := ob.Bids[0]
		
		tradePrice := bestBid.Price
		tradeQty := min(order.Remaining(), bestBid.Remaining())
		
		trades = append(trades, Trade{
			MakerOrderID: bestBid.ID,
			TakerOrderID: order.ID,
			Price:        tradePrice,
			Quantity:     tradeQty,
			Timestamp:    time.Now().Unix(),
		})
		
		order.QuantityFilled += tradeQty
		bestBid.QuantityFilled += tradeQty
		
		if bestBid.Filled() {
			ob.Bids = ob.Bids[1:]
		}
	}

	// If not filled, add to Asks
	if !order.Filled() {
		ob.addAsk(order)
	}

	return trades
}

func (ob *OrderBook) matchMarketBuy(order *Order) []Trade {
	trades := []Trade{}
	
	// Match against Asks regardless of price (up to available liquidity)
	for len(ob.Asks) > 0 && !order.Filled() {
		bestAsk := ob.Asks[0]
		
		tradePrice := bestAsk.Price
		tradeQty := min(order.Remaining(), bestAsk.Remaining())
		
		trades = append(trades, Trade{
			MakerOrderID: bestAsk.ID,
			TakerOrderID: order.ID,
			Price:        tradePrice,
			Quantity:     tradeQty,
			Timestamp:    time.Now().Unix(),
		})
		
		order.QuantityFilled += tradeQty
		bestAsk.QuantityFilled += tradeQty
		
		if bestAsk.Filled() {
			ob.Asks = ob.Asks[1:]
		}
	}
	
	return trades
}

func (ob *OrderBook) matchMarketSell(order *Order) []Trade {
	trades := []Trade{}
	
	// Match against Bids regardless of price
	for len(ob.Bids) > 0 && !order.Filled() {
		bestBid := ob.Bids[0]
		
		tradePrice := bestBid.Price
		tradeQty := min(order.Remaining(), bestBid.Remaining())
		
		trades = append(trades, Trade{
			MakerOrderID: bestBid.ID,
			TakerOrderID: order.ID,
			Price:        tradePrice,
			Quantity:     tradeQty,
			Timestamp:    time.Now().Unix(),
		})
		
		order.QuantityFilled += tradeQty
		bestBid.QuantityFilled += tradeQty
		
		if bestBid.Filled() {
			ob.Bids = ob.Bids[1:]
		}
	}
	
	return trades
}

func (ob *OrderBook) addBid(order *Order) {
	// Insert into Bids (Sorted DESC by Price)
	index := sort.Search(len(ob.Bids), func(i int) bool {
		return ob.Bids[i].Price < order.Price // Condition for DESC sort with sort.Search is tricky, usually better to iterate or use custom compare
	})
	
	// sort.Search uses binary search to find the smallest index i where f(i) is true.
	// For DESC sort: 100, 99, 98. Insert 99.5.
	// We want to find the first element where Price < order.Price.
	// 100 < 99.5 (False). 99 < 99.5 (True). Index is 1. Correct.
	
	ob.Bids = insert(ob.Bids, index, order)
	log.Printf("Added to Bids: %v @ %v", order.Quantity, order.Price)
}

func (ob *OrderBook) addAsk(order *Order) {
	// Insert into Asks (Sorted ASC by Price)
	index := sort.Search(len(ob.Asks), func(i int) bool {
		return ob.Asks[i].Price >= order.Price
	})
	
	// For ASC sort: 98, 99, 100. Insert 99.5.
	// We want first element where Price >= order.Price.
	// 98 >= 99.5 (False). 99 >= 99.5 (False). 100 >= 99.5 (True). Index is 2. Correct.
	
	ob.Asks = insert(ob.Asks, index, order)
	log.Printf("Added to Asks: %v @ %v", order.Quantity, order.Price)
}

func insert(slice []*Order, index int, value *Order) []*Order {
	if len(slice) == index {
		return append(slice, value)
	}
	slice = append(slice[:index+1], slice[index:]...)
	slice[index] = value
	return slice
}

func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}
