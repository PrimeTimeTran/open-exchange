package engine

import (
	"log"
	"sort"
	"sync"
	"time"

	"github.com/open-exchange/matching_engine/internal/events"
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
	mu           sync.Mutex
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
func (ob *OrderBook) ProcessOrder(order *Order) ([]Trade, []events.OrderBookEvent, error) {
	ob.mu.Lock()
	defer ob.mu.Unlock()

	trades := []Trade{}
	bookEvents := []events.OrderBookEvent{}

	if order.Type == common.OrderType_ORDER_TYPE_MARKET {
		// Market Order
		if order.Side == common.OrderSide_ORDER_SIDE_BUY {
			trades, bookEvents = ob.matchMarketBuy(order)
		} else {
			trades, bookEvents = ob.matchMarketSell(order)
		}
	} else {
		// Limit Order
		if order.Side == common.OrderSide_ORDER_SIDE_BUY {
			trades, bookEvents = ob.matchLimitBuy(order)
		} else {
			trades, bookEvents = ob.matchLimitSell(order)
		}
	}

	return trades, bookEvents, nil
}

// CancelOrder removes an order from the order book by its ID.
// Returns the cancelled order if found, otherwise nil.
func (ob *OrderBook) CancelOrder(orderID string) *Order {
	ob.mu.Lock()
	defer ob.mu.Unlock()

	// Check Bids
	for i, order := range ob.Bids {
		if order.ID == orderID {
			ob.Bids = remove(ob.Bids, i)
			log.Printf("Cancelled Bid: %s", orderID)
			return order
		}
	}

	// Check Asks
	for i, order := range ob.Asks {
		if order.ID == orderID {
			ob.Asks = remove(ob.Asks, i)
			log.Printf("Cancelled Ask: %s", orderID)
			return order
		}
	}

	return nil
}

func (ob *OrderBook) matchLimitBuy(order *Order) ([]Trade, []events.OrderBookEvent) {
	trades := []Trade{}
	bookEvents := []events.OrderBookEvent{}

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
			bookEvents = append(bookEvents, events.OrderBookEvent{
				Type:         events.OrderFilled,
				OrderID:      bestAsk.ID,
				InstrumentID: ob.InstrumentID,
				Price:        bestAsk.Price,
				Quantity:     0,
				Side:         "SELL",
				Timestamp:    time.Now().Unix(),
			})
		} else {
			bookEvents = append(bookEvents, events.OrderBookEvent{
				Type:         events.OrderUpdated,
				OrderID:      bestAsk.ID,
				InstrumentID: ob.InstrumentID,
				Price:        bestAsk.Price,
				Quantity:     bestAsk.Remaining(),
				Side:         "SELL",
				Timestamp:    time.Now().Unix(),
			})
		}
	}

	// If not filled, add to Bids
	if !order.Filled() {
		ob.addBid(order)
		bookEvents = append(bookEvents, events.OrderBookEvent{
			Type:         events.OrderCreated,
			OrderID:      order.ID,
			InstrumentID: ob.InstrumentID,
			Price:        order.Price,
			Quantity:     order.Remaining(),
			Side:         "BUY",
			Timestamp:    time.Now().Unix(),
		})
	}

	return trades, bookEvents
}

func (ob *OrderBook) matchLimitSell(order *Order) ([]Trade, []events.OrderBookEvent) {
	trades := []Trade{}
	bookEvents := []events.OrderBookEvent{}

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
			bookEvents = append(bookEvents, events.OrderBookEvent{
				Type:         events.OrderFilled,
				OrderID:      bestBid.ID,
				InstrumentID: ob.InstrumentID,
				Price:        bestBid.Price,
				Quantity:     0,
				Side:         "BUY",
				Timestamp:    time.Now().Unix(),
			})
		} else {
			bookEvents = append(bookEvents, events.OrderBookEvent{
				Type:         events.OrderUpdated,
				OrderID:      bestBid.ID,
				InstrumentID: ob.InstrumentID,
				Price:        bestBid.Price,
				Quantity:     bestBid.Remaining(),
				Side:         "BUY",
				Timestamp:    time.Now().Unix(),
			})
		}
	}

	// If not filled, add to Asks
	if !order.Filled() {
		ob.addAsk(order)
		bookEvents = append(bookEvents, events.OrderBookEvent{
			Type:         events.OrderCreated,
			OrderID:      order.ID,
			InstrumentID: ob.InstrumentID,
			Price:        order.Price,
			Quantity:     order.Remaining(),
			Side:         "SELL",
			Timestamp:    time.Now().Unix(),
		})
	}

	return trades, bookEvents
}

