# Open Exchanges: Designing for Bots, Volatility, and Reality — Part II

### Strategic Framing: The Adversarial Nature of Markets

Exchanges do not operate in a vacuum. They operate in a dark forest populated by automated agents (bots) programmed to exploit any inefficiency. Designing an exchange under the assumption that participants will "play nice" is a fatal error. We design for the reality of Maximum Extractable Value (MEV), arbitrage, and high-frequency trading.

Bots are not villains; they are infrastructure. They enforce price consistency between venues. Our goal is not to ban them, but to design a system where their profit-seeking behavior contributes to, rather than subtracts from, the health of our market.

### Technical & Numerical Reality

In an Automated Market Maker (AMM), liquidity acts as the shock absorber for price discovery. "Slippage" is the cost paid by a trader to move the price.

- **Scenario:** A $10,000 buy order enters a pool with $100,000 liquidity.
- **Result:** The price moves significantly.
- **Arbitrage:** Bots immediately see this price deviation compared to external markets and trade against the pool to bring the price back in line.

We model liquidity depth as a function of "Price Fragility."

- **Formula:** `Price Impact = (Trade Size) / (Pool Depth + Trade Size)`
- **Implication:** To support professional trading volumes, we need non-linear liquidity scaling. Naive `x * y = k` curves are robust but capital inefficient for stable assets.

We analyze historical data to determine the "Minimum Viable Liquidity" required to keep slippage under 0.5% for standard trade sizes ($1k - $5k). If the pool cannot support this, it is not ready for public trading.

### Capital Implications

Recognizing bots as inevitable shapes our fee structure and liquidity incentives.

**Decision:**
We structure fees to capture value from arbitrage flow without discouraging it.

- **Action:** Implementing dynamic fees or fee tiers that account for volatility.
- **Capital Allocation:** We reserve a portion of the treasury to seed initial liquidity, acting as the "Market Maker of Last Resort" to prevent early volatility from wiping out organic LPs. This capital is not "expense"; it is "deployed infrastructure."
