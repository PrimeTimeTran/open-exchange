# Testing Accounts/Ledgers/DB

We're building a Stock/Crypto/Options/Futures exchange.
It's essential to our business that our books balance, we dont have money disappear or appear out of no where.

- Auditing tests entrypoint `./tests/audit_books.sh`
- DB models `services/client/src/prisma/schema.prisma`
- DB seed entrypoint `services/client/src/prisma/seeds/dev.ts`

# Instructions

There are things which are always true in a properly designed accounting system.
After reviewing the models of schema.prisma, use SQL inside of audit_book.sh to deterministically evaluate the state of our system.

For now we focus on the state of our books after seeding accounts(and corresponding models) but later we'll run these tests after real orders,
when they're matched and settled.

When you're done, append to the section below, the tests we have, and what they cover.

## Tests

- [x] 1. System Solvency (Internal Flow vs External Holdings)
  - **Description**: Verifies that the total amount of each asset held in all user wallets matches the net external flow (Total Deposits - Total Withdrawals). This ensures no money is created or destroyed within the system.
  - **SQL Logic**: `Sum(Wallet.total) == Sum(Deposit.amount) - Sum(Withdrawal.amount)`

- [x] 2. Wallet Consistency (Available + Locked = Total)
  - **Description**: Ensures that for every individual wallet, the sum of `available` and `locked` balances exactly equals the `total` balance. This prevents internal accounting errors within a wallet.
  - **SQL Logic**: `Wallet.total - (Wallet.available + Wallet.locked) == 0`

- [x] 3. Locked Funds Audit (Wallet Locked vs Open Orders)
  - **Description**: Verifies that the `locked` balance in user wallets correctly matches the funds required for all Open Orders.
  - **Logic**:
    - For **Buy Orders** (Spot): `Locked Amount = Price * Quantity`.
    - For **Sell Orders** (Spot): `Locked Amount = Quantity`.
    - **SQL Logic**: `Wallet.locked == Sum(OpenOrders.RequiredLockAmount)` (filtered for Spot instruments).

- [x] 4. Ledger Integrity (Wallet Balance vs Ledger Entries)
  - **Description**: Verifies that the total balance of a wallet matches the sum of all its historical ledger entries. This ensures the immutable ledger is the source of truth for current balances.
  - **SQL Logic**: `Wallet.total == Sum(LedgerEntry.amount)` (grouped by Account).

- [x] 5. Negative Balance Check
  - **Description**: A sanity check to ensure no wallet has a negative available, locked, or total balance, which would indicate a serious logic error or race condition.
  - **SQL Logic**: `Wallet.available < 0 OR Wallet.locked < 0 OR Wallet.total < 0` (Should return 0 rows).

- [x] 6. Order Integrity (Quantity vs Filled)
  - **Description**: Ensures that an Order's `quantityFilled` is non-negative and never exceeds the original `quantity`.
  - **SQL Logic**: `Order.quantityFilled < 0 OR Order.quantityFilled > Order.quantity` (Should return 0 rows).
