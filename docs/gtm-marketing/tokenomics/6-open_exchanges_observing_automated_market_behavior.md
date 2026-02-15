# Open Exchanges: Observing Automated Market Behavior — Part VI

### Strategic Framing: The Invisible Hand is a Bot

Within minutes of deploying our OpenTest pool, we observed the reality of modern markets: humans are rarely the first to trade. The first interactions came from MEV bots and arbitrage scrapers. This confirms that our exchange is part of a global, interconnected liquidity network.

We do not fight this. We observe it. Understanding how bots probe, attack, and utilize our liquidity is essential for protecting the treasury and regular users. We treat these bots as "unpaid stress testers."

### Technical & Numerical Reality

**Observations from the Wild:**

1.  **Time to First Interaction:** 12 minutes after contract verification.
2.  **Arbitrage Efficiency:** We observed price discrepancies of 5% between our pool and external oracles being corrected within 2 blocks.
3.  **Sandwich Attacks:** We monitored the mempool for front-running attempts.
    - _Frequency:_ Low (due to low volume).
    - _Risk:_ High for user slippage settings > 1%.

We mapped the "Arbitrage Cycle":
External Price Move -> Bot Detects Opportunity -> Bot Submits Tx -> Our Pool Rebalances -> Fee Generated.

### Capital Implications

The presence of bots confirms that our pricing mechanism works, but it also highlights risks.

**Decision:**
We are implementing "Slippage Protection" defaults in the UI to protect retail users from sandwich attacks.

- **UI Default:** Max slippage set to 0.5% (down from standard 1%).
- **Treasury Defense:** We will not use treasury funds to artificially defend the price against arbitrage. If the price moves, we let the bots move it. Fighting the market is a fast way to lose the treasury.
- **Architecture:** We are exploring batched execution or private RPC endpoints for future iterations to minimize MEV impact on users.
