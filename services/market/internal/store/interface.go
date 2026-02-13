package store

import (
	"context"

	"github.com/open-exchange/market/internal/backfill"
)

// Store defines the interface for market data storage
type Store interface {
	SaveCandles(ctx context.Context, symbol string, interval string, candles []backfill.Candle) error
	GetCandles(ctx context.Context, symbol string, interval string, start, end int64) ([]backfill.Candle, error)
	GetLatestCandle(ctx context.Context, symbol string, interval string) (*backfill.Candle, error)
}
