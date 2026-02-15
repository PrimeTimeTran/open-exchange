# Open Exchanges: Liquidity Depth and Price Fragility — Part V

### Strategic Framing: Liquidity is a Product

Liquidity is not just a number; it is the product we sell to traders. Traders buy liquidity; the price they pay is the fee + slippage. If our "product" is poor (high slippage), no amount of marketing will fix it. We need to quantify exactly what our capital buys us in terms of market quality.

We move from abstract "TVL" numbers to concrete "Trade Impact" metrics. This shift in perspective ensures we focus on the utility of the exchange, not just vanity metrics.

### Technical & Numerical Reality

Based on our OpenTest deployment ($50k liquidity), we have modeled the price impact for various trade sizes.

- **Pool Depth:** $50,000 ($25k / $25k).
- **Constant Product Formula:** `x * y = k`

**Slippage Table:**

| Trade Size | Expected Price Impact |
| :--------- | :-------------------- |
| $500       | ~2.0%                 |
| $1,000     | ~4.1%                 |
| $2,500     | ~9.5%                 |

- **Observation:** A $50k pool is "fragile" for trades larger than $500. This is acceptable for retail exploration but insufficient for serious volume.
- **Stabilization:** We tracked how quickly arbitrageurs corrected price deviations.
  - _Average Time to Re-peg:_ < 3 blocks (approx 36 seconds).

### Capital Implications

The data is clear: to support $1k+ trades with professional-grade slippage (< 0.5%), we need significantly more depth.

**Decision:**
We define our "Launch Threshold" based on this data. We will not market the exchange aggressively until we can guarantee a specific Quality of Service (QoS).

- **Target:** Support $2,000 trades with < 1% slippage.
- **Required Liquidity:** ~$200,000.
- **Action:** We will structure our liquidity incentives (mining/bonding) specifically to reach this $200k floor. Growth before this point is counterproductive, as users will just experience bad execution.
