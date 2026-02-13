# Testing Accounts/Ledgers/DB

A Stock/Crypto/Options/Futures exchange requires thorough auditing & testing.
It's essential to our business that books balance and we dont have money appear/disappear out of nowhere.

The following files are important for testing, modeling, and seeding.

- Auditing tests entrypoint `./tests/audit_books.sh`
- DB models `services/client/src/prisma/schema.prisma`
- DB seed entrypoint `services/client/src/prisma/seeds/seed.ts`

# Instructions

Write tests which will audit a REAL database.
Review the the tests, models inside of schema.prisma, and use SQL inside of audit_db.sh to identify if there are any issues.

For now, we'll focus on the state of the DB being correct AFTER seeding. In the future, we'll have these tests run in our prod DB as well.

In other words, write tests that guarantee that the state of our DB is correct given the relationships of each model with one another and how many of one or the other we have.

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

- [x] 7. Order-Fill Reconciliation
  - **Description**: Verifies that the sum of all fills for an order matches the order's recorded `quantityFilled`. This ensures that the order status accurately reflects its execution history.
  - **SQL Logic**: `Order.quantityFilled == Sum(Fill.quantity) WHERE Fill.orderId = Order.id`

- [x] 8. Fee Collection Audit
  - **Description**: Verifies that the total fees recorded in all Fills have been correctly credited to the System Fee Account.
  - **SQL Logic**: `Sum(Fill.fee) (converted to base currency) == Wallet(FeeAccount).total`

- [x] 9. Trade Settlement Audit
  - **Description**: Ensures that for every Spot Trade, the Buyer received the Base Asset and the Seller received the Quote Asset (less fees), and that these movements are recorded in the Ledger.
  - **SQL Logic**: `Trade(Quantity * Price) == LedgerEntry(Seller, QuoteAsset) + LedgerEntry(Buyer, BaseAsset)` (simplified)
