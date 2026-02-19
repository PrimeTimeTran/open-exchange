package engine

import (
	"log"
	"time"

	"github.com/open-exchange/matching_engine/internal/events"
)

func (ob *OrderBook) matchLimitBuy(order *Order, onMatch func(Trade) error) ([]Trade, []events.OrderBookEvent, error) {
	trades := []Trade{}
	bookEvents := []events.OrderBookEvent{}

	orderTicks := priceToTicks(order.Price)

	// Match against Asks (lowest sell price first)
	// While we have ask levels and the best ask price is <= our limit
	for len(ob.askPrices) > 0 && ob.askPrices[0] <= orderTicks && !order.Filled() {
		bestPrice := ob.askPrices[0]
		pl := ob.asks[bestPrice]
		bestNode := pl.head
		bestAsk := bestNode.order

		// Self-Trade Prevention: same as before
		if bestAsk.AccountID == order.AccountID {
			log.Printf("Self-Trade Prevention: Cancelling resting Ask %s for User %s", bestAsk.ID, bestAsk.AccountID)
			pl.remove(bestNode)
			delete(ob.orderMap, bestAsk.ID)
			bookEvents = append(bookEvents, events.OrderBookEvent{
				Type:         events.OrderCancelled,
				OrderID:      bestAsk.ID,
				InstrumentID: ob.InstrumentID,
				Price:        bestAsk.Price,
				Quantity:     0,
				Side:         "SELL",
				Timestamp:    time.Now().Unix(),
			})
			if pl.size == 0 {
				ob.removeAskPrice(bestPrice)
				delete(ob.asks, bestPrice)
			}
			continue
		}

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
			pl.remove(bestNode)
			delete(ob.orderMap, bestAsk.ID)
			bookEvents = append(bookEvents, events.OrderBookEvent{
				Type:         events.OrderFilled,
				OrderID:      bestAsk.ID,
				InstrumentID: ob.InstrumentID,
				Price:        bestAsk.Price,
				Quantity:     0,
				Side:         "SELL",
				Timestamp:    time.Now().Unix(),
			})
			if pl.size == 0 {
				ob.removeAskPrice(bestPrice)
				delete(ob.asks, bestPrice)
			}
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

	orderTicks := priceToTicks(order.Price)

	// match against best bids while price allows
	for len(ob.bidPrices) > 0 && ob.bidPrices[0] >= orderTicks && !order.Filled() {
		bestPrice := ob.bidPrices[0]
		pl := ob.bids[bestPrice]
		bestNode := pl.head
		bestBid := bestNode.order

		if bestBid.AccountID == order.AccountID {
			log.Printf("Self-Trade Prevention: Cancelling resting Bid %s for User %s", bestBid.ID, bestBid.AccountID)
			pl.remove(bestNode)
			delete(ob.orderMap, bestBid.ID)
			bookEvents = append(bookEvents, events.OrderBookEvent{
				Type:         events.OrderCancelled,
				OrderID:      bestBid.ID,
				InstrumentID: ob.InstrumentID,
				Price:        bestBid.Price,
				Quantity:     0,
				Side:         "BUY",
				Timestamp:    time.Now().Unix(),
			})
			if pl.size == 0 {
				ob.removeBidPrice(bestPrice)
				delete(ob.bids, bestPrice)
			}
			continue
		}

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
				return trades, bookEvents, err
			}
		}

		trades = append(trades, trade)

		order.QuantityFilled += tradeQty
		bestBid.QuantityFilled += tradeQty

		if bestBid.Filled() {
			pl.remove(bestNode)
			delete(ob.orderMap, bestBid.ID)
			bookEvents = append(bookEvents, events.OrderBookEvent{
				Type:         events.OrderFilled,
				OrderID:      bestBid.ID,
				InstrumentID: ob.InstrumentID,
				Price:        bestBid.Price,
				Quantity:     0,
				Side:         "BUY",
				Timestamp:    time.Now().Unix(),
			})
			if pl.size == 0 {
				ob.removeBidPrice(bestPrice)
				delete(ob.bids, bestPrice)
			}
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

	// consume from best ask levels until filled or empty
	for len(ob.askPrices) > 0 && !order.Filled() {
		bestPrice := ob.askPrices[0]
		pl := ob.asks[bestPrice]
		bestNode := pl.head
		bestAsk := bestNode.order

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
			pl.remove(bestNode)
			delete(ob.orderMap, bestAsk.ID)
			bookEvents = append(bookEvents, events.OrderBookEvent{
				Type:         events.OrderFilled,
				OrderID:      bestAsk.ID,
				InstrumentID: ob.InstrumentID,
				Price:        bestAsk.Price,
				Quantity:     0,
				Side:         "SELL",
				Timestamp:    time.Now().Unix(),
			})
			if pl.size == 0 {
				ob.removeAskPrice(bestPrice)
				delete(ob.asks, bestPrice)
			}
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

	for len(ob.bidPrices) > 0 && !order.Filled() {
		bestPrice := ob.bidPrices[0]
		pl := ob.bids[bestPrice]
		bestNode := pl.head
		bestBid := bestNode.order

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
				return trades, bookEvents, err
			}
		}

		trades = append(trades, trade)

		order.QuantityFilled += tradeQty
		bestBid.QuantityFilled += tradeQty

		if bestBid.Filled() {
			pl.remove(bestNode)
			delete(ob.orderMap, bestBid.ID)
			bookEvents = append(bookEvents, events.OrderBookEvent{
				Type:         events.OrderFilled,
				OrderID:      bestBid.ID,
				InstrumentID: ob.InstrumentID,
				Price:        bestBid.Price,
				Quantity:     0,
				Side:         "BUY",
				Timestamp:    time.Now().Unix(),
			})
			if pl.size == 0 {
				ob.removeBidPrice(bestPrice)
				delete(ob.bids, bestPrice)
			}
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
	// locate or create level
	ticks := priceToTicks(order.Price)
	pl, ok := ob.bids[ticks]
	if !ok {
		pl = &priceLevel{price: ticks}
		ob.bids[ticks] = pl
		ob.insertBidPrice(ticks)
	}
	// append to FIFO queue
	node := pl.append(order)
	ob.orderMap[order.ID] = node
	log.Printf("Added to Bids: %v @ %v", order.Quantity, order.Price)
}

func (ob *OrderBook) addAsk(order *Order) {
	ticks := priceToTicks(order.Price)
	pl, ok := ob.asks[ticks]
	if !ok {
		pl = &priceLevel{price: ticks}
		ob.asks[ticks] = pl
		ob.insertAskPrice(ticks)
	}
	node := pl.append(order)
	ob.orderMap[order.ID] = node
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
