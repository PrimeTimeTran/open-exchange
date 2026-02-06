# Matching Service Todo

The Matching Engine is the core of the exchange. It maintains the Order Book state in memory and executes trades based on Price-Time priority.

## Core Logic (The Engine)

- [ ] **Order Book Structure**: Implement efficient in-memory data structures (Red-Black tree or similar) for Bids and Asks.
- [ ] **Price-Time Priority**: Ensure orders are matched by best price first, then by earliest arrival time.
- [ ] **Limit Orders**: Support "Maker" orders that rest in the book.
- [ ] **Market Orders**: Support "Taker" orders that eat liquidity immediately.
- [ ] **Cancel Orders**: Ability to remove an order by ID efficiently.

## Integration Points (Inputs/Outputs)

- [ ] **gRPC Server**: Implement the `MatchingEngine` service defined in `proto/matching`.
- [ ] **Trade Execution Event**: When a match happens, emit an event containing:
  - `MakerOrderID`, `TakerOrderID`
  - `Price`, `Quantity`
  - `Symbol`
  - `Timestamp`
- [ ] **Ledger Integration**: Send execution events to the Ledger service to swap balances (Atomic Settlement).
- [ ] **Market Data Integration**: Send execution events to the Market service to update the "Last Price" and OHLCV candles.

## Persistence & Recovery

- [ ] **Startup Recovery**: Mechanism to load open orders from a database or Write-Ahead Log (WAL) on service start.
- [ ] **Graceful Shutdown**: Ensure state is saved before the container stops.

## Advanced (Future)

- [ ] **Partial Fills**: Handle cases where an order is only 50% filled.
- [ ] **Stop Loss / Take Profit**: Trigger orders based on price movement.
- [ ] **Self-Trade Prevention**: Prevent a user from matching against their own order.
