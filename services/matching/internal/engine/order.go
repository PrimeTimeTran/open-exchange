package engine

import (
	"log"
	"strconv"

	common "github.com/open-exchange/matching_engine/proto/common"
)

type Order struct {
	ID             string
	Side           common.OrderSide
	Type           common.OrderType
	Price          float64
	Quantity       float64
	QuantityFilled float64
	InstrumentID   string
	Timestamp      int64
	OriginalOrder  *common.Order
}

func NewOrderFromProto(o *common.Order) *Order {
	p, err := strconv.ParseFloat(o.Price, 64)
	if err != nil {
		log.Printf("Error parsing price: %v", err)
		p = 0
	}
	q, err := strconv.ParseFloat(o.Quantity, 64)
	if err != nil {
		log.Printf("Error parsing quantity: %v", err)
		q = 0
	}
	qf, err := strconv.ParseFloat(o.QuantityFilled, 64)
	if err != nil {
		qf = 0
	}

	return &Order{
		ID:             o.Id,
		Side:           o.Side,
		Type:           o.Type,
		Price:          p,
		Quantity:       q,
		QuantityFilled: qf,
		InstrumentID:   o.InstrumentId,
		Timestamp:      o.CreatedAt,
		OriginalOrder:  o,
	}
}

func (o *Order) Filled() bool {
	return o.QuantityFilled >= o.Quantity
}

func (o *Order) Remaining() float64 {
	return o.Quantity - o.QuantityFilled
}
