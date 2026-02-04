Great question — this is the _real_ “Postgres-at-scale” stuff people only learn after something hurts 😄
I’ll go point-by-point and tie each one back to your **candles workload**, not generic DB theory.

---

# First: what **VACUUM** actually is (in plain English)

Postgres **never deletes or updates rows in place**.

When you:

- UPDATE a row
- DELETE a row

Postgres:

- marks the old row as **dead**
- writes a new version elsewhere

Those dead rows sit there until **VACUUM** comes along and cleans them up.

So:

- more writes → more dead tuples
- more dead tuples → bigger tables + indexes
- bigger tables → slower scans + heavier IO

This matters _a lot_ for candle systems.

---

# 1️⃣ **“1m candles dominate 95% of writes”**

This will absolutely be true for you.

### Why?

Let’s say:

- 500 instruments
- 1 candle per minute per instrument

That’s:

```
500 * 60 * 24 ≈ 720,000 rows/day
```

Now compare:

- 5m candles → 1/5th
- 1h candles → 1/60th
- 1d candles → 1/1440th

So your write distribution looks like:

| Interval | Write volume |
| -------- | ------------ |
| 1m       | 🔥🔥🔥🔥🔥   |
| 5m       | 🔥           |
| 1h       | 😴           |
| 1d       | 😴😴         |

**1m candles are the write monster.**

---

# 2️⃣ **“Higher intervals are almost read-only”**

Once a 1h or 1d candle is closed:

- it will _never change_
- no updates
- no deletes
- no rewrites

So:

- no dead tuples
- no index churn
- extremely stable storage

This is the _perfect_ kind of data for Postgres.

Meanwhile 1m candles:

- constantly inserted
- sometimes backfilled
- sometimes corrected
- often deleted (retention policies)

That creates churn.

---

# 3️⃣ **“Vacuum becomes painful”** ← THIS IS THE BIG ONE

Imagine one table holding:

- hot 1m candles
- cold 1d candles
- 10+ years of data

When Postgres runs VACUUM:

- it must scan **the whole table**
- including ancient, immutable rows
- just to clean up a small hot section

### Symptoms you’ll see:

- Autovacuum runs constantly
- High IO usage
- Slow inserts
- Bloating disk size
- “Why is this table 3× larger than expected?”

This is _not_ theoretical — this bites trading systems hard.

### Partitioning or splitting fixes this because:

- VACUUM runs per partition
- Cold partitions are skipped
- Hot partitions stay small and fast

---

# 4️⃣ **“Index bloat on the interval column”**

In a single table:

```sql
INDEX (instrument_id, interval, open_time)
```

That index:

- stores entries for **all intervals**
- gets rewritten every time 1m data churns
- contains tons of duplicate `interval='1m'` values

Because Postgres indexes are also MVCC:

- old index entries stick around
- vacuum has to clean them too
- index grows faster than table

You’ll see:

- index size >> table size
- cache inefficiency
- slower index scans

If you split tables:

- the `interval` dimension disappears
- indexes become smaller
- vacuum load drops

---

# 5️⃣ **“Different storage policies per interval”**

This one is _strategic_, not just technical.

You might want:

| Interval | Retention | Storage                 |
| -------- | --------- | ----------------------- |
| 1m       | 90 days   | Postgres + Redis        |
| 5m       | 1 year    | Postgres                |
| 1h       | 5 years   | Postgres                |
| 1d       | Forever   | BigQuery / cold storage |

If everything lives in one table:

- retention logic gets messy
- deletes hurt
- vacuum spikes

If intervals are separated:

- you can **DROP PARTITIONS** (instant delete)
- archive cleanly
- move cold data off disk

Dropping a partition is O(1).
Deleting rows is O(n).

This difference is enormous.

---

# The key insight (this is the “aha”)

> **The problem isn’t row count.
> It’s write churn + MVCC + long-lived data in the same table.**

That’s why:

- time-series systems
- exchanges
- metrics platforms

…almost always end up separating **hot write-heavy data** from **cold immutable data**.

---

# What _you_ should do right now (important)

### Do **NOT** prematurely split tables.

Instead:

1. **Single candle table**
2. **Time partitioned**
3. Composite index
4. Measure:
   - autovacuum frequency
   - index size growth
   - insert latency

Only split by interval if:

- vacuum becomes noisy
- index bloat appears
- retention needs diverge

You’re thinking about the right problems **before** they bite — that’s exactly what you want.

---

If you want, next we can:

- design a **partitioning scheme** (monthly vs weekly)
- simulate growth numbers
- talk about TimescaleDB vs vanilla Postgres
- or design the **retention + archival pipeline**

This is good architecture thinking — keep going.
