package main

import (
	"context"
	"log"
	"net"
	"os"

	"time"

	"github.com/open-exchange/market/internal/service"
	"github.com/open-exchange/market/internal/store"
	"github.com/open-exchange/market/internal/worker"
	pb "github.com/open-exchange/market/proto/market"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

const port = ":50053"

func main() {
	redisUrl := os.Getenv("REDIS_URL")
	if redisUrl == "" {
		redisUrl = "redis://localhost:6379"
	}

	st, err := store.NewStore(redisUrl)
	if err != nil {
		log.Printf("Warning: Failed to connect to Redis: %v. Market data will be mocked.", err)
	} else {
		// Start Aggregation Workers
		// For MVP, we hardcode a few symbols. Ideally, fetch from DB or config.
		// symbols := []string{"BTC_USD", "ETH_USD", "AAPL_USD", "GOOG_USD", "MSFT_USD", "TSLA_USD"}
		symbols := []string{"BTC_USD", "AAPL_USD"}
		for _, sym := range symbols {
			// 1m -> 1h
			w1h := worker.NewCandleWorker(st, sym, "1m", "1h", time.Hour)
			go w1h.Start(context.Background())
			
			// 1h -> 4h
			w4h := worker.NewCandleWorker(st, sym, "1h", "4h", 4*time.Hour)
			go w4h.Start(context.Background())
			
			// 4h -> 1d
			w1d := worker.NewCandleWorker(st, sym, "4h", "1d", 24*time.Hour)
			go w1d.Start(context.Background())

			// 1d -> 1w
			w1w := worker.NewCandleWorker(st, sym, "1d", "1w", 7*24*time.Hour)
			go w1w.Start(context.Background())
		}
	}

	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterMarketServiceServer(s, service.NewMarketServer(st))
	
	// Enable reflection for easy testing with grpcurl
	reflection.Register(s)

	log.Printf("server listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