func (ob *OrderBook) matchMarketBuy(order *Order) ([]Trade, []events.OrderBookEvent) {
	trades := []Trade{}
	bookEvents := []events.OrderBookEvent{}
	
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
			bookEvents = append(bookEvents, events.OrderBookEvent{
				Type:         events.OrderFilled,
				OrderID:      bestAsk.ID,
				InstrumentID: ob.InstrumentID,
				Price:        bestAsk.Price,
				Quantity:     0,
				Side:         "SELL",
				Timestamp:    time.Now().Unix(),
			})
		} else {
			bookEvents = append(bookEvents, events.OrderBookEvent{
				Type:         events.OrderUpdated,
				OrderID:      bestAsk.ID,
				InstrumentID: ob.InstrumentID,
				Price:        bestAsk.Price,
				Quantity:     bestAsk.Remaining(),
				Side:         "SELL",
				Timestamp:    time.Now().Unix(),
			})
		}
	}
	
	return trades, bookEvents
}

func (ob *OrderBook) matchMarketSell(order *Order) ([]Trade, []events.OrderBookEvent) {
	trades := []Trade{}
	bookEvents := []events.OrderBookEvent{}
	
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
			bookEvents = append(bookEvents, events.OrderBookEvent{
				Type:         events.OrderFilled,
				OrderID:      bestBid.ID,
				InstrumentID: ob.InstrumentID,
				Price:        bestBid.Price,
				Quantity:     0,
				Side:         "BUY",
				Timestamp:    time.Now().Unix(),
			})
		} else {
			bookEvents = append(bookEvents, events.OrderBookEvent{
				Type:         events.OrderUpdated,
				OrderID:      bestBid.ID,
				InstrumentID: ob.InstrumentID,
				Price:        bestBid.Price,
				Quantity:     bestBid.Remaining(),
				Side:         "BUY",
				Timestamp:    time.Now().Unix(),
			})
		}
	}
	
	return trades, bookEvents
}

func (ob *OrderBook) addBid(order *Order) {
	// Insert into Bids (Sorted DESC by Price, then ASC by Timestamp)
	index := sort.Search(len(ob.Bids), func(i int) bool {
		if ob.Bids[i].Price < order.Price {
			return true
		}
		if ob.Bids[i].Price == order.Price {
			return ob.Bids[i].Timestamp > order.Timestamp
		}
		return false
	})
	
	// We want to find the first element where (Current < New).
	// Sorted: 100(t=100), 100(t=200), 99(t=150). Insert 100(t=150).
	// i=0: 100 < 100 (False). 100 == 100. 100(Cur) > 150(New)? False.
	// i=1: 100 < 100 (False). 100 == 100. 200(Cur) > 150(New)? True. -> Insert Here.
	// Result: 100(t=100), 100(t=150), 100(t=200), 99. Correct.
	
	ob.Bids = insert(ob.Bids, index, order)
	log.Printf("Added to Bids: %v @ %v", order.Quantity, order.Price)
}

func (ob *OrderBook) addAsk(order *Order) {
	// Insert into Asks (Sorted ASC by Price, then ASC by Timestamp)
	index := sort.Search(len(ob.Asks), func(i int) bool {
		if ob.Asks[i].Price > order.Price {
			return true
		}
		if ob.Asks[i].Price == order.Price {
			return ob.Asks[i].Timestamp > order.Timestamp
		}
		return false
	})
	
	// If search didn't find strictly greater (or older), it returns length.
	// But sort.Search uses binary search which assumes sorted input.
	// Let's refine the logic to simply find insertion point for:
	// Price ASC, Timestamp ASC.
	
	// We want the first element where (Current > New).
	// Comparison:
	// If Current.Price > New.Price: True (Insert Here)
	// If Current.Price < New.Price: False (Keep Looking)
	// If Current.Price == New.Price:
	//    If Current.Time > New.Time: True (Insert Here, New is older/smaller time)
	//    If Current.Time < New.Time: False (Keep Looking, New is newer/larger time)
	
	// Wait, Timestamp: Older (smaller int) comes FIRST.
	// So we want sorted by Timestamp ASC.
	
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

func remove(slice []*Order, s int) []*Order {
	return append(slice[:s], slice[s+1:]...)
}

func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}
