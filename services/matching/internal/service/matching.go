package service

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/open-exchange/matching_engine/internal/engine"
	"github.com/open-exchange/matching_engine/internal/events"
	common "github.com/open-exchange/matching_engine/proto/common"
	ledger "github.com/open-exchange/matching_engine/proto/ledger"
	"google.golang.org/grpc"
)

// LedgerClientInterface defines the subset of LedgerService methods we use.
// This helps with testing (mocking) and decouples us from the full massive Ledger interface.
type LedgerClientInterface interface {
	RecordOrder(ctx context.Context, in *ledger.RecordOrderRequest, opts ...grpc.CallOption) (*ledger.RecordOrderResponse, error)
	GetOpenOrders(ctx context.Context, in *ledger.GetOpenOrdersRequest, opts ...grpc.CallOption) (*ledger.GetOpenOrdersResponse, error)
	RecordTrade(ctx context.Context, in *ledger.RecordTradeRequest, opts ...grpc.CallOption) (*ledger.RecordTradeResponse, error)
	CancelOrder(ctx context.Context, in *ledger.CancelOrderRequest, opts ...grpc.CallOption) (*ledger.CancelOrderResponse, error)
}

type MatchingService struct {
	Engine       *engine.Engine
	LedgerClient LedgerClientInterface
	Publisher    events.Publisher
}

func NewMatchingService(engine *engine.Engine, ledgerClient LedgerClientInterface, publisher events.Publisher) *MatchingService {
	return &MatchingService{
		Engine:       engine,
		LedgerClient: ledgerClient,
		Publisher:    publisher,
	}
}

func (s *MatchingService) PlaceOrder(ctx context.Context, order *common.Order) (string, error) {
	// 1. Forward to Ledger
	log.Printf("Matching Service: Forwarding order %s to Ledger...", order.Id)
	_, err := s.LedgerClient.RecordOrder(ctx, &ledger.RecordOrderRequest{
		Order: order,
	})
	if err != nil {
		return "", fmt.Errorf("failed to record order in ledger: %w", err)
	}

	// 2. Process in Engine
	internalOrder := engine.NewOrderFromProto(order)
	trades, bookEvents, err := s.Engine.ProcessOrder(internalOrder)
	if err != nil {
		return "", fmt.Errorf("failed to process order in engine: %w", err)
	}

	// 3. Broadcast Order Book Events
	for _, event := range bookEvents {
		err := s.Publisher.PublishOrderBookEvent(ctx, event)
		if err != nil {
			log.Printf("ERROR: Failed to publish order book event: %v", err)
		}
	}

	// 4. Handle Trades (Log for now)
	log.Printf("Order Processed. Trades generated: %d", len(trades))
	for _, trade := range trades {
		log.Printf("Trade: %v", trade)
		_, err := s.LedgerClient.RecordTrade(ctx, &ledger.RecordTradeRequest{
			MakerOrderId: trade.MakerOrderID,
			TakerOrderId: trade.TakerOrderID,
			Price:        fmt.Sprintf("%f", trade.Price),
			Quantity:     fmt.Sprintf("%f", trade.Quantity),
			Timestamp:    trade.Timestamp,
			InstrumentId: order.InstrumentId,
		})
		if err != nil {
			log.Printf("ERROR: Failed to record trade in ledger: %v", err)
			// TODO: Retry logic or robust error handling
		}

		// 5. Broadcast Trade Event
		err = s.Publisher.PublishTrade(ctx, events.TradeEvent{
			MakerOrderID: trade.MakerOrderID,
			TakerOrderID: trade.TakerOrderID,
			Price:        trade.Price,
			Quantity:     trade.Quantity,
			Timestamp:    trade.Timestamp,
			InstrumentID: order.InstrumentId,
		})
		if err != nil {
			log.Printf("ERROR: Failed to publish trade event: %v", err)
		}
	}

	return order.Id, nil
}

func (s *MatchingService) CancelOrder(ctx context.Context, orderID, instrumentID string) error {
	// 1. Remove from Engine
	_, err := s.Engine.CancelOrder(instrumentID, orderID)
	if err != nil {
		return fmt.Errorf("failed to cancel order in engine: %w", err)
	}

	// 2. Forward to Ledger (to release locked funds)
	_, err = s.LedgerClient.CancelOrder(ctx, &ledger.CancelOrderRequest{
		OrderId: orderID,
	})
	if err != nil {
		// Just log error, engine state is already updated
		log.Printf("ERROR: Failed to cancel order in ledger: %v", err)
	}

	// 3. Publish Event
	err = s.Publisher.PublishOrderCancelled(ctx, events.OrderCancelledEvent{
		OrderID:      orderID,
		InstrumentID: instrumentID,
		Timestamp:    time.Now().UnixNano(),
	})
	if err != nil {
		log.Printf("ERROR: Failed to publish order cancelled event: %v", err)
	}

	return nil
}

// RecoverState fetches open orders from the Ledger and repopulates the engine.
func (s *MatchingService) RecoverState(ctx context.Context) error {
	log.Println("Matching Service: Starting State Recovery...")

	// 1. Fetch Open Orders from Ledger
	// Passing empty instrument_id to get all orders
	resp, err := s.LedgerClient.GetOpenOrders(ctx, &ledger.GetOpenOrdersRequest{
		InstrumentId: "", 
	})
	if err != nil {
		return fmt.Errorf("failed to fetch open orders from ledger: %w", err)
	}

	log.Printf("Matching Service: Found %d open orders to recover.", len(resp.Orders))

	// 2. Repopulate Engine
	for _, orderProto := range resp.Orders {
		order := engine.NewOrderFromProto(orderProto)
		// ProcessOrder usually triggers matching. For recovery, we ideally just want to ADD to the book.
		// However, since we are recovering existing state, these orders should already be resting (no crosses).
		// If they do cross, it means the state was inconsistent, and they SHOULD match.
		// So calling ProcessOrder is generally safe and correct for a simple recovery.
		trades, _, err := s.Engine.ProcessOrder(order)
		if err != nil {
			log.Printf("ERROR: Failed to recover order %s: %v", order.ID, err)
			continue
		}
		if len(trades) > 0 {
			log.Printf("WARNING: Recovery triggered %d trades for order %s. This implies inconsistent state.", len(trades), order.ID)
		}
	}

	log.Println("Matching Service: State Recovery Complete.")
	return nil
}


// SyncOrderBook fetches all open orders from the Ledger and rebuilds the in-memory order book.
// This should be called on service startup.
func (s *MatchingService) SyncOrderBook(ctx context.Context) error {
	log.Printf("Syncing order book from Ledger...")
	
	// Fetch all open orders
	resp, err := s.LedgerClient.GetOpenOrders(ctx, &ledger.GetOpenOrdersRequest{})
	if err != nil {
		return fmt.Errorf("failed to fetch open orders from ledger: %w", err)
	}

	count := 0
	for _, orderProto := range resp.Orders {
		order := engine.NewOrderFromProto(orderProto)
		
		// Process the order. Since these are existing open orders, they should simply sit in the book.
		// If they generate trades, it implies the persisted state had matching orders that weren't executed.
		trades, _, err := s.Engine.ProcessOrder(order)
		if err != nil {
			log.Printf("Error restoring order %s: %v", order.ID, err)
			continue
		}
		
		if len(trades) > 0 {
			log.Printf("WARNING: Restored order %s generated %d trades! Ledger state might be inconsistent.", order.ID, len(trades))
		}
		count++
	}

	log.Printf("Successfully synced %d orders from Ledger.", count)
	return nil
}
