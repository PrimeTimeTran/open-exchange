package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/open-exchange/matching_engine/internal/engine"
	"github.com/open-exchange/matching_engine/internal/events"
	common "github.com/open-exchange/matching_engine/proto/common"
	ledger "github.com/open-exchange/matching_engine/proto/ledger"
	"google.golang.org/grpc"
)

// LedgerClientInterface defines the subset of LedgerService methods we use.
// This helps with testing (mocking) and decouples us from the full massive Ledger interface.
type LedgerClientInterface interface {
	RecordOrder(ctx context.Context, in *ledger.RecordOrderRequest, opts ...grpc.CallOption) (*ledger.RecordOrderResponse, error)
	GetOpenOrders(ctx context.Context, in *ledger.GetOpenOrdersRequest, opts ...grpc.CallOption) (*ledger.GetOpenOrdersResponse, error)
	ProcessTrade(ctx context.Context, in *ledger.ProcessTradeRequest, opts ...grpc.CallOption) (*ledger.ProcessTradeResponse, error)
	CancelOrder(ctx context.Context, in *ledger.CancelOrderRequest, opts ...grpc.CallOption) (*ledger.CancelOrderResponse, error)
}

// SettlementClientInterface defines the subset of SettlementService methods we use.
type SettlementClientInterface interface {
	Commit(ctx context.Context, in *ledger.CommitRequest, opts ...grpc.CallOption) (*ledger.CommitResponse, error)
}

type Store interface {
	SaveOrderBook(ctx context.Context, ob *engine.OrderBook) error
	LoadOrderBook(ctx context.Context, instrumentID string) (*engine.OrderBook, error)
	ListOrderBooks(ctx context.Context) ([]string, error)
	EnqueueMatches(ctx context.Context, matches interface{}) error
	DequeueMatches(ctx context.Context) ([]byte, error)
}

type MatchingService struct {
	Engine           *engine.Engine
	LedgerClient     LedgerClientInterface
	SettlementClient SettlementClientInterface
	Publisher        events.Publisher
	Store            Store
}

func NewMatchingService(engine *engine.Engine, ledgerClient LedgerClientInterface, settlementClient SettlementClientInterface, publisher events.Publisher, store Store) *MatchingService {
	s := &MatchingService{
		Engine:           engine,
		LedgerClient:     ledgerClient,
		SettlementClient: settlementClient,
		Publisher:        publisher,
		Store:            store,
	}
	go s.startSettlementWorker()
	return s
}

func (s *MatchingService) startSettlementWorker() {
	log.Println("Settlement Worker Started")
	ctx := context.Background()
	for {
		data, err := s.Store.DequeueMatches(ctx)
		if err != nil {
			log.Printf("Settlement Worker: Dequeue failed: %v", err)
			time.Sleep(1 * time.Second)
			continue
		}

		var req ledger.CommitRequest
		// We actually stored matches slice, but let's see how we encode it.
		// Assuming we enqueue the whole CommitRequest or just matches.
		// Let's assume we enqueue just the matches slice for now, OR better, the CommitRequest itself.
		// Let's modify PlaceOrder to enqueue CommitRequest.
		
		// But wait, we need to unmarshal.
		// If we store []Match, we need to wrap it.
		
		// Correction: Let's store the whole CommitRequest for simplicity.
		if err := json.Unmarshal(data, &req); err != nil {
			log.Printf("Settlement Worker: Unmarshal failed: %v", err)
			continue
		}

		log.Printf("Settlement Worker: Committing %d matches to Ledger...", len(req.Matches))
		
		// Retry Loop for Commit
		backoff := 1 * time.Second
		maxBackoff := 30 * time.Second

		for {
			resp, err := s.SettlementClient.Commit(ctx, &req)
			if err != nil {
				log.Printf("Settlement Worker: Commit failed (Transport): %v. Retrying in %v...", err, backoff)
				time.Sleep(backoff)
				backoff *= 2
				if backoff > maxBackoff {
					backoff = maxBackoff
				}
				continue
			}
			if !resp.Success {
				log.Printf("Settlement Worker: Commit failed (Logic): %s. CRITICAL: State Corruption Detected.", resp.ErrorMessage)
				// CRITICAL: The Matching Engine (memory) and Ledger (truth) are now divergent.
				// The Engine executed a trade that the Ledger says is invalid.
				// We MUST crash to force a restart and state recovery (reloading orders from Ledger).
				panic(fmt.Sprintf("CRITICAL: Settlement Logic Error: %s. Forcing restart to recover state.", resp.ErrorMessage))
			}
			log.Printf("Settlement Worker: Commit Success. Trade IDs: %v", resp.TradeIds)
			break
		}
	}
}

