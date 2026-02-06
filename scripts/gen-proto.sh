#!/bin/bash

# ==========================================
# Protocol Buffer Generation Script
# ==========================================
# This script generates code from .proto files for:
# 1. CLIENT Service (TypeScript)
# 2. Matching Engine (Go)
# 3. Market Data Service (Go)
# 4. Ledger Service (Rust - Handled via cargo build)
# ==========================================

# ------------------------------------------
# Configuration
# ------------------------------------------
PROTO_DIR="./proto"
CLIENT_OUT_DIR="./services/client/src/proto"
MATCHING_OUT_DIR="./services/matching/proto"
MARKET_OUT_DIR="./services/market/proto"

# Ensure protoc-gen-ts is available
PROTOC_GEN_TS="./node_modules/.bin/protoc-gen-ts_proto"

# Create output directories if they don't exist
mkdir -p "$CLIENT_OUT_DIR"
mkdir -p "$MATCHING_OUT_DIR"
mkdir -p "$MARKET_OUT_DIR"

echo "🚀 Starting Proto Generation..."

# ------------------------------------------
# 1. CLIENT Service (TypeScript)
# ------------------------------------------
echo "📦 [Client] Generating TypeScript code..."
# Generates TS types for all protos to ensure the CLIENT UI can interact with all services
find "$PROTO_DIR" -name "*.proto" | xargs protoc \
  --plugin="protoc-gen-ts_proto=${PROTOC_GEN_TS}" \
  --ts_proto_out="${CLIENT_OUT_DIR}" \
  --ts_proto_opt=esModuleInterop=true \
  --ts_proto_opt=forceLong=string \
  --ts_proto_opt=useOptionals=all \
  --ts_proto_opt=outputServices=grpc-js \
  --proto_path="${PROTO_DIR}" 

# ------------------------------------------
# 2. Matching Engine (Go)
# ------------------------------------------
echo "⚙️  [Matching] Generating Go code..."
# Generates Go code for all protos as the Matching Engine is the central core
# Includes: common, matching, ledger, helloworld
find "$PROTO_DIR" -name "*.proto" | xargs protoc \
  --go_out="${MATCHING_OUT_DIR}" \
  --go_opt=paths=source_relative \
  --go-grpc_out="${MATCHING_OUT_DIR}" \
  --go-grpc_opt=paths=source_relative \
  --proto_path="${PROTO_DIR}"

# ------------------------------------------
# 3. Market Service (Go)
# ------------------------------------------
echo "📈 [Market] Generating Go code..."
# Generates Go code only for the Market service definitions.
# Dependencies like 'common' are resolved via go.mod 'replace' directive pointing to Matching Engine.
find "$PROTO_DIR/market" -name "*.proto" | xargs protoc \
  --go_out="${MARKET_OUT_DIR}" \
  --go_opt=paths=source_relative \
  --go-grpc_out="${MARKET_OUT_DIR}" \
  --go-grpc_opt=paths=source_relative \
  --proto_path="${PROTO_DIR}"

# ------------------------------------------
# 4. Ledger Service (Rust)
# ------------------------------------------
echo "📒 [Ledger] Rust code generation is handled via 'build.rs' during compilation."
echo "   (No action needed here)"

echo "✅ Done!"
