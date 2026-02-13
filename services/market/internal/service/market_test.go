package service

import (
	"context"
	"testing"
	"time"

	"github.com/open-exchange/market/internal/backfill"
	"github.com/open-exchange/market/internal/store"
	pb "github.com/open-exchange/market/proto/market"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestGetLatestPrice_CacheHit(t *testing.T) {
	mockStore := new(store.MockStore)
	server := NewMarketServer(mockStore)

	ctx := context.Background()
	req := &pb.GetLatestPriceRequest{Symbol: "BTC_USD"}

	expectedCandle := &backfill.Candle{
		Timestamp: time.Now().UnixMilli(),
		Open:      90000,
		Close:     95000,
		High:      96000,
		Low:       89000,
		Volume:    100,
	}

	// Expect GetLatestCandle to be called with "BTCUSDT" (normalized)
	mockStore.On("GetLatestCandle", mock.Anything, "BTCUSDT", "1d").Return(expectedCandle, nil)

	resp, err := server.GetLatestPrice(ctx, req)

	assert.NoError(t, err)
	assert.Equal(t, "BTC_USD", resp.Symbol)
	assert.Equal(t, "95000.00", resp.Price)
	// Change calculation: ((95000 - 90000) / 90000) * 100 = (5000/90000)*100 = 5.55...
	assert.InDelta(t, 5.55, resp.Change_24H, 0.01)
	
	mockStore.AssertExpectations(t)
}

func TestGetLatestPrice_StoreError_Fallback(t *testing.T) {
	mockStore := new(store.MockStore)
	server := NewMarketServer(mockStore)

	ctx := context.Background()
	req := &pb.GetLatestPriceRequest{Symbol: "BTC_USD"}

	// Expect GetLatestCandle to return error
	mockStore.On("GetLatestCandle", mock.Anything, "BTCUSDT", "1d").Return(nil, assert.AnError)
	
	// Allow SaveCandles to be called (in case backfill succeeds)
	// We use Maybe() because backfill might fail (network) and then SaveCandles won't be called.
	mockStore.On("SaveCandles", mock.Anything, "BTCUSDT", "1d", mock.Anything).Return(nil).Maybe()

	resp, err := server.GetLatestPrice(ctx, req)

	// Even if store fails, we return a fallback response (random data)
	assert.NoError(t, err)
	assert.Equal(t, "BTC_USD", resp.Symbol)
	assert.NotNil(t, resp.Price)
}
