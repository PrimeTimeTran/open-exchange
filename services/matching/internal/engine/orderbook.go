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
	Bids         []*Order
	Asks         []*Order
	mu           sync.Mutex
}

func NewOrderBook(instrumentID string) *OrderBook {
	return &OrderBook{
		InstrumentID: instrumentID,
		Bids:         make([]*Order, 0),
		Asks:         make([]*Order, 0),
	}
}

func (ob *OrderBook) ProcessOrder(order *Order, onMatch func(Trade) error) ([]Trade, []events.OrderBookEvent, error) {
	ob.mu.Lock()
	defer ob.mu.Unlock()

	trades := []Trade{}
	bookEvents := []events.OrderBookEvent{}
	var err error

	if order.Type == common.OrderType_ORDER_TYPE_MARKET {
		if order.Side == common.OrderSide_ORDER_SIDE_BUY {
			trades, bookEvents, err = ob.matchMarketBuy(order, onMatch)
		} else {
			trades, bookEvents, err = ob.matchMarketSell(order, onMatch)
		}
	} else {
		if order.Side == common.OrderSide_ORDER_SIDE_BUY {
			trades, bookEvents, err = ob.matchLimitBuy(order, onMatch)
		} else {
			trades, bookEvents, err = ob.matchLimitSell(order, onMatch)
		}
	}

	return trades, bookEvents, err
}

func (ob *OrderBook) CancelOrder(orderID string) *Order {
	ob.mu.Lock()
	defer ob.mu.Unlock()

	for i, order := range ob.Bids {
		if order.ID == orderID {
			ob.Bids = remove(ob.Bids, i)
			log.Printf("Cancelled Bid: %s", orderID)
			return order
		}
	}

	for i, order := range ob.Asks {
		if order.ID == orderID {
			ob.Asks = remove(ob.Asks, i)
			log.Printf("Cancelled Ask: %s", orderID)
			return order
		}
	}

	return nil
}

func (ob *OrderBook) GetSnapshot() ([]*Order, []*Order) {
	ob.mu.Lock()
	defer ob.mu.Unlock()
	
	bidsCopy := make([]*Order, len(ob.Bids))
	copy(bidsCopy, ob.Bids)
	
	asksCopy := make([]*Order, len(ob.Asks))
	copy(asksCopy, ob.Asks)
	
	return bidsCopy, asksCopy
}

