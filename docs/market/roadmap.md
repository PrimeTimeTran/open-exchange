# Market Service Todo

The Market Service is responsible for aggregating raw trade data into consumable metrics (OHLCV, Last Price) and broadcasting them to clients. It effectively "watches" the Matching Engine.

## Core Logic (The Aggregator)

- [ ] **Trade Ingestion**: Listen for `TradeExecuted` events from the Matching Engine.
- [ ] **OHLCV Calculation**: Aggregate trades into "Candles" (Open, High, Low, Close, Volume) for standard timeframes (1m, 5m, 1h, 1d).
- [ ] **Ticker Updates**: Maintain a real-time cache of the "24h Volume", "24h Change", and "Last Price" for every symbol.
- [ ] **Order Book Depth**: (Optional) Maintain a copy of the Order Book snapshot for visualization (if the Matching Engine publishes depth updates).

## Integration Points (Inputs/Outputs)

- [ ] **gRPC Server**: Implement the `MarketService` defined in `proto/market`.
- [ ] **Stream `SubscribePrices`**: Implement the gRPC streaming endpoint to push real-time price updates to the Admin/Client UI.
- [ ] **Snapshot `GetLatestPrice`**: Implement endpoint to get the current state of a symbol (for initial page load).
- [ ] **History `GetCandles`**: Implement RPC to fetch historical OHLCV data so charts aren't empty on load.

## Data Storage & Persistence

- [ ] **Hot Cache (Redis)**: Store the "Last Price" and "24h Stats" for millisecond-latency access.
- [ ] **Time-Series DB (TimescaleDB / InfluxDB)**: Store historical OHLCV candles for charting.
- [ ] **Bootstrapping / Backfill**:
  - When the service starts fresh, populate the DB with mock historical data (e.g., last 1 year of BTC prices).
  - _Why?_ Users expect to see a "1W" or "1Y" chart immediately, not just a flat line starting from today.

## Current Focus (MVP)

- [ ] Update `proto` to include `GetCandles(symbol, start, end, resolution)`.
- [ ] Implement a **Mock Data Generator** that runs on startup:
  - Generates 365 days of OHLCV data for supported symbols.
  - Stores it in an in-memory slice (or SQLite/Postgres if persistence is needed immediately).
- [ ] Connect the `client` dashboard to `GetCandles` to render the initial chart.
- [ ] Connect the `client` dashboard to `SubscribePrices` to animate the chart tail in real-time.
