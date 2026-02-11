package engine

import (
	"fmt"
	"sync"

	"github.com/open-exchange/matching_engine/internal/events"
)

type Engine struct {
	OrderBooks map[string]*OrderBook
	mu         sync.RWMutex
}

func NewEngine() *Engine {
	return &Engine{
		OrderBooks: make(map[string]*OrderBook),
	}
}

func (e *Engine) GetOrderBook(instrumentID string) *OrderBook {
	e.mu.Lock()
	defer e.mu.Unlock()

	if _, ok := e.OrderBooks[instrumentID]; !ok {
		e.OrderBooks[instrumentID] = NewOrderBook(instrumentID)
	}
	return e.OrderBooks[instrumentID]
}

func (e *Engine) ProcessOrder(order *Order, onMatch func(Trade) error) ([]Trade, []events.OrderBookEvent, error) {
	if order.InstrumentID == "" {
		return nil, nil, fmt.Errorf("instrument ID is required")
	}

	ob := e.GetOrderBook(order.InstrumentID)
	// The OrderBook handles its own concurrency via ob.mu, so this is thread-safe.
	return ob.ProcessOrder(order, onMatch)
}

func (e *Engine) CancelOrder(instrumentID, orderID string) (*Order, error) {
	if instrumentID == "" {
		return nil, fmt.Errorf("instrument ID is required")
	}

	e.mu.Lock()
	ob, ok := e.OrderBooks[instrumentID]
	e.mu.Unlock()

	if !ok {
		return nil, fmt.Errorf("orderbook not found for instrument %s", instrumentID)
	}

	cancelledOrder := ob.CancelOrder(orderID)
	if cancelledOrder == nil {
		return nil, fmt.Errorf("order %s not found", orderID)
	}

	return cancelledOrder, nil
}

func (e *Engine) GetOrderBookSnapshot(instrumentID string) (*OrderBook, error) {
	return e.GetOrderBook(instrumentID), nil
}
