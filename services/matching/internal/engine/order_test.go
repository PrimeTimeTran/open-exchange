package engine

import (
	"testing"

	common "github.com/open-exchange/matching_engine/proto/common"
	"github.com/stretchr/testify/assert"
)

func TestNewOrderFromProto(t *testing.T) {
	protoOrder := &common.Order{
		Id:             "order-1",
		Side:           common.OrderSide_ORDER_SIDE_BUY,
		Type:           common.OrderType_ORDER_TYPE_LIMIT,
		Price:          "50000.50",
		Quantity:       "1.5",
		QuantityFilled: "0.5",
		InstrumentId:   "BTC-USD",
		CreatedAt:      1234567890,
	}

	order := NewOrderFromProto(protoOrder)

	assert.Equal(t, "order-1", order.ID)
	assert.Equal(t, common.OrderSide_ORDER_SIDE_BUY, order.Side)
	assert.Equal(t, common.OrderType_ORDER_TYPE_LIMIT, order.Type)
	assert.Equal(t, 50000.50, order.Price)
	assert.Equal(t, 1.5, order.Quantity)
	assert.Equal(t, 0.5, order.QuantityFilled)
	assert.Equal(t, "BTC-USD", order.InstrumentID)
	assert.Equal(t, int64(1234567890), order.Timestamp)
	assert.Equal(t, protoOrder, order.OriginalOrder)
}

func TestNewOrderFromProto_InvalidNumbers(t *testing.T) {
	protoOrder := &common.Order{
		Id:             "order-2",
		Price:          "invalid",
		Quantity:       "invalid",
		QuantityFilled: "invalid",
	}

	order := NewOrderFromProto(protoOrder)

	assert.Equal(t, 0.0, order.Price)
	assert.Equal(t, 0.0, order.Quantity)
	assert.Equal(t, 0.0, order.QuantityFilled)
}

func TestOrder_Filled(t *testing.T) {
	tests := []struct {
		name           string
		quantity       float64
		quantityFilled float64
		expected       bool
	}{
		{"Empty", 1.0, 0.0, false},
		{"Partial", 1.0, 0.5, false},
		{"Exact", 1.0, 1.0, true},
		{"Overfilled", 1.0, 1.1, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			order := &Order{
				Quantity:       tt.quantity,
				QuantityFilled: tt.quantityFilled,
			}
			assert.Equal(t, tt.expected, order.Filled())
		})
	}
}

func TestOrder_Remaining(t *testing.T) {
	order := &Order{
		Quantity:       10.0,
		QuantityFilled: 3.5,
	}

	assert.Equal(t, 6.5, order.Remaining())
}
