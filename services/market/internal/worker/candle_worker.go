package worker

import (
	"context"
	"log"
	"time"

	"github.com/open-exchange/market/internal/aggregator"
	"github.com/open-exchange/market/internal/backfill"
	"github.com/open-exchange/market/internal/store"
)

type CandleWorker struct {
	store        store.Store
	symbol       string
	srcInterval  string // Source interval (e.g. "1m", "1h")
	destInterval string // Destination interval (e.g. "1h", "4h")
	duration     time.Duration // Duration of the destination interval (e.g. time.Hour)
}

func NewCandleWorker(store store.Store, symbol string, srcInterval, destInterval string, duration time.Duration) *CandleWorker {
	return &CandleWorker{
		store:        store,
		symbol:       symbol,
		srcInterval:  srcInterval,
		destInterval: destInterval,
		duration:     duration,
	}
}

// Start runs the worker to aggregate srcInterval candles into destInterval candles
func (w *CandleWorker) Start(ctx context.Context) {
	// Align to the next interval boundary
	now := time.Now()
	nextRun := now.Truncate(w.duration).Add(w.duration)
	wait := time.Until(nextRun)

	log.Printf("CandleWorker [%s->%s]: Waiting %v until next alignment...", w.srcInterval, w.destInterval, wait)

	timer := time.NewTimer(wait)

	for {
		select {
		case <-ctx.Done():
			timer.Stop()
			return
		case <-timer.C:
			// Timer fired, meaning an interval just finished.
			processingTime := time.Now().Truncate(w.duration)
			startOfInterval := processingTime.Add(-1 * w.duration)
			endOfInterval := processingTime.Add(-1 * time.Millisecond)

			w.AggregateInterval(ctx, startOfInterval, endOfInterval)

			// Reset timer for next interval
			next := time.Now().Truncate(w.duration).Add(w.duration)
			timer.Reset(time.Until(next))
		}
	}
}

func (w *CandleWorker) AggregateInterval(ctx context.Context, start, end time.Time) {
	log.Printf("CandleWorker [%s]: Aggregating %s -> %s from %s to %s", w.symbol, w.srcInterval, w.destInterval, start, end)

	// Fetch source candles
	candles, err := w.store.GetCandles(ctx, w.symbol, w.srcInterval, start.UnixMilli(), end.UnixMilli())
	if err != nil {
		log.Printf("CandleWorker [%s]: Error fetching candles: %v", w.symbol, err)
		return
	}

	if len(candles) == 0 {
		log.Printf("CandleWorker [%s]: No %s candles found to aggregate.", w.symbol, w.srcInterval)
		return
	}

	// Aggregate
	aggCandle := aggregator.AggregateCandles(candles)
	if aggCandle == nil {
		return
	}
	
	// Ensure the timestamp is the start of the interval
	aggCandle.Timestamp = start.UnixMilli()

	// Save destination candle
	err = w.store.SaveCandles(ctx, w.symbol, w.destInterval, []backfill.Candle{*aggCandle})
	if err != nil {
		log.Printf("CandleWorker [%s]: Error saving aggregated candle: %v", w.symbol, err)
		return
	}

	log.Printf("CandleWorker [%s]: Successfully aggregated %s candle: %+v", w.symbol, w.destInterval, aggCandle)
}
