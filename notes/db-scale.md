## Step 1: Time dimension (this part is easy)

**1-minute candles for 10 years**

- Minutes per day: `1,440`
- Days per year: `365.25`
- Years: `10`

```
1,440 × 365.25 × 10 ≈ 5,259,600 minutes
```

👉 **~5.26 million rows per instrument**

Lock that number in — we’ll reuse it everywhere.

---

## Step 2: Instruments (this is where it explodes)

We’ll do this _by asset class_.

---

### 📈 Equities (NYSE + NASDAQ)

- NYSE ≈ 2,400
- NASDAQ ≈ 3,300
- ETFs, ADRs, misc ≈ ~1,500

Let’s round generously:

```
≈ 7,000 equity instruments
```

Rows:

```
7,000 × 5.26M ≈ 36.8 billion rows
```

Already big — but totally manageable with time partitioning.

---

### 🪙 Crypto (Spot)

Across major exchanges:

- Coinbase, Binance, Kraken, OKX, Bitfinex
- Overlapping symbols, but different markets

Let’s say:

```
~2,000 unique spot pairs
```

Rows:

```
2,000 × 5.26M ≈ 10.5 billion rows
```

Still fine.

---

### 📉 Futures (this is sneaky)

For futures you don’t have “one instrument”.

You have:

- Symbol (ES)
- Expiry (monthly, quarterly)
- Rollovers

Let’s estimate:

- ~100 major futures roots (equities, rates, commodities, FX)
- ~12 active expiries per year
- 10 years

```
100 × 12 × 10 = 12,000 futures instruments
```

Rows:

```
12,000 × 5.26M ≈ 63 billion rows
```

Now we’re warming up.

---

### 🧨 Options (this is where sanity leaves the room)

Let’s do this _conservatively_.

#### Per underlying equity:

- Strikes: ~50–200 (varies wildly)
- Expiries: ~20–40 active
- Calls + Puts: ×2

Let’s pick **very conservative** numbers:

```
100 strikes × 30 expiries × 2 = 6,000 options
```

Now apply this to:

- ~3,000 actively optioned equities

```
3,000 × 6,000 = 18 million option instruments
```

Rows:

```
18,000,000 × 5.26M
≈ 94,680,000,000,000 rows
≈ 95 TRILLION rows
```

Let that sink in.

That’s **just equity options**.

---

### 🧮 Crypto options (smaller but still nasty)

Let’s say:

- ~50 underlyings
- ~1,000 options per underlying

```
50,000 instruments
```

Rows:

```
50,000 × 5.26M ≈ 263 billion rows
```

A rounding error next to equities options.

---

## 🧾 Grand Total (order of magnitude)

| Asset class    | Rows   |
| -------------- | ------ |
| Equities       | ~37B   |
| Crypto spot    | ~10B   |
| Futures        | ~63B   |
| Equity options | ~95T   |
| Crypto options | ~0.26T |

### 🔥 **TOTAL ≈ ~96 TRILLION rows**

And this is still _underestimating_ for liquid names like SPY, AAPL, TSLA.

---

## Why Jensen’s NVLink comment doesn’t save you

Even if:

- NVLink bandwidth > internet traffic
- GPUs can scan trillions of rows/sec

You still have:

- Storage limits
- Metadata limits
- Index limits
- Cost limits
- **Demand limits** (nobody queries most of this)

> **The bottleneck is not bandwidth.
> The bottleneck is “why are you storing this at all?”**

---

## The critical realization (this is the big one)

**You should NOT store 1m candles for options long-term.**

Real exchanges and vendors:

- Keep **tick or 1m data short-term**
- Downsample aggressively:
  - 1m → 5m → 1h → 1d

- Or compute candles _on demand_ for illiquid options

For options:

- Many strikes trade **once per day**
- Many minutes have **no trades**
- Storing OHLC per minute is meaningless

---

## What professionals actually do

### Equities / Futures

- 1m candles: yes
- multi-year retention: yes

### Options

- Trade-driven candles only
- Sparse time series
- Often **event-based**, not time-based

### Vendors

- Separate storage tiers
- Columnar + compression
- Symbol pruning
- User-driven aggregation

---

## Final anchor thought (very important)

> **The market data problem is not a database problem.
> It’s a _data modeling restraint_ problem.**

If you naïvely store _everything at max resolution forever_,
**no hardware product — NVLink included — will save you.**

---

If you want next, we can:

- design a _realistic_ candle retention policy per asset class
- talk about sparse candles vs dense candles
- estimate actual storage cost ($/month) for your idea
- or discuss how data vendors _actually_ price this stuff

This is exactly the right rabbit hole to go down.
