# Ledger Service Test Plan

This document outlines the comprehensive test suite required to ensure the integrity, security, and correctness of the Ledger Service. The Ledger is the source of truth for user balances and the audit trail for the exchange.

## 1. User Domain

Focus on user identity and lifecycle management.

- **`test_create_user_success`**: Verify a user can be successfully created with valid fields (email, name).
- **`test_create_user_duplicate_email`**: Ensure creating a user with an already registered email fails.
- **`test_get_user_success`**: Verify retrieving a user by ID returns the correct details.
- **`test_get_user_not_found`**: Verify requesting a non-existent ID returns a Not Found error.
- **`test_update_user_details`**: Verify updating user attributes (e.g., name, preferences) persists correctly.
- **`test_delete_user_check`**: Verify user deletion logic (soft delete vs hard delete) and ensure referenced data (accounts) handles this gracefully.

## 2. Account Domain

Focus on the containers for user funds (Cash vs Custody accounts).

- **`test_create_account_success`**: Verify creating an account linked to a valid user succeeds.
- **`test_create_account_invalid_user`**: Verify creating an account for a non-existent user fails.
- **`test_list_accounts_by_user`**: Verify `list_accounts` returns all and only the accounts belonging to a specific user ID.
- **`test_update_account_status`**: Verify changing account status (e.g., `active` -> `frozen`) works.
- **`test_delete_account_with_nonzero_balance`**: **Critical**. Ensure an account cannot be deleted if it contains wallets with non-zero balances.

## 3. Wallet Domain

Focus on individual asset balances within an account.

- **`test_create_wallet_success`**: Verify creating a wallet for a specific Asset ID within an Account.
- **`test_create_duplicate_wallet`**: Verify an account cannot have two wallets for the same Asset ID.
- **`test_get_wallet_correct_balance`**: Verify `available`, `locked`, and `total` balances are returned correctly.
- **`test_update_wallet_status`**: Verify freezing a wallet prevents further operations (if implemented).

## 4. Fund Locking & Balance Logic (Core Trading Logic)

Focus on the mechanism that reserves funds for orders.

- **`test_lock_funds_success`**: Verify that locking funds decreases `available` and increases `locked` by the exact amount. `total` should remain unchanged.
- **`test_lock_funds_insufficient_balance`**: Verify that attempting to lock more than `available` fails with a clear error.
- **`test_unlock_funds_success`**: Verify that unlocking returns funds from `locked` to `available`.
- **`test_unlock_funds_excessive`**: Verify you cannot unlock more than is currently locked.
- **`test_consume_locked_funds`**: Verify that spending funds (e.g., trade execution) decreases `locked` and `total` (funds leave the wallet).

## 5. Order Domain (Ledger Perspective)

Focus on the lifecycle of an order's impact on the ledger.

- **`test_record_order_buy_limit_locks_quote`**: Verify a Buy Limit order locks the correct amount of Quote Asset (Price \* Quantity).
- **`test_record_order_sell_limit_locks_base`**: Verify a Sell Limit order locks the correct amount of Base Asset (Quantity).
- **`test_record_order_market_buy_locks_estimate`**: (If supported) Verify Market Buy locks an estimated amount or fails if price not provided.
- **`test_cancel_order_unlocks_funds`**: Verify that cancelling an open order fully releases the locked funds back to `available`.
- **`test_reject_order_if_instrument_invalid`**: Verify rejection if the `instrument_id` does not exist or assets are missing.

## 6. Asset & Instrument Domain

Focus on metadata definitions.

- **`test_create_asset_success`**: Verify creation of Fiat and Crypto assets.
- **`test_create_instrument_success`**: Verify creation of a trading pair (Instrument) linking two valid Assets.
- **`test_create_instrument_invalid_assets`**: Verify creation fails if Base or Quote asset IDs are invalid.

## 7. Trade & Settlement (Ledger Entries)

Focus on the immutable audit trail and movement of funds between users.

- **`test_record_trade_settlement`**: **Critical**. Simulate a trade execution:
  - Buyer: Debit Quote Asset (Locked), Credit Base Asset.
  - Seller: Debit Base Asset (Locked), Credit Quote Asset.
  - Verify all 4 wallet balances update correctly.
- **`test_record_trade_creates_ledger_entries`**: Verify that a trade generates `LedgerEntry` records for auditing.
  - Entry 1: Debit Buyer USD.
  - Entry 2: Credit Seller USD.
  - Entry 3: Debit Seller BTC.
  - Entry 4: Credit Buyer BTC.
- **`test_double_entry_integrity`**: Verify that for any transaction event, the sum of debits equals the sum of credits (accounting equation).

## 8. Deposits & Withdrawals

Focus on external funding.

- **`test_deposit_increases_balance`**: Verify a confirmed deposit increases `available` and `total` balance.
- **`test_withdrawal_request_locks_funds`**: Verify requesting a withdrawal locks the amount immediately.
- **`test_withdrawal_complete_deducts_funds`**: Verify completion removes the locked funds.
- **`test_withdrawal_insufficient_funds`**: Verify withdrawal request is rejected if balance is too low.
