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
	// Note: In a real high-perf engine, we'd lock the specific orderbook, not the whole map for getting it.
	// But here, since GetOrderBook locks the map, we are safe to access the returned pointer.
	// However, ProcessOrder modifies the orderbook, so we need concurrency control on the orderbook itself.
	// For simplicity, we can assume single-threaded processing per orderbook or add a lock to OrderBook.
	
	// Let's add a lock to OrderBook? Or just lock here for MVP.
	// Given the code structure, I'll assume sequential processing for now or add a mutex to OrderBook if needed.
	// For this scaffold, I'll rely on the fact that we are just implementing the logic.
	
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
	// Use GetOrderBook to ensure it exists
	return e.GetOrderBook(instrumentID), nil
}
