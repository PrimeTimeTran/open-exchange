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
		// TODO: Send trades to Ledger/Persistence or publish events
	}

	return order.Id, nil
}
