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

	"strings"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
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

	// Start Health Check early so deployment succeeds even if Ledger is down
	go system.StartHealthServer(":8080")

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

	var opts []grpc.DialOption

	// If using a public HTTPS URL (Render Web Service)
	if strings.HasPrefix(addr, "https://") {
		addr = strings.TrimPrefix(addr, "https://")

		// Ensure port 443 if not specified
		if !strings.Contains(addr, ":") {
			addr = addr + ":443"
		}

		creds := credentials.NewClientTLSFromCert(nil, "")
		opts = append(opts, grpc.WithTransportCredentials(creds))
	} else {
		// Internal private service (e.g., "ledger:50051")
		opts = append(opts, grpc.WithTransportCredentials(insecure.NewCredentials()))
	}

	// Block until connection is ready (helps surface real errors)
	opts = append(opts, grpc.WithBlock())

	log.Printf("Dialing Ledger Service target: %s", addr)

	conn, err := grpc.Dial(addr, opts...)
	if err != nil {
		log.Fatalf("did not connect to ledger: %v", err)
	}

	return conn,
		ledger.NewOrderServiceClient(conn),
		ledger.NewSettlementClient(conn)
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

