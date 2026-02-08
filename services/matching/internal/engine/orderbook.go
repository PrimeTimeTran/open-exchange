package engine

import (
	"log"
	"sync"

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
func (ob *OrderBook) ProcessOrder(order *Order, onMatch func(Trade) error) ([]Trade, []events.OrderBookEvent, error) {
	ob.mu.Lock()
	defer ob.mu.Unlock()

	trades := []Trade{}
	bookEvents := []events.OrderBookEvent{}
	var err error

	if order.Type == common.OrderType_ORDER_TYPE_MARKET {
		// Market Order
		if order.Side == common.OrderSide_ORDER_SIDE_BUY {
			trades, bookEvents, err = ob.matchMarketBuy(order, onMatch)
		} else {
			trades, bookEvents, err = ob.matchMarketSell(order, onMatch)
		}
	} else {
		// Limit Order
		if order.Side == common.OrderSide_ORDER_SIDE_BUY {
			trades, bookEvents, err = ob.matchLimitBuy(order, onMatch)
		} else {
			trades, bookEvents, err = ob.matchLimitSell(order, onMatch)
		}
	}

	return trades, bookEvents, err
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

// GetSnapshot returns a thread-safe copy of the order book state
func (ob *OrderBook) GetSnapshot() ([]*Order, []*Order) {
	ob.mu.Lock()
	defer ob.mu.Unlock()
	
	// Copy slices to avoid race conditions if caller modifies them
	bidsCopy := make([]*Order, len(ob.Bids))
	copy(bidsCopy, ob.Bids)
	
	asksCopy := make([]*Order, len(ob.Asks))
	copy(asksCopy, ob.Asks)
	
	return bidsCopy, asksCopy
}

