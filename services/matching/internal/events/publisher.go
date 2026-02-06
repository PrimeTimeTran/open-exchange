package events

import (
	"context"
	"fmt"
	"log"
	"strings"
)

type Publisher interface {
	PublishTrade(ctx context.Context, event TradeEvent) error
	PublishOrderCancelled(ctx context.Context, event OrderCancelledEvent) error
	PublishOrderBookEvent(ctx context.Context, event OrderBookEvent) error
}

// MultiPublisher distributes events to multiple publishers
type MultiPublisher struct {
	publishers []Publisher
}

func NewMultiPublisher(publishers ...Publisher) *MultiPublisher {
	return &MultiPublisher{publishers: publishers}
}

func (p *MultiPublisher) PublishTrade(ctx context.Context, event TradeEvent) error {
	var errs []string
	for _, pub := range p.publishers {
		if err := pub.PublishTrade(ctx, event); err != nil {
			errs = append(errs, err.Error())
		}
	}
	if len(errs) > 0 {
		return fmt.Errorf("publishing errors: %s", strings.Join(errs, "; "))
	}
	return nil
}

func (p *MultiPublisher) PublishOrderCancelled(ctx context.Context, event OrderCancelledEvent) error {
	var errs []string
	for _, pub := range p.publishers {
		if err := pub.PublishOrderCancelled(ctx, event); err != nil {
			errs = append(errs, err.Error())
		}
	}
	if len(errs) > 0 {
		return fmt.Errorf("publishing errors: %s", strings.Join(errs, "; "))
	}
	return nil
}

func (p *MultiPublisher) PublishOrderBookEvent(ctx context.Context, event OrderBookEvent) error {
	var errs []string
	for _, pub := range p.publishers {
		if err := pub.PublishOrderBookEvent(ctx, event); err != nil {
			errs = append(errs, err.Error())
		}
	}
	if len(errs) > 0 {
		return fmt.Errorf("publishing errors: %s", strings.Join(errs, "; "))
	}
	return nil
}

// LogPublisher logs events to stdout/stderr
type LogPublisher struct{}

func NewLogPublisher() *LogPublisher {
	return &LogPublisher{}
}

func (p *LogPublisher) PublishTrade(ctx context.Context, event TradeEvent) error {
	log.Printf("EVENT: Trade - Maker: %s, Taker: %s, Price: %f, Qty: %f, Instrument: %s", 
		event.MakerOrderID, event.TakerOrderID, event.Price, event.Quantity, event.InstrumentID)
	return nil
}

func (p *LogPublisher) PublishOrderCancelled(ctx context.Context, event OrderCancelledEvent) error {
	log.Printf("EVENT: OrderCancelled - Order: %s, Instrument: %s", event.OrderID, event.InstrumentID)
	return nil
}

func (p *LogPublisher) PublishOrderBookEvent(ctx context.Context, event OrderBookEvent) error {
	log.Printf("EVENT: OrderBook - Type: %s, Order: %s, Price: %f, Remaining: %f", event.Type, event.OrderID, event.Price, event.Quantity)
	return nil
}
