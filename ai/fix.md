## What You're Missing

---

### Futures

**What you have:** 6 tests, all `#[ignore]`. None are live.

**What's missing (i.e., everything):**

| Test                                                   | Verifies                                                        |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| `test_futures_long_initial_margin_locked`              | Open long at 10× leverage → only 10% of notional locked         |
| `test_futures_short_initial_margin_locked`             | Short side mirrors same margin locking                          |
| `test_long_and_short_opposite_sides_settle`            | Long profit exactly equals short loss (zero-sum)                |
| `test_mtm_profitable_long_credited_daily`              | Mark-to-market: long PnL credited each settlement cycle         |
| `test_mtm_losing_short_debited_daily`                  | Mark-to-market: short debited; if margin too low → liquidation  |
| `test_funding_rate_positive_long_pays_short`           | Long debited, short credited by `notional × rate`               |
| `test_funding_rate_negative_short_pays_long`           | Short debited, long credited                                    |
| `test_funding_rate_zero_no_transfer`                   | Rate = 0 → no wallet movement                                   |
| `test_futures_position_close_releases_margin`          | Close position → margin wallet fully unlocked                   |
| `test_dated_futures_expiry_at_settlement_price`        | At expiry, PnL = `(settlement_price - entry_price) × qty`       |
| `test_futures_maintenance_breach_triggers_liquidation` | Equity < maintenance → force-close                              |
| `test_futures_long_short_margin_netting`               | Opposing positions in same account net margin requirement       |
| `test_perpetual_basis_convergence`                     | Funding causes perp price to converge toward spot               |
| `test_cross_asset_futures_different_settlement`        | BTC-perp settles in USD, gold-future settles in USD differently |

---

### Margin Trading

**What you have:** margin buy locks partial collateral, maintenance margin check, forced liquidation, cross-margin equity, isolated margin loss capped. Most are live but stubs (assertions on manually-mutated wallets).

**What's missing:**

| Test                                                       | Verifies                                                                |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `test_margin_call_warning_then_forced_reduction`           | Equity at 30% → warning issued; at 20% → partial close forced           |
| `test_leverage_multiplies_pnl_symmetrically`               | 10× long gaining $100 of price = $1,000 wallet gain                     |
| `test_borrow_interest_accrues_hourly`                      | Holding margin position overnight debits interest each period           |
| `test_increasing_isolated_margin_lowers_liquidation_price` | Adding margin to isolated position moves liquidation threshold          |
| `test_cross_margin_profitable_position_offsets_losing`     | BTC up $2k, ETH down $500 → net equity = cash + $1,500                  |
| `test_isolated_margin_loss_does_not_affect_cross_wallet`   | Isolated position wiped → main wallet completely unchanged              |
| `test_leverage_10x_buy_locked_is_10_percent_of_notional`   | Specific numeric: 1 BTC @ $50k with 10× → $5,000 locked                 |
| `test_portfolio_margin_reduces_requirement_on_hedge`       | Long BTC + short BTC-perp → net margin < sum of both individual margins |

---

### Short Selling

**What you have:** short sell locks quote collateral, settlement credits quote to seller, cover buy releases collateral, rejected on cash account.

**What's missing:**

| Test                                               | Verifies                                                                               |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `test_short_sell_no_borrow_available_rejected`     | If borrow pool for BTC is exhausted, new short rejected                                |
| `test_borrow_fee_accrues_on_short_position`        | Holding short overnight debits daily borrow rate                                       |
| `test_forced_buy_in_closes_short_position`         | Lender recalls borrow → position force-closed at market                                |
| `test_short_pnl_positive_when_price_falls`         | Short at $50k, price drops to $40k → $10k profit realized on close                     |
| `test_short_pnl_negative_when_price_rises`         | Short at $50k, price rises to $60k → $10k loss on close                                |
| `test_short_sell_on_no_borrow_list_asset_rejected` | AAPL is on no-borrow list → short blocked for all accounts                             |
| `test_partial_cover_reduces_borrow_proportionally` | Cover 0.5 of 1.0 BTC short → borrow reduced by 50%, collateral proportionally released |

---

### Fee Structure

**What you have:** maker < taker invariant, taker fee deducted exactly, dust trade ≥ 0, VIP lower rate, fee account always grows.

**What's missing:**

| Test                                                     | Verifies                                                             |
| -------------------------------------------------------- | -------------------------------------------------------------------- |
| `test_maker_rebate_credits_maker_wallet`                 | If maker fee = negative (rebate), maker's wallet increases           |
| `test_fee_rate_per_asset_class`                          | Crypto fee ≠ equity fee ≠ futures fee                                |
| `test_volume_tier_threshold_correct_rate`                | >$1M 30-day volume → tier 2 rate applied                             |
| `test_fee_applies_to_filled_quantity_not_order_quantity` | Order for 2 BTC, fill 1 BTC → fee on 1 BTC notional, not 2           |
| `test_fee_zero_on_maker_rebate_funded_by_taker`          | Maker rebate + taker fee = positive net for exchange                 |
| `test_settlement_fee_split_buyer_taker_seller_maker`     | Specific: buyer pays taker fee, seller pays maker fee, both verified |

