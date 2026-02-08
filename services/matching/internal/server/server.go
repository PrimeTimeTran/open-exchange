package server

import (
	"context"
	"log"

	"github.com/open-exchange/matching_engine/internal/service"
	pb "github.com/open-exchange/matching_engine/proto/matching"
)

type MatchingServer struct {
	pb.UnimplementedMatchingEngineServer
	Service *service.MatchingService
}

func NewMatchingServer(svc *service.MatchingService) *MatchingServer {
	return &MatchingServer{
		Service: svc,
	}
}

func (s *MatchingServer) PlaceOrder(ctx context.Context, req *pb.PlaceOrderRequest) (*pb.PlaceOrderResponse, error) {
	orderID, err := s.Service.PlaceOrder(ctx, req.Order)
	if err != nil {
		return &pb.PlaceOrderResponse{
			Success:      false,
			ErrorMessage: err.Error(),
		}, nil
	}

	return &pb.PlaceOrderResponse{
		OrderId:      orderID,
		Success:      true,
		ErrorMessage: "",
	}, nil
}

func (s *MatchingServer) CancelOrder(ctx context.Context, req *pb.CancelOrderRequest) (*pb.CancelOrderResponse, error) {
	err := s.Service.CancelOrder(ctx, req.OrderId, req.InstrumentId)
	if err != nil {
		return &pb.CancelOrderResponse{
			Success:      false,
			ErrorMessage: err.Error(),
		}, nil
	}

	return &pb.CancelOrderResponse{
		Success: true,
	}, nil
}

func (s *MatchingServer) GetOrderBook(ctx context.Context, req *pb.GetOrderBookRequest) (*pb.GetOrderBookResponse, error) {
	bids, asks, err := s.Service.GetOrderBook(ctx, req.InstrumentId)
	if err != nil {
		// Log error but return empty book? Or return error?
		// Engine returns error if book not found.
		// Let's return empty if not found, or error if something else.
		return nil, err
	}

	// log the bids and asks
	log.Printf("[%s] Bids: %v", req.InstrumentId, bids)
	log.Printf("[%s] Asks: %v", req.InstrumentId, asks)

	return &pb.GetOrderBookResponse{
		InstrumentId: req.InstrumentId,
		Bids:         bids,
		Asks:         asks,
	}, nil
}

