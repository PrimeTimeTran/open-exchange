package store

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/open-exchange/market/internal/backfill"
	"github.com/redis/go-redis/v9"
)

type RedisStore struct {
	client *redis.Client
}

// Compile-time check to ensure RedisStore implements Store
var _ Store = (*RedisStore)(nil)

func NewStore(redisAddr string) (*RedisStore, error) {
	var client *redis.Client
	var err error

	// If full Redis URL (production)
	if strings.HasPrefix(redisAddr, "redis://") || strings.HasPrefix(redisAddr, "rediss://") {
		var opts *redis.Options
		opts, err = redis.ParseURL(redisAddr)
		if err != nil {
			return nil, fmt.Errorf("invalid redis url: %w", err)
		}
		client = redis.NewClient(opts)
	} else {
		// Dev mode: host:port
		client = redis.NewClient(&redis.Options{
			Addr: redisAddr,
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to redis: %w", err)
	}

	return &RedisStore{client: client}, nil
}

// SaveCandles stores candles in a Redis ZSET
// Key: candles:{symbol}:{interval}
// Score: Timestamp
// Member: JSON(Candle)
func (s *RedisStore) SaveCandles(ctx context.Context, symbol string, interval string, candles []backfill.Candle) error {
	key := fmt.Sprintf("candles:%s:%s", symbol, interval)
	
	pipe := s.client.Pipeline()
	
	for _, c := range candles {
		data, err := json.Marshal(c)
		if err != nil {
			return err
		}
		
		pipe.ZAdd(ctx, key, redis.Z{
			Score:  float64(c.Timestamp),
			Member: data,
		})
	}
	
	_, err := pipe.Exec(ctx)
	return err
}

// GetCandles retrieves candles from Redis ZSET
func (s *RedisStore) GetCandles(ctx context.Context, symbol string, interval string, start, end int64) ([]backfill.Candle, error) {
	key := fmt.Sprintf("candles:%s:%s", symbol, interval)
	
	// ZRangeByScore
	vals, err := s.client.ZRangeByScore(ctx, key, &redis.ZRangeBy{
		Min: fmt.Sprintf("%d", start),
		Max: fmt.Sprintf("%d", end),
	}).Result()
	
	if err != nil {
		return nil, err
	}
	
	var candles []backfill.Candle
	for _, v := range vals {
		var c backfill.Candle
		if err := json.Unmarshal([]byte(v), &c); err != nil {
			continue
		}
		candles = append(candles, c)
	}
	
	return candles, nil
}

// GetLatestCandle retrieves the most recent candle for a symbol/interval
func (s *RedisStore) GetLatestCandle(ctx context.Context, symbol string, interval string) (*backfill.Candle, error) {
	key := fmt.Sprintf("candles:%s:%s", symbol, interval)
	
	// Get the last element (highest score/timestamp)
	vals, err := s.client.ZRevRange(ctx, key, 0, 0).Result()
	if err != nil {
		return nil, err
	}
	
	if len(vals) == 0 {
		return nil, fmt.Errorf("no candles found for %s", key)
	}
	
	var c backfill.Candle
	if err := json.Unmarshal([]byte(vals[0]), &c); err != nil {
		return nil, err
	}
	
	return &c, nil
}
