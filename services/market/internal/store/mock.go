package store

import (
	"context"

	"github.com/open-exchange/market/internal/backfill"
	"github.com/stretchr/testify/mock"
)

type MockStore struct {
	mock.Mock
}

func (m *MockStore) SaveCandles(ctx context.Context, symbol string, interval string, candles []backfill.Candle) error {
	args := m.Called(ctx, symbol, interval, candles)
	return args.Error(0)
}

func (m *MockStore) GetCandles(ctx context.Context, symbol string, interval string, start, end int64) ([]backfill.Candle, error) {
	args := m.Called(ctx, symbol, interval, start, end)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]backfill.Candle), args.Error(1)
}

func (m *MockStore) GetLatestCandle(ctx context.Context, symbol string, interval string) (*backfill.Candle, error) {
	args := m.Called(ctx, symbol, interval)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*backfill.Candle), args.Error(1)
}