---

### Ledger Integrity

**What you have:** entry count per trade, double-entry balance (zero-sum per asset), order placement entries, fund locking entries.

**What's missing:**

| Test                                             | Verifies                                                         |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| `test_every_debit_has_matching_credit`           | For every negative entry, a positive entry of same amount exists |
| `test_ledger_entry_references_correct_event`     | All entries from one trade share the same `event_id`             |
| `test_historical_balance_at_timestamp`           | Query balance at T₁ < T₂ returns pre-trade balance               |
| `test_ledger_audit_trail_complete`               | Every wallet mutation has a traceable ledger entry               |
| `test_concurrent_ledger_writes_no_phantom_reads` | 10 simultaneous trades → ledger sum correct, no lost entries     |

---

### Concurrency & Resilience

**What you have:** concurrent settlement with optimistic locking retry, concurrent liquidation idempotency, fee account contention.

**What's missing:**

| Test                                                       | Verifies                                                                |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `test_concurrent_orders_same_account_total_locked_correct` | 5 concurrent order placements → locked never exceeds starting available |
| `test_settlement_retry_after_transient_db_error`           | Simulated connection drop → retry succeeds, no double-settle            |
| `test_optimistic_lock_version_increments_on_update`        | Each wallet update bumps version number, stale write fails              |
| `test_wallet_update_rejected_on_stale_version`             | Two concurrent readers, second writer loses with OptimisticLockingError |

---

### Corporate Actions (Equity)

**What you have:** cash dividend to all holders, 2:1 split doubles shares, 1:2 reverse split + odd-lot cash payout.

**What's missing:**

| Test                                                     | Verifies                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| `test_dividend_on_zero_share_holder_credits_nothing`     | Account holding 0 shares receives $0 dividend                            |
| `test_split_does_not_affect_cash_wallet`                 | 2:1 split doubles shares; USD wallet completely unchanged                |
| `test_split_updates_locked_shares_proportionally`        | Shares locked in open sell order also doubled on split                   |
| `test_spin_off_creates_new_asset_wallet_for_all_holders` | IBM spins off Kyndryl → each IBM holder gets proportional KD wallet      |
| `test_tender_offer_buys_shares_at_premium`               | Holder tenders 10 AAPL @ $220 (10% premium) → receives cash, shares gone |
| `test_rights_issue_credits_subscription_rights`          | Holder gets right to buy new shares at discount; right is a new asset    |

---

### Position Limits

**What you have:** oversized order rejected, max notional cap (#ignore), open interest cap (#ignore), concentration limit (#ignore).

**What's missing (all unimplemented):**

| Test                                                | Verifies                                                  |
| --------------------------------------------------- | --------------------------------------------------------- |
| `test_sell_order_exempted_from_concentration_limit` | Sells always allowed even if over concentration threshold |
| `test_position_limit_enforced_before_fund_lock`     | Rejection before any wallet mutation                      |
| `test_per_instrument_limit_independent_of_global`   | BTC-USD limit separate from ETH-USD limit                 |

---

### Cross-Asset / Integration

**What you have:** conservation of money (Postgres), basic critical path.

**What's missing:**

| Test                                            | Verifies                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------- |
| `test_options_settlement_and_spot_independent`  | Settling an option does not affect spot wallet                      |
| `test_futures_margin_and_spot_wallets_separate` | Futures margin wallet ≠ spot USD wallet                             |
| `test_multi_asset_portfolio_total_conservation` | Sum(all wallets across all assets) conserved across all trade types |
| `test_cross_instrument_hedged_margin_reduction` | Long BTC spot + short BTC-perp → net margin requirement reduced     |

---

### The Path to Thousands

You're at **137** because your Track B files are mostly stubs. The 6 futures tests being `#[ignore]` alone represents ~40-60 real tests when fully implemented. The rough math:

| Domain                | Current   | Target |
| --------------------- | --------- | ------ |
| Spot                  | ~40       | ~80    |
| Options               | ~27       | ~120   |
| Futures               | ~2 (live) | ~100   |
| Margin/Short          | ~15       | ~80    |
| Fees                  | ~5        | ~30    |
| Deposits/Wallets      | ~12       | ~50    |
| Ledger integrity      | ~5        | ~40    |
| Corporate actions     | ~3        | ~30    |
| Concurrency           | ~4        | ~25    |
| Position limits       | ~1        | ~20    |
| Regulatory/Compliance | 0         | ~50    |

That's 625 at the low end. Add property-based tests for each invariant (conservation of money, double-entry balance, available+locked=total, fee ≥ 0) running 1,000 cases each, and thousands is genuinely achievable and necessary.
