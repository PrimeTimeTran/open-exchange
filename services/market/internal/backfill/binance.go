package backfill

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// Candle represents a single OHLCV data point
type Candle struct {
	Timestamp int64   `json:"t"` // Unix timestamp (ms)
	Open      float64 `json:"o"`
	High      float64 `json:"h"`
	Low       float64 `json:"l"`
	Close     float64 `json:"c"`
	Volume    float64 `json:"v"`
}

// FetchBinanceHistory fetches historical k-line data from Binance public API
// symbol: e.g. "BTCUSDT"
// interval: e.g. "1d", "1h", "15m"
// limit: number of candles to fetch (max 1000)
func FetchBinanceHistory(symbol string, interval string, limit int) ([]Candle, error) {
	url := fmt.Sprintf("https://api.binance.com/api/v3/klines?symbol=%s&interval=%s&limit=%d", symbol, interval, limit)
	
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("binance api returned status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// Binance returns:
	// [
	//   [
	//     1499040000000,      // Open time
	//     "0.01634790",       // Open
	//     "0.80000000",       // High
	//     "0.01575800",       // Low
	//     "0.01577100",       // Close
	//     "148976.11427815",  // Volume
	//     ...
	//   ]
	// ]
	var rawData [][]interface{}
	if err := json.Unmarshal(body, &rawData); err != nil {
		return nil, err
	}

	var candles []Candle
	for _, k := range rawData {
		// Helper to safely parse float from string or number
		getFloat := func(v interface{}) float64 {
			switch i := v.(type) {
			case string:
				var f float64
				fmt.Sscanf(i, "%f", &f)
				return f
			case float64:
				return i
			default:
				return 0
			}
		}

		// Helper to safely parse int64
		getInt64 := func(v interface{}) int64 {
			switch i := v.(type) {
			case float64:
				return int64(i)
			default:
				return 0
			}
		}

		candles = append(candles, Candle{
			Timestamp: getInt64(k[0]),
			Open:      getFloat(k[1]),
			High:      getFloat(k[2]),
			Low:       getFloat(k[3]),
			Close:     getFloat(k[4]),
			Volume:    getFloat(k[5]),
		})
	}

	return candles, nil
}
