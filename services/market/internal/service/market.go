package service

import (
	"context"
	"fmt"
	"math/rand"
	"sync"
	"time"

	pb "github.com/open-exchange/market/proto/market"
)

type MarketServer struct {
	pb.UnimplementedMarketServiceServer
	mu sync.Mutex
}

func NewMarketServer() *MarketServer {
	return &MarketServer{}
}

func (s *MarketServer) GetLatestPrice(ctx context.Context, req *pb.GetLatestPriceRequest) (*pb.PriceUpdate, error) {
	// Mock logic for now
	return &pb.PriceUpdate{
		Symbol:    req.Symbol,
		Price:     fmt.Sprintf("%.2f", 40000+rand.Float64()*1000),
		Timestamp: time.Now().UnixMilli(),
		Change_24H: 2.5,
		Volume_24H: 1000000,
	}, nil
}

func (s *MarketServer) SubscribePrices(req *pb.SubscribePricesRequest, stream pb.MarketService_SubscribePricesServer) error {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-stream.Context().Done():
			return nil
		case t := <-ticker.C:
			// Mock updates
			update := &pb.PriceUpdate{
				Symbol:    req.Symbol,
				Price:     fmt.Sprintf("%.2f", 40000+rand.Float64()*1000),
				Timestamp: t.UnixMilli(),
				Change_24H: 2.5 + (rand.Float64()-0.5)*0.1,
				Volume_24H: 1000000 + rand.Float64()*1000,
			}
			if err := stream.Send(update); err != nil {
				return err
			}
		}
	}
}
