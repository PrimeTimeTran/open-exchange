---
title: 'Open Exchanges: Revising the Model'
description: 'Honest review of what we predicted incorrectly and how data reshaped strategy.'
date: '2024-04-26'
author: 'Open Exchange Team'
series: 'Market Architecture Series'
part: 9
---

### Strategic Framing: Ego Kills Returns

The most dangerous thing in finance is falling in love with your own model. We started this journey with a set of assumptions about user behavior, liquidity efficiency, and fees. The OpenTest deployment proved some of them wrong.

This post is an honest accounting of our failures. Admitting what didn't work is more valuable than celebrating what did, because it shows we are listening to the data.

### Technical & Numerical Reality

**Failed Assumption 1:** "Retail users care about low fees above all else."

- **Data:** Users largely ignored the 0.1% fee pool in favor of the 0.3% pool because the latter had deeper liquidity.
- **Correction:** Liquidity depth matters more than fee optimization. Users pay for execution reliability.

**Failed Assumption 2:** "Volatility will mean revert quickly."

- **Data:** Price deviations lasted longer than expected (hours, not minutes) because arbitrage bots were less active on our specific pair than modeled.
- **Correction:** We cannot rely solely on external arbitrageurs. We need internal market-making incentives.

**Failed Assumption 3:** "Complex UI is fine for advanced traders."

- **Data:** "Pro" features had near-zero usage. Simple swap interface had 95% of volume.
- **Correction:** Simplification. We are deprecating the advanced chart view for launch.

### Capital Implications

We are pivoting our resource allocation based on these findings.

**Decision:**
Reallocating development and capital budgets.

- **From:** Advanced Trading UI & Low-Fee Marketing.
- **To:** Liquidity Incentive Programs & Simple UX.
- **Allocation Shift:** Moving $10k from "Marketing" budget to "Liquidity Mining Rewards" to attract deeper pools, solving the execution quality issue directly. We fund the product, not the ad.
