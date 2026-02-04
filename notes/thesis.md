I built a simplified exchange to understand trade matching, settlement, and market data pipelines.
I intentionally scoped instruments and scale, but designed the system so the constraints are explicit.

Then:

- why Redis exists
- why Postgres is authoritative
- why candles are pre-aggregated
- why options data explodes
- why you didn’t use Kafka yet