func (s *MatchingService) PlaceOrder(ctx context.Context, order *common.Order) (string, error) {
	log.Printf("Matching Service: Received order %s (assumed valid from Ledger)", order.Id)
	internalOrder := engine.NewOrderFromProto(order)
	// Process matches in memory first (Optimistic Matching)
	trades, bookEvents, err := s.Engine.ProcessOrder(internalOrder, nil)
	log.Printf("Engine.ProcessOrder returned: trades=%d err=%v", len(trades), err)

	if err != nil {
		return "", err
	}

	// Batch Commit trades to Ledger
	if len(trades) > 0 {
		var matches []*ledger.Match
		for _, trade := range trades {
			matches = append(matches, &ledger.Match{
				MatchId:      uuid.New().String(),
				MakerOrderId: trade.MakerOrderID,
				TakerOrderId: trade.TakerOrderID,
				InstrumentId: order.InstrumentId,
				Price:        fmt.Sprintf("%.8f", trade.Price),
				Quantity:     fmt.Sprintf("%.8f", trade.Quantity),
				TakerSide:    order.Side,
				MatchedAt:    trade.Timestamp * 1000,
			})
		}

		log.Printf("Committing %d trades to Ledger (Settlement)...", len(matches))
		
		commitReq := &ledger.CommitRequest{
			Matches:  matches,
			TenantId: order.TenantId,
		}
		
		// 5. The "Outbox" Pattern (Persist & Retry)
		if err := s.Store.EnqueueMatches(ctx, commitReq); err != nil {
			log.Printf("CRITICAL: Failed to enqueue matches for settlement: %v. Data risk!", err)
			return "", fmt.Errorf("failed to persist matches: %w", err)
		}
		log.Println("Matches enqueued for settlement.")
	}

	// 3. Broadcast Order Book Events
	for _, event := range bookEvents {
		err := s.Publisher.PublishOrderBookEvent(ctx, event)
		if err != nil {
			log.Printf("ERROR: Failed to publish order book event: %v", err)
		}
	}

	// 4. Handle Trades (Log and Publish)
	log.Printf("Order Processed. Trades generated: %d", len(trades))
	for _, trade := range trades {
		log.Printf("Trade: %v", trade)
		// Trade already recorded in Ledger via callback.

		// 5. Broadcast Trade Event
		err = s.Publisher.PublishTrade(ctx, events.TradeEvent{
			MakerOrderID: trade.MakerOrderID,
			TakerOrderID: trade.TakerOrderID,
			Price:        trade.Price,
			Quantity:     trade.Quantity,
			Timestamp:    trade.Timestamp,
			InstrumentID: order.InstrumentId,
		})
		if err != nil {
			log.Printf("ERROR: Failed to publish trade event: %v", err)
		}
	}
	
	// 5. Persist State
	if err := s.Store.SaveOrderBook(ctx, s.Engine.GetOrderBook(order.InstrumentId)); err != nil {
		log.Printf("ERROR: Failed to save orderbook state to Redis: %v", err)
	}

	return order.Id, nil
}

func (s *MatchingService) CancelOrder(ctx context.Context, orderID, instrumentID string) error {
	// 1. Remove from Engine first (to prevent further matching)
	// We need to know if it was actually in the engine to decide whether to call Ledger.
	_, err := s.Engine.CancelOrder(instrumentID, orderID)
	if err != nil {
		// If not found in engine, it might be already filled or cancelled.
		// We shouldn't try to cancel in Ledger if Engine says it's gone (assuming Engine is source of truth for active orders).
		// However, if we want to be safe and ensure Ledger is clear, we could proceed, but usually Engine is the authority.
		return fmt.Errorf("failed to cancel order in engine: %w", err)
	}

	// 2. Forward to Ledger (to release locked funds)
	resp, err := s.LedgerClient.CancelOrder(ctx, &ledger.CancelOrderRequest{
		OrderId: orderID,
	})
	if err != nil {
		// Critical: Order removed from book but funds might still be locked.
		log.Printf("CRITICAL: Order %s removed from engine but Ledger CancelOrder failed: %v", orderID, err)
		return fmt.Errorf("failed to cancel order in ledger (funds may be locked): %w", err)
	}
	if !resp.Success {
		log.Printf("CRITICAL: Order %s removed from engine but Ledger refused cancel: %s", orderID, resp.Message)
		return fmt.Errorf("ledger refused to cancel order: %s", resp.Message)
	}

	// 3. Publish Event
	err = s.Publisher.PublishOrderCancelled(ctx, events.OrderCancelledEvent{
		OrderID:      orderID,
		InstrumentID: instrumentID,
		Timestamp:    time.Now().UnixNano(),
	})
	if err != nil {
		log.Printf("ERROR: Failed to publish order cancelled event: %v", err)
	}
	
	// 4. Persist State
	if err := s.Store.SaveOrderBook(ctx, s.Engine.GetOrderBook(instrumentID)); err != nil {
		log.Printf("ERROR: Failed to save orderbook state to Redis: %v", err)
	}

	return nil
}

