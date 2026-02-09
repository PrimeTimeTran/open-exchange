# Matching Service Todo

The Matching Engine is the core of the exchange. It maintains the Order Book state in memory and executes trades based on Price-Time priority.

## Core Logic (The Engine)

- [x] **Order Book Structure**: Implement efficient in-memory data structures (Red-Black tree or similar) for Bids and Asks.
- [x] **Price-Time Priority**: Ensure orders are matched by best price first, then by earliest arrival time.
- [x] **Limit Orders**: Support "Maker" orders that rest in the book.
- [x] **Market Orders**: Support "Taker" orders that eat liquidity immediately.
- [x] **Cancel Orders**: Ability to remove an order by ID efficiently.

## Integration Points (Inputs/Outputs)

- [x] **gRPC Server**: Implement the `MatchingEngine` service defined in `proto/matching`.
- [x] **Trade Execution Event**: When a match happens, emit an event containing:
  - `MakerOrderID`, `TakerOrderID`
  - `Price`, `Quantity`
  - `Symbol`
  - `Timestamp`
- [x] **Ledger Integration**: Send execution events to the Ledger service to swap balances (Atomic Settlement).
- [x] **Market Data Integration**: Send execution events to the Market service to update the "Last Price" and OHLCV candles.

## Persistence & Recovery

- [x] **Startup Recovery**: Mechanism to load open orders from a database or Write-Ahead Log (WAL) on service start. (Implemented via Ledger Sync)
- [x] **Graceful Shutdown**: Ensure state is saved before the container stops. (gRPC GracefulStop implemented)

## Advanced (Future)

- [x] **Partial Fills**: Handle cases where an order is only 50% filled.
- [ ] **Stop Loss / Take Profit**: Trigger orders based on price movement.
- [x] **Self-Trade Prevention**: Prevent a user from matching against their own order.
