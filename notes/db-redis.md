# Redis Strategy

Redis will serve as the "hot cache" and "message broker" for real-time market data.

## Usage

### 1. Pub/Sub (Real-time Streaming)

- **Channel**: `trade.{symbol}` (e.g., `trade.BTC-USD`)
- **Publisher**: Matching Engine (upon trade execution)
- **Subscriber**: Market Service (to aggregate OHLCV)
- **Subscriber**: API Gateway / WebSocket Server (to push to clients)

### 2. Hot Cache (Snapshot Data)

- **Key**: `ticker:{symbol}` (e.g., `ticker:BTC-USD`)
- **Value**: JSON object `{ "price": "50000", "24h_change": "2.5", "24h_volume": "1000" }`
- **TTL**: None (Persistent until updated)
- **Purpose**: Fast retrieval for "GetLatestPrice" RPC and initial page load.

### 3. OHLCV Partial Candles (Real-time aggregation)

- **Key**: `candle:{symbol}:{interval}:{timestamp}`
- **Type**: Hash or Stream
- **Purpose**: Storing the "current minute" candle before it is finalized and flushed to the Time-Series DB.

## Configuration

- **Host**: `redis` (in docker-compose)
- **Port**: `6379`
- **Persistence**: AOF enabled (Append Only File) for durability.
