package server

import (
	"context"
	"fmt"
	"log"

	ledger "github.com/crypto-exchange/matching_engine/proto/ledger"
	pb "github.com/crypto-exchange/matching_engine/proto/matching"
)

type MatchingServer struct {
	pb.UnimplementedMatchingEngineServer
	LedgerClient ledger.LedgerServiceClient
}

func NewMatchingServer(ledgerClient ledger.LedgerServiceClient) *MatchingServer {
	return &MatchingServer{
		LedgerClient: ledgerClient,
	}
}

func (s *MatchingServer) PlaceOrder(ctx context.Context, req *pb.PlaceOrderRequest) (*pb.PlaceOrderResponse, error) {
	log.Printf("Matching Engine: Received order placement request: %v", req.Order)

	// Forward to Ledger
	log.Printf("Matching Engine: Forwarding to Ledger Service...")
	ledgerResp, err := s.LedgerClient.RecordOrder(ctx, &ledger.RecordOrderRequest{
		Order: req.Order,
	})

	if err != nil {
		log.Printf("Error calling Ledger: %v", err)
		return &pb.PlaceOrderResponse{
			Success:      false,
			ErrorMessage: fmt.Sprintf("Failed to record order in ledger: %v", err),
		}, nil
	}

	log.Printf("Ledger Response: %v", ledgerResp)

	// In a real engine, we would add to order book here.
	
	return &pb.PlaceOrderResponse{
		OrderId:      "test-order-id-123", // Mock ID
		Success:      true,
		ErrorMessage: "",
	}, nil
}
