#!/bin/bash
set -e

# Configuration
TEST_DB_URL="postgres://postgres@localhost:5432/open-exchange-test"

echo "🛠️  Setting up Test Database: open-exchange-test"

# Navigate to client service where Prisma is configured
# Resolving absolute path
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."
CLIENT_DIR="$PROJECT_ROOT/services/client"

pushd "$CLIENT_DIR" > /dev/null

# Install deps if needed (usually cached)
if [ ! -d "node_modules" ]; then
    npm ci
fi

# Temporarily rename .env to avoid Prisma loading it and ignoring our env var override
if [ -f ".env" ]; then
    mv .env .env.bak
fi

# Run Prisma Migrate Reset
# This drops the DB, creates it, and runs migrations
echo "🔄 Running Prisma Migrate Reset..."
# We explicitly set DATABASE_URL and ensure no .env file interferes
# We use a trap to ensure .env is restored even if migration fails
trap 'if [ -f ".env.bak" ]; then mv .env.bak .env; fi' EXIT

DATABASE_URL="$TEST_DB_URL" npx prisma migrate reset --force --schema=./src/prisma/schema.prisma --skip-seed

echo "✅ Test Database Ready!"
# Restoration handled by trap
popd > /dev/null
