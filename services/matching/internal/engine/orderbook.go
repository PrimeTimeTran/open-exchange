package engine

import (
	"log"
	"sort"
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

// priceLevel represents a single price point in the book. Orders at
// the same price are kept in FIFO order using a doubly-linked list so that
// cancellations can be removed in O(1).
type priceLevel struct {
	price int64
	head *orderNode
	tail *orderNode
	size int
}

// orderNode is a node in the linked list that lives inside a price level.
type orderNode struct {
	order *Order
	prev  *orderNode
	next  *orderNode
	lvl   *priceLevel // back-pointer to containing price level
}

func (pl *priceLevel) append(o *Order) *orderNode {
	node := &orderNode{order: o, lvl: pl}
	if pl.tail == nil {
		pl.head = node
		pl.tail = node
	} else {
		pl.tail.next = node
		node.prev = pl.tail
		pl.tail = node
	}
	pl.size++
	return node
}

func (pl *priceLevel) remove(node *orderNode) {
	if node.prev != nil {
		node.prev.next = node.next
	} else {
		pl.head = node.next
	}
	if node.next != nil {
		node.next.prev = node.prev
	} else {
		pl.tail = node.prev
	}
	pl.size--
}

// Price-Level FIFO Order Book
// OrderBook maintains the full state of the bids/asks for one instrument.
// Instead of two global slices we keep a map of price->priceLevel plus a
// sorted slice of price levels for quick best‑price lookup.  Additionally we
// track every order by ID so cancellation is efficient.
//
// Internally there are no exported Bids/Asks fields; callers should use the
// snapshot helpers when they need a flattened view (primarily tests).
//
// The previous implementation suffered O(N) insert/remove cost against a
// slice of all orders – this version pushes most of that to O(P) where P is
// number of distinct price levels (typically orders at the same price are
// far fewer than total orders).

// - O(1) cancellation
// - O(1) append at price
// - O(P) best-price search (P = distinct prices)
// - Proper institutional matching behavior

const tickPrecision = 100000000 // 8 decimal places

func priceToTicks(p float64) int64 {
	return int64(p * float64(tickPrecision))
}

func ticksToPrice(t int64) float64 {
	return float64(t) / float64(tickPrecision)
}

type OrderBook struct {
	InstrumentID string

	bids      map[int64]*priceLevel // price -> level (price descending)
	bidPrices []int64               // sorted descending

	asks      map[int64]*priceLevel // price -> level (price ascending)
	askPrices []int64               // sorted ascending

	// map of order ID to its node (for O(1) cancel)
	orderMap map[string]*orderNode

	mu sync.Mutex
}

func NewOrderBook(instrumentID string) *OrderBook {
	return &OrderBook{
		InstrumentID: instrumentID,

		bids:     make(map[int64]*priceLevel),
		bidPrices: make([]int64, 0),

		asks:     make(map[int64]*priceLevel),
		askPrices: make([]int64, 0),

		orderMap: make(map[string]*orderNode),
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

	node, ok := ob.orderMap[orderID]
	if !ok || node == nil {
		return nil
	}

	pl := node.lvl
	pl.remove(node)
	delete(ob.orderMap, orderID)

	// if price level empties out, drop it from the price list
	if pl.size == 0 {
		if node.order.Side == common.OrderSide_ORDER_SIDE_BUY {
			ob.removeBidPrice(pl.price)
			delete(ob.bids, pl.price)
		} else {
			ob.removeAskPrice(pl.price)
			delete(ob.asks, pl.price)
		}
	}

	log.Printf("Cancelled Order: %s", orderID)
	return node.order
}

// snapshotBids returns a flattened slice of all bids ordered by price/time.
func (ob *OrderBook) snapshotBids() []*Order {
	out := make([]*Order, 0)
	for _, price := range ob.bidPrices {
		pl := ob.bids[price]
		n := pl.head
		for n != nil {
			out = append(out, n.order)
			n = n.next
		}
	}
	return out
}

// snapshotAsks returns a flattened slice of all asks ordered by price/time.
func (ob *OrderBook) snapshotAsks() []*Order {
	out := make([]*Order, 0)
	for _, price := range ob.askPrices {
		pl := ob.asks[price]
		n := pl.head
		for n != nil {
			out = append(out, n.order)
			n = n.next
		}
	}
	return out
}

// Bids returns a copy of the current bid side of the book in price/time order.
func (ob *OrderBook) Bids() []*Order {
	ob.mu.Lock()
	defer ob.mu.Unlock()
	return ob.snapshotBids()
}

// Asks returns a copy of the current ask side of the book in price/time order.
func (ob *OrderBook) Asks() []*Order {
	ob.mu.Lock()
	defer ob.mu.Unlock()
	return ob.snapshotAsks()
}

// GetSnapshot returns both bids and asks in a flattened format.
// This is useful for persistence and for public API responses.
func (ob *OrderBook) GetSnapshot() ([]*Order, []*Order) {
	ob.mu.Lock()
	defer ob.mu.Unlock()
	return ob.snapshotBids(), ob.snapshotAsks()
}

// RestoreFromSnapshot populates the order book from a list of bids and asks.
// This is used when loading state from Redis.
// Existing state is cleared before loading.
func (ob *OrderBook) RestoreFromSnapshot(bids []*Order, asks []*Order) {
	ob.mu.Lock()
	defer ob.mu.Unlock()
	
	// Clear existing
	ob.bids = make(map[int64]*priceLevel)
	ob.bidPrices = make([]int64, 0)
	ob.asks = make(map[int64]*priceLevel)
	ob.askPrices = make([]int64, 0)
	ob.orderMap = make(map[string]*orderNode)

	// Replay bids
	for _, order := range bids {
		// addBid assumes lock is held
		ob.addBid(order)
	}
	
	// Replay asks
	for _, order := range asks {
		// addAsk assumes lock is held
		ob.addAsk(order)
	}
}

// helpers for maintaining sorted price slices
func (ob *OrderBook) insertBidPrice(price int64) {
	idx := sort.Search(len(ob.bidPrices), func(i int) bool { return ob.bidPrices[i] <= price })
	if idx < len(ob.bidPrices) && ob.bidPrices[idx] == price {
		return // already exists
	}
	ob.bidPrices = append(ob.bidPrices, 0)
	copy(ob.bidPrices[idx+1:], ob.bidPrices[idx:])
	ob.bidPrices[idx] = price
}

func (ob *OrderBook) removeBidPrice(price int64) {
	idx := sort.Search(len(ob.bidPrices), func(i int) bool { return ob.bidPrices[i] <= price })
	if idx < len(ob.bidPrices) && ob.bidPrices[idx] == price {
		ob.bidPrices = append(ob.bidPrices[:idx], ob.bidPrices[idx+1:]...)
	}
}

func (ob *OrderBook) insertAskPrice(price int64) {
	idx := sort.Search(len(ob.askPrices), func(i int) bool { return ob.askPrices[i] >= price })
	if idx < len(ob.askPrices) && ob.askPrices[idx] == price {
		return
	}
	ob.askPrices = append(ob.askPrices, 0)
	copy(ob.askPrices[idx+1:], ob.askPrices[idx:])
	ob.askPrices[idx] = price
}

func (ob *OrderBook) removeAskPrice(price int64) {
	idx := sort.Search(len(ob.askPrices), func(i int) bool { return ob.askPrices[i] >= price })
	if idx < len(ob.askPrices) && ob.askPrices[idx] == price {
		ob.askPrices = append(ob.askPrices[:idx], ob.askPrices[idx+1:]...)
	}
}

