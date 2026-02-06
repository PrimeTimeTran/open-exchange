package main

import (
	"log"
	"net"
	"os"

	"github.com/open-exchange/market/internal/service"
	"github.com/open-exchange/market/internal/store"
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
		// We can still continue, passing nil store if we handle it in service, 
		// but better to just fail or handle nil in NewMarketServer
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
