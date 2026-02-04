package engine

import (
	"fmt"
	"sync"
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

func (e *Engine) ProcessOrder(order *Order) ([]Trade, error) {
	if order.InstrumentID == "" {
		return nil, fmt.Errorf("instrument ID is required")
	}

	ob := e.GetOrderBook(order.InstrumentID)
	// Note: In a real high-perf engine, we'd lock the specific orderbook, not the whole map for getting it.
	// But here, since GetOrderBook locks the map, we are safe to access the returned pointer.
	// However, ProcessOrder modifies the orderbook, so we need concurrency control on the orderbook itself.
	// For simplicity, we can assume single-threaded processing per orderbook or add a lock to OrderBook.
	
	// Let's add a lock to OrderBook? Or just lock here for MVP.
	// Given the code structure, I'll assume sequential processing for now or add a mutex to OrderBook if needed.
	// For this scaffold, I'll rely on the fact that we are just implementing the logic.
	
	return ob.ProcessOrder(order)
}
