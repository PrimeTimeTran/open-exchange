package events

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/redis/go-redis/v9"
)

type RedisPublisher struct {
	client *redis.Client
}

func NewRedisPublisher(addr string) (*RedisPublisher, error) {
	client := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	// Test connection
	_, err := client.Ping(context.Background()).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to redis: %w", err)
	}

	return &RedisPublisher{
		client: client,
	}, nil
}

func (p *RedisPublisher) PublishTrade(ctx context.Context, event TradeEvent) error {
	channel := fmt.Sprintf("trade.%s", event.InstrumentID)
	
	payload, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal trade event: %w", err)
	}

	err = p.client.Publish(ctx, channel, payload).Err()
	if err != nil {
		return fmt.Errorf("failed to publish trade to channel %s: %w", channel, err)
	}
	
	return nil
}

func (p *RedisPublisher) PublishOrderCancelled(ctx context.Context, event OrderCancelledEvent) error {
	// Assuming a general order update channel or depth channel for now.
	// In a real system this might be 'depth.update.{symbol}'
	channel := fmt.Sprintf("order.cancelled.%s", event.InstrumentID)

	payload, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal cancel event: %w", err)
	}

	err = p.client.Publish(ctx, channel, payload).Err()
	if err != nil {
		return fmt.Errorf("failed to publish cancellation to channel %s: %w", channel, err)
	}

	return nil
}

func (p *RedisPublisher) PublishOrderBookEvent(ctx context.Context, event OrderBookEvent) error {
	channel := fmt.Sprintf("orderbook.%s", event.InstrumentID)
	
	payload, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal orderbook event: %w", err)
	}

	err = p.client.Publish(ctx, channel, payload).Err()
	if err != nil {
		return fmt.Errorf("failed to publish orderbook event to channel %s: %w", channel, err)
	}

	return nil
}
