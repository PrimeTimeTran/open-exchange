package main

import (
	"log"
	"net"

	"github.com/open-exchange/market/internal/service"
	pb "github.com/open-exchange/market/proto/market"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

const port = ":50053"

func main() {
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterMarketServiceServer(s, service.NewMarketServer())
	
	// Enable reflection for easy testing with grpcurl
	reflection.Register(s)

	log.Printf("server listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