func (s *MatchingService) GetOrderBook(ctx context.Context, instrumentID string) ([]*common.Order, []*common.Order, error) {
	// 1. Get snapshot from engine
	// Note: Engine returns internal Order structs
	ob, err := s.Engine.GetOrderBookSnapshot(instrumentID)
	if err != nil {
		return nil, nil, err
	}
	
	// 2. Get the actual lists safely
	bids, asks := ob.GetSnapshot()
	
	// 3. Convert to Proto
	var protoBids []*common.Order
	for _, b := range bids {
		protoBids = append(protoBids, b.ToProto())
	}
	
	var protoAsks []*common.Order
	for _, a := range asks {
		protoAsks = append(protoAsks, a.ToProto())
	}
	
	return protoBids, protoAsks, nil
}

// RecoverState fetches open orders from Redis (or Ledger as fallback) and repopulates the engine.
func (s *MatchingService) RecoverState(ctx context.Context) error {
	log.Println("Matching Service: Starting State Recovery...")

	forceRebuild := os.Getenv("FORCE_REBUILD_FROM_LEDGER") == "true"
	if forceRebuild {
		log.Println("Forcing rebuild from Ledger due to FORCE_REBUILD_FROM_LEDGER=true. Skipping Redis load.")
	}

	// 1. Try Recover from Redis
	if !forceRebuild {
		instruments, err := s.Store.ListOrderBooks(ctx)
		if err == nil && len(instruments) > 0 {
			log.Printf("Found %d orderbooks in Redis. Loading...", len(instruments))
			for _, instrumentID := range instruments {
				ob, err := s.Store.LoadOrderBook(ctx, instrumentID)
				if err != nil {
					log.Printf("Failed to load orderbook %s from Redis: %v", instrumentID, err)
					continue
				}
				s.Engine.OrderBooks[instrumentID] = ob
			}
			log.Println("Matching Service: State Recovery from Redis Complete.")
			return nil
		}

		if err != nil {
			log.Printf("Warning: Redis recovery failed: %v. Falling back to Ledger.", err)
		} else {
			log.Println("Redis is empty. Falling back to Ledger for initial population.")
		}
	}

	// 2. Fetch Open Orders from Ledger (Fallback)
	// Passing empty instrument_id to get all orders
	resp, err := s.LedgerClient.GetOpenOrders(ctx, &ledger.GetOpenOrdersRequest{
		InstrumentId: "", 
	})
	if err != nil {
		return fmt.Errorf("failed to fetch open orders from ledger: %w", err)
	}

	log.Printf("Matching Service: Found %d open orders to recover from Ledger.", len(resp.Orders))

	// 3. Repopulate Engine
	for _, orderProto := range resp.Orders {
		// Normalize instrument ID
		if strings.Contains(orderProto.InstrumentId, "_") {
			orderProto.InstrumentId = strings.ReplaceAll(orderProto.InstrumentId, "_", "-")
		}
		
		order := engine.NewOrderFromProto(orderProto)
		trades, _, err := s.Engine.ProcessOrder(order, nil)
		if err != nil {
			log.Printf("ERROR: Failed to recover order %s: %v", order.ID, err)
			continue
		}
		if len(trades) > 0 {
			log.Printf("WARNING: Recovery triggered %d trades for order %s. This implies inconsistent state. Committing trades to Ledger to resolve state.", len(trades), order.ID)
			
			var matches []*ledger.Match
			for _, trade := range trades {
				matches = append(matches, &ledger.Match{
					MatchId:      uuid.New().String(),
					MakerOrderId: trade.MakerOrderID,
					TakerOrderId: trade.TakerOrderID,
					InstrumentId: order.InstrumentID,
					Price:        fmt.Sprintf("%.8f", trade.Price),
					Quantity:     fmt.Sprintf("%.8f", trade.Quantity),
					TakerSide:    order.Side, // Using order.Side from engine order
					MatchedAt:    trade.Timestamp * 1000,
				})
			}

			log.Printf("RecoverState: Committing %d trades to Ledger...", len(matches))
			
			commitReq := &ledger.CommitRequest{
				Matches:  matches,
				TenantId: orderProto.TenantId,
			}
			
			if err := s.Store.EnqueueMatches(ctx, commitReq); err != nil {
				log.Printf("CRITICAL: RecoverState: Failed to enqueue matches for settlement: %v. Data risk!", err)
			}
		}
	}
	
	// 4. Save populated state to Redis for next time
	log.Println("Saving recovered state to Redis...")
	for _, ob := range s.Engine.OrderBooks {
		if err := s.Store.SaveOrderBook(ctx, ob); err != nil {
			log.Printf("Failed to save recovered orderbook %s to Redis: %v", ob.InstrumentID, err)
		}
	}

	log.Println("Matching Service: State Recovery Complete.")
	return nil
}
