package main

import (
	"context"
	"flag"
	"log"
	"os"
	"time"

	"github.com/open-exchange/market/internal/backfill"
	"github.com/open-exchange/market/internal/store"
)

func main() {
	symbol := flag.String("symbol", "BTCUSDT", "Trading pair symbol (e.g. BTCUSDT)")
	interval := flag.String("interval", "1d", "Candle interval (e.g. 1d, 1h)")
	limit := flag.Int("limit", 365, "Number of candles to fetch")
	redisUrl := flag.String("redis-url", "redis://redis:6379", "Redis URL")
	flag.Parse()

	// Override with env var if present (useful for docker)
	if envUrl := os.Getenv("REDIS_URL"); envUrl != "" {
		*redisUrl = envUrl
	}

	log.Printf("Fetching %d candles for %s on %s interval...", *limit, *symbol, *interval)

	candles, err := backfill.FetchBinanceHistory(*symbol, *interval, *limit)
	if err != nil {
		log.Fatalf("Error fetching history: %v", err)
	}

	log.Printf("Successfully fetched %d candles", len(candles))

	if len(candles) > 0 {
		first := candles[0]
		last := candles[len(candles)-1]
		log.Printf("Range: %s -> %s", 
			time.UnixMilli(first.Timestamp).Format(time.RFC3339),
			time.UnixMilli(last.Timestamp).Format(time.RFC3339),
		)
		log.Printf("Start Price: %.2f", first.Open)
		log.Printf("End Price: %.2f", last.Close)
	}

	// Save to Redis
	log.Printf("Connecting to Redis at %s...", *redisUrl)
	s, err := store.NewStore(*redisUrl)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	ctx := context.Background()
	log.Printf("Saving to Redis key: candles:%s:%s", *symbol, *interval)
	if err := s.SaveCandles(ctx, *symbol, *interval, candles); err != nil {
		log.Fatalf("Failed to save candles: %v", err)
	}

	log.Printf("Successfully saved %d candles to Redis!", len(candles))
}
