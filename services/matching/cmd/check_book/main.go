package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	common "github.com/open-exchange/matching_engine/proto/common"
	pb "github.com/open-exchange/matching_engine/proto/matching"
)

func main() {
	conn, err := grpc.NewClient("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer conn.Close()
	c := pb.NewMatchingClient(conn)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	// Place an order
	fmt.Println("Placing test order...")
	resp, err := c.PlaceOrder(ctx, &pb.PlaceOrderRequest{
		Order: &common.Order{
			Id:           fmt.Sprintf("test-order-%d", time.Now().Unix()),
			InstrumentId: "BTC-USD",
			Side:         common.OrderSide_ORDER_SIDE_BUY,
			Type:         common.OrderType_ORDER_TYPE_LIMIT,
			Price:        "100.0",
			Quantity:     "1.0",
			CreatedAt:    time.Now().Unix(),
		},
	})
	if err != nil {
		log.Printf("Error placing order: %v", err)
	} else if !resp.Success {
		log.Printf("PlaceOrder returned failure: %s", resp.ErrorMessage)
	} else {
		log.Printf("Placed order successfully: %s", resp.OrderId)
	}

	// Query order book
	fmt.Println("Querying order book...")
	book, err := c.GetOrderBook(ctx, &pb.GetOrderBookRequest{
		InstrumentId: "BTC-USD",
	})
	if err != nil {
		log.Fatalf("Error getting order book: %v", err)
	}

	fmt.Printf("Bids: %v\n", book.Bids)
	fmt.Printf("Asks: %v\n", book.Asks)
}
