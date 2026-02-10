package service

import (
	"context"
	"fmt"
	"log"
	"strings"
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
	// 1. Forward to Ledger - SKIPPED (Ledger calls us now)
	// log.Printf("Matching Service: Forwarding order %s to Ledger...", order.Id)
	// _, err := s.LedgerClient.RecordOrder(ctx, &ledger.RecordOrderRequest{
	// 	Order: order,
	// })
	// if err != nil {
	// 	return "", fmt.Errorf("failed to record order in ledger: %w", err)
	// }
    log.Printf("Matching Service: Received order %s (assumed valid from Ledger)", order.Id)

	// 2. Process in Engine
	internalOrder := engine.NewOrderFromProto(order)
	trades, bookEvents, err := s.Engine.ProcessOrder(internalOrder, func(trade engine.Trade) error {
		// Validate/Record trade with Ledger BEFORE committing to engine
		log.Printf("Validating trade with Ledger: %v", trade)
		_, err := s.LedgerClient.RecordTrade(ctx, &ledger.RecordTradeRequest{
			MakerOrderId: trade.MakerOrderID,
			TakerOrderId: trade.TakerOrderID,
			Price:        fmt.Sprintf("%f", trade.Price),
			Quantity:     fmt.Sprintf("%f", trade.Quantity),
			Timestamp:    trade.Timestamp,
			InstrumentId: order.InstrumentId,
		})
		if err != nil {
			log.Printf("ERROR: Failed to record trade in ledger: %v. Aborting match.", err)
			return fmt.Errorf("failed to record trade in ledger: %w", err)
		}
		return nil
	})

	log.Printf("Engine.ProcessOrder returned: trades=%d err=%v", len(trades), err)

	if err != nil {
		// If it's a ledger error during matching, we still might have partial trades returned.
		log.Printf("ProcessOrder finished with error (likely ledger rejection): %v", err)
		log.Printf("DEBUG: len(trades)=%d err=%v", len(trades), err)
		
		// If no trades were generated, it means the order failed completely (validation or first match rejection).
		if len(trades) == 0 {
			return "", err
		}
		
		// If trades > 0, we had partial fills but stopped due to error.
		// We log the error but return success with the OrderID, as the order is now effectively placed (partially filled).
	}

	// 3. Broadcast Order Book Events
	for _, event := range bookEvents {
		err := s.Publisher.PublishOrderBookEvent(ctx, event)
		if err != nil {
			log.Printf("ERROR: Failed to publish order book event: %v", err)
		}
	}

	// 4. Handle Trades (Log and Publish)
	log.Printf("Order Processed. Trades generated: %d", len(trades))
	for _, trade := range trades {
		log.Printf("Trade: %v", trade)
		// Trade already recorded in Ledger via callback.

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
	// 1. Forward to Ledger (to release locked funds)
	resp, err := s.LedgerClient.CancelOrder(ctx, &ledger.CancelOrderRequest{
		OrderId: orderID,
	})
	if err != nil {
		return fmt.Errorf("failed to cancel order in ledger: %w", err)
	}
	if !resp.Success {
		return fmt.Errorf("ledger refused to cancel order: %s", resp.Message)
	}

	// 2. Remove from Engine
	_, err = s.Engine.CancelOrder(instrumentID, orderID)
	if err != nil {
		// Ledger cancelled but Engine failed. This is a critical state inconsistency.
		log.Printf("CRITICAL: Failed to cancel order in engine after ledger success: %v", err)
		return fmt.Errorf("failed to cancel order in engine: %w", err)
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

func (s *MatchingService) GetOrderBook(ctx context.Context, instrumentID string) ([]*common.Order, []*common.Order, error) {
	// 1. Get snapshot from engine
	// Note: Engine returns internal Order structs
	ob, err := s.Engine.GetOrderBookSnapshot(instrumentID)
	if err != nil {
		return nil, nil, err
	}
	
	// 2. Get the actual lists safely
	bids, asks := ob.GetSnapshot()
	
	// 3. Convert to Proto
	var protoBids []*common.Order
	for _, b := range bids {
		protoBids = append(protoBids, b.ToProto())
	}
	
	var protoAsks []*common.Order
	for _, a := range asks {
		protoAsks = append(protoAsks, a.ToProto())
	}
	
	return protoBids, protoAsks, nil
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
		// Normalize instrument ID
		if strings.Contains(orderProto.InstrumentId, "_") {
			orderProto.InstrumentId = strings.ReplaceAll(orderProto.InstrumentId, "_", "-")
		}
		
		order := engine.NewOrderFromProto(orderProto)
		// ProcessOrder usually triggers matching. For recovery, we ideally just want to ADD to the book.
		// However, since we are recovering existing state, these orders should already be resting (no crosses).
		// If they do cross, it means the state was inconsistent, and they SHOULD match.
		// So calling ProcessOrder is generally safe and correct for a simple recovery.
		trades, _, err := s.Engine.ProcessOrder(order, nil)
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
