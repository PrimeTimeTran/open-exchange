package engine

import (
	"log"
	"sort"
	"time"

	"github.com/open-exchange/matching_engine/internal/events"
)

func (ob *OrderBook) matchLimitBuy(order *Order, onMatch func(Trade) error) ([]Trade, []events.OrderBookEvent, error) {
	trades := []Trade{}
	bookEvents := []events.OrderBookEvent{}

	// Match against Asks (lowest sell price first)
	// While we have asks and the best ask is <= our limit price
	for len(ob.Asks) > 0 && ob.Asks[0].Price <= order.Price && !order.Filled() {
		bestAsk := ob.Asks[0]
		
		tradePrice := bestAsk.Price
		tradeQty := min(order.Remaining(), bestAsk.Remaining())
		
		trade := Trade{
			MakerOrderID: bestAsk.ID,
			TakerOrderID: order.ID,
			Price:        tradePrice,
			Quantity:     tradeQty,
			Timestamp:    time.Now().Unix(),
		}

		if onMatch != nil {
			if err := onMatch(trade); err != nil {
				return trades, bookEvents, err
			}
		}

		trades = append(trades, trade)
		
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

	return trades, bookEvents, nil
}

func (ob *OrderBook) matchLimitSell(order *Order, onMatch func(Trade) error) ([]Trade, []events.OrderBookEvent, error) {
	trades := []Trade{}
	bookEvents := []events.OrderBookEvent{}

	// Match against Bids (highest buy price first)
	// While we have bids and the best bid is >= our limit price
	for len(ob.Bids) > 0 && ob.Bids[0].Price >= order.Price && !order.Filled() {
		bestBid := ob.Bids[0]
		
		tradePrice := bestBid.Price
		tradeQty := min(order.Remaining(), bestBid.Remaining())
		
		trade := Trade{
			MakerOrderID: bestBid.ID,
			TakerOrderID: order.ID,
			Price:        tradePrice,
			Quantity:     tradeQty,
			Timestamp:    time.Now().Unix(),
		}

		if onMatch != nil {
			if err := onMatch(trade); err != nil {
				// Stop matching if callback fails
				return trades, bookEvents, err
			}
		}

		trades = append(trades, trade)
		
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

	return trades, bookEvents, nil
}

func (ob *OrderBook) matchMarketBuy(order *Order, onMatch func(Trade) error) ([]Trade, []events.OrderBookEvent, error) {
	trades := []Trade{}
	bookEvents := []events.OrderBookEvent{}
	
	// Match against Asks regardless of price (up to available liquidity)
	for len(ob.Asks) > 0 && !order.Filled() {
		bestAsk := ob.Asks[0]
		
		tradePrice := bestAsk.Price
		tradeQty := min(order.Remaining(), bestAsk.Remaining())
		
		trade := Trade{
			MakerOrderID: bestAsk.ID,
			TakerOrderID: order.ID,
			Price:        tradePrice,
			Quantity:     tradeQty,
			Timestamp:    time.Now().Unix(),
		}

		if onMatch != nil {
			if err := onMatch(trade); err != nil {
				// Stop matching if callback fails
				return trades, bookEvents, err
			}
		}

		trades = append(trades, trade)
		
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
	
	return trades, bookEvents, nil
}

func (ob *OrderBook) matchMarketSell(order *Order, onMatch func(Trade) error) ([]Trade, []events.OrderBookEvent, error) {
	trades := []Trade{}
	bookEvents := []events.OrderBookEvent{}
	
	// Match against Bids regardless of price
	for len(ob.Bids) > 0 && !order.Filled() {
		bestBid := ob.Bids[0]
		
		tradePrice := bestBid.Price
		tradeQty := min(order.Remaining(), bestBid.Remaining())
		
		trade := Trade{
			MakerOrderID: bestBid.ID,
			TakerOrderID: order.ID,
			Price:        tradePrice,
			Quantity:     tradeQty,
			Timestamp:    time.Now().Unix(),
		}

		if onMatch != nil {
			if err := onMatch(trade); err != nil {
				// Stop matching if callback fails
				return trades, bookEvents, err
			}
		}

		trades = append(trades, trade)
		
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
	
	return trades, bookEvents, nil
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
