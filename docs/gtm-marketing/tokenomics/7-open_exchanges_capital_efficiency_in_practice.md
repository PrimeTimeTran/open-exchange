# Open Exchanges: Capital Efficiency in Practice — Part VII

### Strategic Framing: The LP's Dilemma

Providing liquidity is an investment strategy, not a charity. The fundamental question for any LP is: "Did I make more money than I would have by just holding the assets?" This comparison (LP vs. HODL) determines the viability of our exchange. If LPs consistently lose money to Impermanent Loss (IL) despite fees, our liquidity will dry up.

We tracked our OpenTest position for 30 days to answer this question with real data, not projections.

### Technical & Numerical Reality

**30-Day Performance Report:**

- **Initial Portfolio Value:** $50,000 (at Day 0).
- **Asset Price Change:** Asset X appreciated +20%.
- **HODL Value:** If we held 50/50 without LPing: $55,000.
- **Current LP Value (Raw):** $54,545.
  - _Impermanent Loss:_ -$455 (approx 0.8%).
- **Fees Earned:** +$600 (1.2% yield).
- **Net LP Position:** $55,145.

**Result:** Net Positive (+0.26% over holding).
The fee revenue successfully offset the impermanent loss, even with a 20% price move.

### Capital Implications

The data validates the model for this volatility regime, but the margin is thin.

**Decision:**
We need to optimize Fee-to-Volume ratios.

- **Adjustment:** We are reviewing our fee tier. A 0.3% fee generated barely enough to cover IL.
- **Action:** For higher volatility pairs, we will implement a higher fee tier (0.5% or dynamic) to ensure LPs are compensated for risk.
- **Guidance:** We will publish these "LP vs HODL" calculators on the exchange dashboard so users can make informed capital decisions. Transparency builds long-term loyalty.
