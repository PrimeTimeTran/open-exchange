# Ledger Service Refactoring Roadmap

This roadmap outlines critical architectural improvements required to ensure the Ledger service is production-ready, correct, and robust.

## Phase 3: Testing & Validation

- [x] **Unit Tests**: Add unit tests for `WalletService` and `LedgerService` with mocked repositories covering edge cases.
- [ ] **Integration Tests**: Expand `settlement_test.rs` to cover concurrency scenarios and error conditions.
