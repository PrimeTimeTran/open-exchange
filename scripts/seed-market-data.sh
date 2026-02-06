#!/bin/bash
echo "Seeding market data for BTCUSDT..."

# 1D view: 1h interval (need ~24 points)
docker compose exec market go run cmd/backfill/main.go -symbol BTCUSDT -interval 1h -limit 50

# 1W view: 4h interval (User asked for 3h, Binance supports 2h/4h. Using 4h. Need ~42 points)
docker compose exec market go run cmd/backfill/main.go -symbol BTCUSDT -interval 4h -limit 50

# 1M view: 1d interval (Need ~30 points)
# Also covers YTD/1Y if we fetch enough
docker compose exec market go run cmd/backfill/main.go -symbol BTCUSDT -interval 1d -limit 400

# 3M view: 3d interval (Need ~30 points)
docker compose exec market go run cmd/backfill/main.go -symbol BTCUSDT -interval 3d -limit 50

# ALL view: 1w interval
docker compose exec market go run cmd/backfill/main.go -symbol BTCUSDT -interval 1w -limit 300

echo "Done!"
