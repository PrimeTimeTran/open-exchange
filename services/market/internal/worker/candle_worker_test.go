package worker

import (
	"context"
	"testing"
	"time"

	"github.com/open-exchange/market/internal/backfill"
	"github.com/open-exchange/market/internal/store"
	"github.com/stretchr/testify/mock"
)

func TestAggregateInterval_Success(t *testing.T) {
	mockStore := new(store.MockStore)
	symbol := "BTC_USD"
	srcInterval := "1m"
	destInterval := "1h"
	duration := time.Hour

	worker := NewCandleWorker(mockStore, symbol, srcInterval, destInterval, duration)
	
	start := time.Date(2023, 10, 27, 10, 0, 0, 0, time.UTC)
	end := start.Add(duration).Add(-1 * time.Millisecond)

	// Mock GetCandles to return some source candles
	srcCandles := []backfill.Candle{
		{Timestamp: start.UnixMilli(), Open: 100, High: 105, Low: 95, Close: 102, Volume: 10},
		{Timestamp: start.Add(30 * time.Minute).UnixMilli(), Open: 102, High: 108, Low: 101, Close: 107, Volume: 20},
	}
	mockStore.On("GetCandles", mock.Anything, symbol, srcInterval, start.UnixMilli(), end.UnixMilli()).Return(srcCandles, nil)

	// Mock SaveCandles to expect aggregated candle
	// Aggregated: Open 100, High 108, Low 95, Close 107, Volume 30
	mockStore.On("SaveCandles", mock.Anything, symbol, destInterval, mock.MatchedBy(func(candles []backfill.Candle) bool {
		if len(candles) != 1 {
			return false
		}
		c := candles[0]
		return c.Open == 100 && c.High == 108 && c.Low == 95 && c.Close == 107 && c.Volume == 30 && c.Timestamp == start.UnixMilli()
	})).Return(nil)

	worker.AggregateInterval(context.Background(), start, end)

	mockStore.AssertExpectations(t)
}

func TestAggregateInterval_NoData(t *testing.T) {
	mockStore := new(store.MockStore)
	symbol := "BTC_USD"
	srcInterval := "1m"
	destInterval := "1h"
	duration := time.Hour

	worker := NewCandleWorker(mockStore, symbol, srcInterval, destInterval, duration)
	
	start := time.Date(2023, 10, 27, 10, 0, 0, 0, time.UTC)
	end := start.Add(duration).Add(-1 * time.Millisecond)

	// Mock GetCandles to return empty
	mockStore.On("GetCandles", mock.Anything, symbol, srcInterval, start.UnixMilli(), end.UnixMilli()).Return([]backfill.Candle{}, nil)

	// Expect NO SaveCandles call
	
	worker.AggregateInterval(context.Background(), start, end)

	mockStore.AssertExpectations(t)
}
