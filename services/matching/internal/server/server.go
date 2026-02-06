package server

import (
	"context"

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

