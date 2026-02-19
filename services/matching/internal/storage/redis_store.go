package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/open-exchange/matching_engine/internal/engine"
	"github.com/redis/go-redis/v9"
)

type RedisStore struct {
	client *redis.Client
}

func NewRedisStore(addr string) (*RedisStore, error) {
	client := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	if _, err := client.Ping(context.Background()).Result(); err != nil {
		return nil, fmt.Errorf("failed to connect to redis: %w", err)
	}

	return &RedisStore{client: client}, nil
}

func (s *RedisStore) SaveOrderBook(ctx context.Context, ob *engine.OrderBook) error {
	snapshot := struct {
		InstrumentID string          `json:"instrument_id"`
		Bids         []*engine.Order `json:"bids"`
		Asks         []*engine.Order `json:"asks"`
	}{
		InstrumentID: ob.InstrumentID,
	}
	
	snapshot.Bids, snapshot.Asks = ob.GetSnapshot()
	
	data, err := json.Marshal(snapshot)
	if err != nil {
		return fmt.Errorf("failed to marshal orderbook: %w", err)
	}
	
	key := fmt.Sprintf("orderbook:%s", ob.InstrumentID)
	if err := s.client.Set(ctx, key, data, 0).Err(); err != nil {
		return fmt.Errorf("failed to save orderbook to redis: %w", err)
	}
	
	return nil
}

func (s *RedisStore) LoadOrderBook(ctx context.Context, instrumentID string) (*engine.OrderBook, error) {
	key := fmt.Sprintf("orderbook:%s", instrumentID)
	data, err := s.client.Get(ctx, key).Bytes()
	if err == redis.Nil {
		return nil, nil // Not found
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get orderbook from redis: %w", err)
	}
	
	var snapshot struct {
		InstrumentID string          `json:"instrument_id"`
		Bids         []*engine.Order `json:"bids"`
		Asks         []*engine.Order `json:"asks"`
	}
	
	if err := json.Unmarshal(data, &snapshot); err != nil {
		return nil, fmt.Errorf("failed to unmarshal orderbook: %w", err)
	}
	
	ob := engine.NewOrderBook(instrumentID)
	ob.RestoreFromSnapshot(snapshot.Bids, snapshot.Asks)
	
	log.Printf("Loaded OrderBook %s from Redis: %d bids, %d asks", instrumentID, len(snapshot.Bids), len(snapshot.Asks))
	
	return ob, nil
}

func (s *RedisStore) ListOrderBooks(ctx context.Context) ([]string, error) {
	var keys []string
	var cursor uint64
	for {
		var batch []string
		var err error
		batch, cursor, err = s.client.Scan(ctx, cursor, "orderbook:*", 100).Result()
		if err != nil {
			return nil, fmt.Errorf("failed to scan keys: %w", err)
		}
		keys = append(keys, batch...)
		if cursor == 0 {
			break
		}
	}
	
	var instruments []string
	for _, key := range keys {
		// key format: orderbook:<instrumentID>
		parts := strings.Split(key, ":")
		if len(parts) == 2 {
			instruments = append(instruments, parts[1])
		}
	}
	
	return instruments, nil
}

func (s *RedisStore) EnqueueMatches(ctx context.Context, matches interface{}) error {
	data, err := json.Marshal(matches)
	if err != nil {
		return fmt.Errorf("failed to marshal matches: %w", err)
	}
	return s.client.RPush(ctx, "settlement_queue", data).Err()
}

func (s *RedisStore) DequeueMatches(ctx context.Context) ([]byte, error) {
	result, err := s.client.BLPop(ctx, 0, "settlement_queue").Result()
	if err != nil {
		return nil, err
	}
	return []byte(result[1]), nil
}
