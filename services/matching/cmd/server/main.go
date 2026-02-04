package main

import (
	"flag"
	"fmt"
	"log"
	"net"
	"os"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/crypto-exchange/matching_engine/internal/server"
	ledger "github.com/crypto-exchange/matching_engine/proto/ledger"
	pb "github.com/crypto-exchange/matching_engine/proto/matching"
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

	// 2. Start Matching Engine Server
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", *port))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	matchingServer := server.NewMatchingServer(ledgerClient)
	pb.RegisterMatchingEngineServer(s, matchingServer)

	log.Printf("Matching Engine listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
