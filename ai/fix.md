Now I have a full picture. Several major things landed that I wasn't expecting. Let me score all five.

---

## Full Re-Grade — All 5 Criteria

---

### 1. Architecture & Separation of Concerns — **B+** _(unchanged)_

The layer is clean. `memory/withdrawal.rs` exists as a proper separate infra file. `domain/utils.rs` is a sensible shared utility extraction. No regressions.

Two proto leaks remain — same ones as before:

- `domain/wallets.rs:4` — `use crate::proto::common`
- `domain/settlement/service.rs:15` — `use crate::proto::ledger::Match`

These are the last two things between B+ and A.

---

### 2. Error Handling — **A-** ↑ _(was B+)_

This is the biggest jump. Three things landed together:

- **Zero `.lock().unwrap()` in production code.** Every mutex in `memory.rs` is now handled.
- **`domain/utils.rs:6`** — `parse_decimal` now returns `Result<Decimal, AppError::Internal>`. The seven silent `unwrap_or_default()` helpers duplicated across `margin.rs`, `funding.rs`, `borrow.rs`, `liquidation.rs`, `position_limits.rs`, `corporate_actions.rs`, `exercise.rs` are gone. That was a meaningful fix.
- **`fees/constants.rs`** uses `.expect("Invalid MAKER_FEE_RATE constant")` — correct use of `expect` for compile-time constants.

Three minor things keep it from a clean A:

- `memory.rs:314-315, 392, 405` — `Uuid::parse_str(account_id).unwrap_or_default()` silently produces a nil UUID on bad input in wallet lookup functions
- `api/deposits.rs:114` — `Decimal::from_str(&req.amount).unwrap_or_default()` treats a malformed deposit amount as zero instead of rejecting it
- `infra/mappers/order_mapper.rs:69` — `Decimal::from_str(...).unwrap_or(Decimal::ZERO)` in the proto→domain mapper

The infra `unwrap_or_default()` on nullable SQL columns (instrument_repository, wallet_repository, etc.) is fine — that's the correct handling for `Option<T>` from a nullable DB row.

---

### 3. Test Coverage — **B+** ↑ _(was B-)_

The test directory expanded significantly. New files that directly address previous gaps:

- **`error_paths_test.rs`** — explicitly tests error variants, which was the main gap called out
- **`order_service_failure_test.rs`** — failure path coverage for the order service
- **`precision_test.rs`** — decimal precision edge cases, close to what property-based tests would catch
- **`wallets_test.rs`, `market_orders_test.rs`, `short_selling_test.rs`, `wash_trade_test.rs`, `time_in_force_test.rs`** — broad scenario coverage

Two things keep it from A:

- No `proptest` or `quickcheck` property-based tests. `precision_test.rs` covers specific cases but not randomized invariant checking across the decimal arithmetic
- Tests inside `domain/ledger/service.rs` and `domain/wallets.rs` still use `.unwrap()` heavily — fine for test code, but `expect("context")` would make failures significantly more debuggable

---

### 4. Domain Modeling — **B** ↑ _(was C+)_

The wallet fields being `Decimal` in the test assertions (`assert_eq!(updated.available, Decimal::from_str("1.5").unwrap())`) confirms `available`, `locked`, and `total` are now stored as `Decimal` in the domain model — no more string parse/serialize cycle on every balance operation. That was the single biggest domain modeling gap and it's closed.

`domain/utils.rs` with a proper `parse_decimal` returning `Result` is clean shared infrastructure.

Three things remain for A:

- **No newtype wrappers** — `AccountId`, `WalletId`, `Amount` are still raw `Uuid`/`Decimal`. The compiler won't catch a transposed argument.
- **`Uuid::nil()` placeholders** — `tenant_id: Uuid::nil()`, `account_id: Uuid::nil()` in `deposits.rs`, `withdrawals.rs`, `assets.rs` constructors. Domain objects should not be constructible in an invalid state.
- **`domain/wallets.rs`** still imports `use crate::proto::common` — whatever is still using proto in the wallet domain layer is the last coupling to resolve.

---

### 5. Code Consistency — **B** ↑ _(was B-)_

Two concrete improvements:

- **`domain/utils.rs`** — the `parse_decimal` duplication across 7 files is now a single shared function. This was explicitly called out and properly fixed.
- **`memory/withdrawal.rs`** — one piece of the `memory.rs` monolith extracted into its own file, consistent with `memory/instrument.rs`.

Two things remain for A:

- **`memory.rs` is still a monolith** — orders, wallets, assets, fills, ledger, and trades are all still in one file. `withdrawal.rs` and `instrument.rs` were extracted but the rest weren't.
- **`domain/wallets.rs` is a flat file** — it doesn't follow the `model.rs` / `repository.rs` / `service.rs` triad pattern that `orders/`, `accounts/`, `deposits/`, `withdrawals/` all follow now.

---

## Summary

| Criterion        | Before | **Now**  |
| ---------------- | ------ | -------- |
| Architecture     | B+     | **B+**   |
| Error Handling   | B+     | **A-** ↑ |
| Test Coverage    | B-     | **B+** ↑ |
| Domain Modeling  | C+     | **B** ↑  |
| Code Consistency | B-     | **B** ↑  |

Four of the five criteria improved. Error handling is now genuinely strong. To close the remaining gaps toward A/A+ across the board: finish the `wallets.rs` proto removal + triad refactor, add newtype ID wrappers, fix the three remaining silent `unwrap_or_default` in infra/API, split `memory.rs` into per-entity files, and drop in `proptest` for the decimal arithmetic.
