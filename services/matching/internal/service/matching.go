package service

import (
	"context"
	"fmt"
	"log"

	"github.com/open-exchange/matching_engine/internal/engine"
	common "github.com/open-exchange/matching_engine/proto/common"
	ledger "github.com/open-exchange/matching_engine/proto/ledger"
)

type MatchingService struct {
	Engine       *engine.Engine
	LedgerClient ledger.LedgerServiceClient
}

func NewMatchingService(engine *engine.Engine, ledgerClient ledger.LedgerServiceClient) *MatchingService {
	return &MatchingService{
		Engine:       engine,
		LedgerClient: ledgerClient,
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
	trades, err := s.Engine.ProcessOrder(internalOrder)
	if err != nil {
		return "", fmt.Errorf("failed to process order in engine: %w", err)
	}

	// 3. Handle Trades (Log for now)
	log.Printf("Order Processed. Trades generated: %d", len(trades))
	for _, trade := range trades {
		log.Printf("Trade: %v", trade)
		_, err := s.LedgerClient.RecordTrade(ctx, &ledger.RecordTradeRequest{
			MakerOrderId: trade.MakerOrderID,
			TakerOrderId: trade.TakerOrderID,
			Price:        trade.Price,
			Quantity:     trade.Quantity,
			Timestamp:    trade.Timestamp,
		})
		if err != nil {
			log.Printf("ERROR: Failed to record trade in ledger: %v", err)
			// TODO: Retry logic or robust error handling
		}
	}

	return order.Id, nil
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
		trades, err := s.Engine.ProcessOrder(order)
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
