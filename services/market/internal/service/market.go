package service

import (
	"context"
	"fmt"
	"math/rand"
	"strings"
	"sync"
	"time"

	"github.com/open-exchange/market/internal/backfill"
	"github.com/open-exchange/market/internal/store"
	pb "github.com/open-exchange/market/proto/market"
)

type MarketServer struct {
	pb.UnimplementedMarketServiceServer
	store store.Store
	mu    sync.Mutex
}

func NewMarketServer(s store.Store) *MarketServer {
	return &MarketServer{store: s}
}

func (s *MarketServer) GetLatestPrice(ctx context.Context, req *pb.GetLatestPriceRequest) (*pb.PriceUpdate, error) {
	// Normalize symbol: BTC_USD -> BTCUSDT
	symbol := strings.ReplaceAll(req.Symbol, "_", "")
	if strings.HasSuffix(symbol, "USD") && !strings.HasSuffix(symbol, "USDT") {
		symbol = symbol + "T" // Common mapping for crypto (BTCUSD -> BTCUSDT)
	}

	// Try to get from Redis
	if s.store != nil {
		candle, err := s.store.GetLatestCandle(ctx, symbol, "1d")
		if err != nil {
			// Attempt backfill if missing
			fmt.Printf("Backfilling latest data for %s\n", symbol)
			newCandles, bfErr := backfill.FetchBinanceHistory(symbol, "1d", 100)
			if bfErr == nil && len(newCandles) > 0 {
				s.store.SaveCandles(ctx, symbol, "1d", newCandles)
				// Use the last candle from backfill
				last := newCandles[len(newCandles)-1]
				candle = &last
				err = nil
			}
		}

		if err == nil {
			return &pb.PriceUpdate{
				Symbol:    req.Symbol,
				Price:     fmt.Sprintf("%.2f", candle.Close),
				Timestamp: candle.Timestamp,
				Change_24H: ((candle.Close - candle.Open) / candle.Open) * 100,
				Volume_24H: candle.Volume,
			}, nil
		}
	}
	
	// Fallback to mock if not found or error
	return &pb.PriceUpdate{
		Symbol:    req.Symbol,
		Price:     fmt.Sprintf("%.2f", 95000+rand.Float64()*1000),
		Timestamp: time.Now().UnixMilli(),
		Change_24H: 2.5,
		Volume_24H: 1000000,
	}, nil
}

func (s *MarketServer) GetMarketData(ctx context.Context, req *pb.GetMarketDataRequest) (*pb.GetMarketDataResponse, error) {
	symbol := strings.ReplaceAll(req.Symbol, "_", "")
	if strings.HasSuffix(symbol, "USD") && !strings.HasSuffix(symbol, "USDT") {
		symbol = symbol + "T"
	}

	// Default interval 1d if not provided
	interval := req.Interval
	if interval == "" {
		interval = "1d"
	}

	if s.store == nil {
		return nil, fmt.Errorf("store not initialized")
	}

	candles, err := s.store.GetCandles(ctx, symbol, interval, req.StartTime, req.EndTime)
	if err != nil {
		return nil, err
	}

	// If no candles found in store, attempt backfill
	if len(candles) == 0 {
		fmt.Printf("Backfilling data for %s %s\n", symbol, interval)
		newCandles, err := backfill.FetchBinanceHistory(symbol, interval, 500)
		if err == nil && len(newCandles) > 0 {
			s.store.SaveCandles(ctx, symbol, interval, newCandles)
			// Re-query store to respect time range
			candles, _ = s.store.GetCandles(ctx, symbol, interval, req.StartTime, req.EndTime)
		}
	}

	var pbCandles []*pb.Candle
	for _, c := range candles {
		pbCandles = append(pbCandles, &pb.Candle{
			Timestamp: c.Timestamp,
			Open:      c.Open,
			High:      c.High,
			Low:       c.Low,
			Close:     c.Close,
			Volume:    c.Volume,
		})
	}

	return &pb.GetMarketDataResponse{Candles: pbCandles}, nil
}

func (s *MarketServer) SubscribePrices(req *pb.SubscribePricesRequest, stream pb.MarketService_SubscribePricesServer) error {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-stream.Context().Done():
			return nil
		case t := <-ticker.C:
			// Mock updates
			update := &pb.PriceUpdate{
				Symbol:    req.Symbol,
				Price:     fmt.Sprintf("%.2f", 95000+rand.Float64()*1000),
				Timestamp: t.UnixMilli(),
				Change_24H: 2.5 + (rand.Float64()-0.5)*0.1,
				Volume_24H: 1000000 + rand.Float64()*1000,
			}
			if err := stream.Send(update); err != nil {
				return err
			}
		}
	}
}
