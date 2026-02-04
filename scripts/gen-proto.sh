#!/bin/bash

# Directories
PROTO_DIR="./proto"
ADMIN_OUT_DIR="./services/admin/src/proto"
MATCHING_OUT_DIR="./services/matching/proto"

# Create output directories if they don't exist
mkdir -p $ADMIN_OUT_DIR
mkdir -p $MATCHING_OUT_DIR

# 1. Generate TypeScript Code (for Admin/Fulfillment)
echo "Generating TypeScript code..."
# We use the 'protoc-gen-ts_proto' plugin usually installed in node_modules/.bin
PROTOC_GEN_TS="./node_modules/.bin/protoc-gen-ts_proto"

# Find all .proto files
find $PROTO_DIR -name "*.proto" | xargs protoc \
  --plugin="protoc-gen-ts_proto=${PROTOC_GEN_TS}" \
  --ts_proto_out=${ADMIN_OUT_DIR} \
  --ts_proto_opt=esModuleInterop=true \
  --ts_proto_opt=forceLong=string \
  --ts_proto_opt=useOptionals=all \
  --ts_proto_opt=outputServices=grpc-js \
  --proto_path=${PROTO_DIR} 

# 2. Generate Go Code (for Matching Engine)
echo "Generating Go code..."
# Ensure you have protoc-gen-go and protoc-gen-go-grpc installed in your PATH
# go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
# go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

find $PROTO_DIR -name "*.proto" | xargs protoc \
  --go_out=${MATCHING_OUT_DIR} \
  --go_opt=paths=source_relative \
  --go-grpc_out=${MATCHING_OUT_DIR} \
  --go-grpc_opt=paths=source_relative \
  --proto_path=${PROTO_DIR}

echo "Done!"
