package server

import (
	"context"
	"fmt"
	"log"

	"github.com/open-exchange/matching_engine/proto/helloworld"
)

type GreeterServer struct {
	helloworld.UnimplementedGreeterServer
	GreeterClient helloworld.GreeterClient
}

func NewGreeterServer(greeterClient helloworld.GreeterClient) *GreeterServer {
	return &GreeterServer{
		GreeterClient: greeterClient,
	}
}

func (s *GreeterServer) SayHello(ctx context.Context, in *helloworld.HelloRequest) (*helloworld.HelloReply, error) {
	log.Printf("Received: %v", in.GetName())

	// Call Ledger's Greeter
	log.Printf("Calling Ledger Greeter... PrimeTranTran")
	ledgerResp, err := s.GreeterClient.SayHello(ctx, &helloworld.HelloRequest{Name: "Matching Engine"})
	ledgerMsg := " (Ledger said nothing)"
	if err != nil {
		log.Printf("Error calling Ledger Greeter: %v", err)
		ledgerMsg = fmt.Sprintf(" (Ledger error: %v)", err)
	} else {
		log.Printf("Ledger Greeter Response: %v", ledgerResp.GetMessage())
		ledgerMsg = fmt.Sprintf(" (Ledger says: %s)", ledgerResp.GetMessage())
	}

	return &helloworld.HelloReply{Message: "Hello " + in.GetName() + " from Matching Engine " + ledgerMsg}, nil
}

