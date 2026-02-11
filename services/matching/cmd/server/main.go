package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/open-exchange/matching_engine/internal/engine"
	"github.com/open-exchange/matching_engine/internal/events"
	"github.com/open-exchange/matching_engine/internal/server"
	"github.com/open-exchange/matching_engine/internal/service"
	"github.com/open-exchange/matching_engine/internal/storage"
	"github.com/open-exchange/matching_engine/internal/system"
	ledger "github.com/open-exchange/matching_engine/proto/ledger"
	pb "github.com/open-exchange/matching_engine/proto/matching"
)

var (
	port = flag.Int("port", 50051, "The server port")
)

func main() {
	flag.Parse()

	// 1. Configuration
	ledgerAddr := getEnv("LEDGER_URL", "ledger:50052")
	redisAddr := getEnv("REDIS_URL", "redis:6379")

	// 2. Infrastructure Setup
	ledgerConn, ledgerClient, settlementClient := connectToLedger(ledgerAddr)
	defer ledgerConn.Close()

	publisher := setupPublisher(redisAddr)
	redisStore := setupRedisStore(redisAddr)

	// 3. Service Initialization
	eng := engine.NewEngine()
	svc := service.NewMatchingService(eng, ledgerClient, settlementClient, publisher, redisStore)

	// 4. State Recovery
	recoverState(svc)

	// 5. Server Startup
	startServer(svc)
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func connectToLedger(addr string) (*grpc.ClientConn, ledger.OrderServiceClient, ledger.SettlementClient) {
	log.Printf("Connecting to Ledger Service at %s...", addr)
	conn, err := grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("did not connect to ledger: %v", err)
	}
	return conn, ledger.NewOrderServiceClient(conn), ledger.NewSettlementClient(conn)
}

func setupPublisher(redisAddr string) events.Publisher {
	publishers := []events.Publisher{
		events.NewLogPublisher(),
	}

	redisPub, err := events.NewRedisPublisher(redisAddr)
	if err != nil {
		log.Printf("Warning: Could not connect to Redis at %s: %v. Running without Redis publisher.", redisAddr, err)
	} else {
		log.Printf("Connected to Redis at %s", redisAddr)
		publishers = append(publishers, redisPub)
	}

	return events.NewMultiPublisher(publishers...)
}

func setupRedisStore(addr string) *storage.RedisStore {
	store, err := storage.NewRedisStore(addr)
	if err != nil {
		log.Fatalf("Failed to connect to Redis for persistence: %v", err)
	}
	return store
}

func recoverState(svc *service.MatchingService) {
	ctx := context.Background()
	retryInterval := 3 * time.Second

	for {
		err := svc.RecoverState(ctx)
		if err == nil {
			log.Printf("Successfully recovered state.")
			break
		}
		
		log.Printf("WARNING: Failed to recover state: %v. Retrying in %v...", err, retryInterval)
		time.Sleep(retryInterval)
	}
}

func startServer(svc *service.MatchingService) {
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", *port))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	
	// Register services
	pb.RegisterMatchingServer(s, server.NewMatchingServer(svc))

	// Start Health Check
	go system.StartHealthServer(":8080")

	// Start gRPC Server
	go func() {
		log.Printf("Matching Engine listening at %v", lis.Addr())
		if err := s.Serve(lis); err != nil {
			log.Fatalf("failed to serve: %v", err)
		}
	}()

	// Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	s.GracefulStop()
	log.Println("Server exiting")
}

