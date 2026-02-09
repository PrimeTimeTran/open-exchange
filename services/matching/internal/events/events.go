package events

type TradeEvent struct {
	MakerOrderID string
	TakerOrderID string
	Price        float64
	Quantity     float64
	Timestamp    int64
	InstrumentID string
}

type OrderCancelledEvent struct {
	OrderID      string
	InstrumentID string
	Timestamp    int64
}

// OrderEventType represents the type of change to the order book
type OrderEventType string

const (
	OrderCreated     OrderEventType = "CREATED"     // New order added to book
	OrderUpdated     OrderEventType = "UPDATED"     // Order modified (partial fill)
	OrderFilled      OrderEventType = "FILLED"      // Order fully filled
	OrderCancelled   OrderEventType = "CANCELLED"   // Order removed from book
)

// OrderBookEvent represents a change to an order in the book (L2 data)
type OrderBookEvent struct {
	Type         OrderEventType
	OrderID      string
	InstrumentID string
	Price        float64
	Quantity     float64 // Remaining quantity
	Side         string  // "BUY" or "SELL"
	Timestamp    int64
}
