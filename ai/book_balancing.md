# Testing Accounts/Ledgers/DB

It's very important we ensure our DB is correct at all times.
We want to maintain and expand upon a list of tests which help us to confidently
move forward building out the system.

The entrypoint to these test are `./tests/audit_books.sh`

# Current Tests

These tests are currently implemented in `tests/audit_books.sh`.

### 1. System Solvency (External Flow vs Internal Holdings)

Checks if the total assets held in user wallets match the net inflow of assets (Deposits - Withdrawals).

- **Query**: Compares `SUM(Wallet.total)` against `SUM(Deposit.amount) - SUM(Withdrawal.amount)` per asset.
- **Goal**: Ensure money isn't being created or destroyed out of thin air (except for trading fees/pnl which should be accounted for, currently simple version).

### 2. Wallet Integrity (Internal Consistency)

Checks if the internal state of each wallet is consistent.

- **Query**: Checks `Wallet.total == Wallet.available + Wallet.locked`.
- **Goal**: Ensure no mathematical errors in updating wallet states.

### 3. Ledger Zero-Sum (Double Entry Accounting)

Checks if every trade event is balanced in the ledger.

- **Query**: Sums `LedgerEntry.amount` for each `trade` event per asset. Must equal 0.
- **Goal**: Ensure the double-entry ledger system is working for trades (Debits = Credits).

# Proposed Tests

We should add the following tests to harden the system further:

### 4. Ledger vs Wallet Reconciliation (History vs State)

The `Wallet` table acts as a snapshot/cache of the `Ledger`. We must ensure they match.

- **Query**: For each Account/Asset, `SUM(LedgerEntry.amount)` must equal `Wallet.total`.
- **Goal**: Ensure the history of transactions perfectly explains the current balance.

### 5. Order Book vs Wallet Locked Balance

Locked funds in wallets must exactly match the capital required for open orders.

- **Query**:
  - For Bids: `SUM(Order.price * Order.size)` (for quote asset) must equal `Wallet.locked` (quote asset).
  - For Asks: `SUM(Order.size)` (for base asset) must equal `Wallet.locked` (base asset).
- **Goal**: Ensure funds are correctly locked and unlocked during order placement and cancellation.

### 6. Negative Balance Check

Unless explicitly allowed (e.g., margin trading), balances should never be negative.

- **Query**: `SELECT count(*) FROM "Wallet" WHERE total < 0 OR available < 0 OR locked < 0`.
- **Goal**: Catch underflow bugs or race conditions allowing over-spending.

### 7. Fee Account Reconciliation

Ensure fees deducted from trades actually end up in the System Fee Account.

- **Query**: `SUM(Trade.fee)` vs `Wallet.total` (of the System Fee Account).
- **Goal**: Ensure revenue is not being lost.
