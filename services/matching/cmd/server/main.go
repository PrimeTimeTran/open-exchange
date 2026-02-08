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
	"github.com/open-exchange/matching_engine/internal/system"
	"github.com/open-exchange/matching_engine/proto/helloworld"
	ledger "github.com/open-exchange/matching_engine/proto/ledger"
	pb "github.com/open-exchange/matching_engine/proto/matching"
)

var (
	port = flag.Int("port", 50051, "The server port")
)

func main() {
	flag.Parse()

	// 1. Connect to Ledger Service
	ledgerAddr := os.Getenv("LEDGER_URL")
	if ledgerAddr == "" {
		ledgerAddr = "ledger:50052"
	}

	log.Printf("Connecting to Ledger Service at %s...", ledgerAddr)
	conn, err := grpc.NewClient(ledgerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("did not connect to ledger: %v", err)
	}
	defer conn.Close()
	ledgerClient := ledger.NewLedgerServiceClient(conn)
	greeterClient := helloworld.NewGreeterClient(conn)

	// 2. Initialize Engine and Service
	eng := engine.NewEngine()

	// Initialize Publisher
	// Always use LogPublisher for visibility
	publishers := []events.Publisher{
		events.NewLogPublisher(),
	}

	redisAddr := os.Getenv("REDIS_URL")
	if redisAddr == "" {
		redisAddr = "redis:6379"
	}

	redisPub, err := events.NewRedisPublisher(redisAddr)
	if err != nil {
		log.Printf("Warning: Could not connect to Redis at %s: %v. Running without Redis publisher.", redisAddr, err)
	} else {
		log.Printf("Connected to Redis at %s", redisAddr)
		publishers = append(publishers, redisPub)
	}

	publisher := events.NewMultiPublisher(publishers...)

	svc := service.NewMatchingService(eng, ledgerClient, publisher)

	// 2.5 Startup Recovery
	// We do this in a goroutine or before serving. Before serving is safer to ensure state is consistent.
	ctx := context.Background()
	// Retry recovery for up to 30 seconds
	maxRetries := 10
	retryInterval := 3 * time.Second
	for i := 0; i < maxRetries; i++ {
		err := svc.RecoverState(ctx)
		if err == nil {
			log.Printf("Successfully recovered state from Ledger.")
			break
		}
		
		log.Printf("WARNING: Failed to recover state from Ledger (Attempt %d/%d): %v", i+1, maxRetries, err)
		if i == maxRetries-1 {
			log.Printf("ERROR: Could not recover state after %d attempts. Starting with empty order book.", maxRetries)
		} else {
			time.Sleep(retryInterval)
		}
	}

	// 3. Start Matching Engine Server
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", *port))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	matchingServer := server.NewMatchingServer(svc)
	pb.RegisterMatchingEngineServer(s, matchingServer)

	greeterServer := server.NewGreeterServer(greeterClient)
	helloworld.RegisterGreeterServer(s, greeterServer)

	log.Printf("Matching Engine listening at %v", lis.Addr())
	
	// Start HTTP Health Check Server
	go system.StartHealthServer(":8080")

	// 4. Graceful Shutdown
	go func() {
		if err := s.Serve(lis); err != nil {
			log.Fatalf("failed to serve: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server with
	// a timeout of 5 seconds.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	s.GracefulStop()
	log.Println("Server exiting")
}

