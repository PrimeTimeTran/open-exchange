package testutil

import (
	"fmt"

	common "github.com/open-exchange/matching_engine/proto/common"
)

// NewOrder creates a new common.Order with default values for testing.
// Default Type is LIMIT, Instrument is BTC-USD.
func NewOrder(id string, side common.OrderSide, price float64, qty float64) *common.Order {
	// Simple formatting, can be improved if precise decimal handling is needed in tests
	p := fmt.Sprintf("%f", price)
	q := fmt.Sprintf("%f", qty)
	
	// Remove trailing zeros for cleaner strings if desired, but %f is fine for now as parser handles it.
	// Actually, let's use %g to be cleaner or just %f.
	
	return &common.Order{
		Id:           id,
		Side:         side,
		Type:         common.OrderType_ORDER_TYPE_LIMIT,
		Price:        p,
		Quantity:     q,
		InstrumentId: "BTC-USD",
		AccountId:    "user_" + id,
	}
}
