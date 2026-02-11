# Ledger Service Refactoring Roadmap

This roadmap outlines critical architectural improvements required to ensure the Ledger service is production-ready, correct, and robust.

## Phase 1: Core Data Integrity (High Priority)

- [x] **Switch to Decimal Math**: Replace all `f64` usage for currency/quantities with `rust_decimal::Decimal` to prevent floating-point errors.
- [ ] **Dynamic Asset Handling**: Remove hardcoded "BTC"/"USD" strings. Use `Instrument` data to determine `base_asset` and `quote_asset` dynamically.
- [ ] **Error Handling**: Replace `unwrap()`, `unwrap_or_default()`, and `unwrap_or(0.0)` with proper error propagation (`?`) to prevent silent failures and "ghost" records.

## Phase 2: Concurrency & Consistency (High Priority)

- [ ] **Database Transactions**: Wrap `process_trade_event` (Ledger Insert + Wallet Updates) in a single `sqlx::Transaction` to ensure atomicity.
- [ ] **Optimistic Locking**: Add a `version` column to the `wallets` table and implement optimistic locking to prevent race conditions during concurrent updates.

## Phase 3: Testing & Validation

- [ ] **Unit Tests**: Add unit tests for `WalletService` and `LedgerService` with mocked repositories covering edge cases.
- [ ] **Integration Tests**: Expand `settlement_test.rs` to cover concurrency scenarios and error conditions.
