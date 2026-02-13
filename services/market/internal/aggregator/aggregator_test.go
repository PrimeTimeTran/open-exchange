package aggregator

import (
	"testing"

	"github.com/open-exchange/market/internal/backfill"
	"github.com/stretchr/testify/assert"
)

func TestAggregateCandles_Empty(t *testing.T) {
	var candles []backfill.Candle
	result := AggregateCandles(candles)
	assert.Nil(t, result, "Should return nil for empty input")
}

func TestAggregateCandles_Single(t *testing.T) {
	candles := []backfill.Candle{
		{Timestamp: 1000, Open: 10, High: 12, Low: 9, Close: 11, Volume: 100},
	}
	
	result := AggregateCandles(candles)
	
	assert.NotNil(t, result)
	assert.Equal(t, candles[0], *result, "Single candle should be identical to input")
}


func TestAggregateCandles(t *testing.T) {
	// Setup test data
	candles := []backfill.Candle{
		{Timestamp: 1000, Open: 10, High: 12, Low: 9, Close: 11, Volume: 100},
		{Timestamp: 1060, Open: 11, High: 15, Low: 11, Close: 14, Volume: 200},
		{Timestamp: 1120, Open: 14, High: 14, Low: 10, Close: 10, Volume: 150},
	}

	// Expected result
	expected := &backfill.Candle{
		Timestamp: 1000, // Should take first candle's timestamp
		Open:      10,   // First candle open
		Close:     10,   // Last candle close
		High:      15,   // Max high
		Low:       9,    // Min low
		Volume:    450,  // Sum volume
	}

	// Run aggregation
	result := AggregateCandles(candles)

	// Assertions
	assert.NotNil(t, result)
	assert.Equal(t, expected.Timestamp, result.Timestamp, "Timestamp mismatch")
	assert.Equal(t, expected.Open, result.Open, "Open price mismatch")
	assert.Equal(t, expected.Close, result.Close, "Close price mismatch")
	assert.Equal(t, expected.High, result.High, "High price mismatch")
	assert.Equal(t, expected.Low, result.Low, "Low price mismatch")
	assert.Equal(t, expected.Volume, result.Volume, "Volume mismatch")
}

