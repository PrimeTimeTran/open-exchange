package aggregator

import (
	"github.com/open-exchange/market/internal/backfill"
)

// AggregateCandles takes a slice of candles and merges them into a single candle.
// Returns nil if the slice is empty.
func AggregateCandles(candles []backfill.Candle) *backfill.Candle {
	if len(candles) == 0 {
		return nil
	}

	first := candles[0]
	last := candles[len(candles)-1]

	agg := &backfill.Candle{
		Timestamp: first.Timestamp, // Start time of the interval
		Open:      first.Open,
		Close:     last.Close,
		High:      first.High,
		Low:       first.Low,
		Volume:    0,
	}

	for _, c := range candles {
		if c.High > agg.High {
			agg.High = c.High
		}
		if c.Low < agg.Low {
			agg.Low = c.Low
		}
		agg.Volume += c.Volume
	}

	return agg
}
