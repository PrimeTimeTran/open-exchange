# Build stage
FROM rust:1.75-bookworm as builder

WORKDIR /app

# Install protobuf compiler
RUN apt-get update && apt-get install -y protobuf-compiler

# Create a dummy project to cache dependencies
RUN cargo new --bin ledger
WORKDIR /app/ledger

# Copy manifests
COPY ./Cargo.toml ./Cargo.lock ./

# Build only dependencies
# (We need to comment out workspace members if we were in a workspace, but we are standalone here)
# Since we don't have a Cargo.lock yet, this might fail if we try to build without it, 
# but cargo build will generate it.
RUN cargo build --release
RUN rm src/*.rs

# Copy source code
COPY ./src ./src
COPY ./build.rs ./build.rs

# We need the proto files which are in ../../proto relative to the service context
# In docker-compose, we usually mount or copy them.
# Let's assume the context is the service directory, so we need to copy protos from outside?
# Docker doesn't like copying from outside context.
# We should update docker-compose to set context to root or copy protos in.
# For now, let's assume we mount them or copy them in the dockerfile if the context is set right.
# Actually, looking at matching service:
# matching service uses `COPY ./proto/common/ ...` so it seems they might have local copies?
# No, `scripts/gen-proto.sh` generates code into `services/matching/proto`.
# But for Rust with `tonic-build`, we usually compile from `.proto` source at build time.
# So we need the `.proto` files available in the image.

# Let's assume we will mount the proto directory or copy it.
# The `docker-compose.yml` for matching uses `context: ./services/matching`.
# But `volumes: - ./proto:/app/proto`.
# So for development, we can mount it.
# For production build, we need to COPY it.
# But `COPY` can't go up directories.
# So we might need to set context to root in docker-compose, OR copy proto files into services/ledger/proto before build.
# OR, we assume we are running in dev mode with volumes mostly.

# Let's check how matching service does it.
# matching/Dockerfile:
# COPY go.mod go.sum ./
# ...
# COPY . .
# It seems it copies everything in `services/matching`.
# And `scripts/gen-proto.sh` puts the generated files INTO `services/matching/proto`.
# Rust `tonic` generates files into `target/debug/build/...`.

# So we need access to the .proto files.
# OPTION 1: Run gen-proto.sh to copy .proto files into services/ledger/proto (not generate code, just copy files).
# OPTION 2: Use docker build context at root.

# For now, I will assume we will mount `./proto` to `/app/proto` in dev.
# But for the build step `RUN cargo build --release`, it needs the files to compile.
# So we MUST have the files.
# I'll rely on the user to either run a script to copy protos, or I'll assume they are there.
# Best practice: Docker build context is the service dir. We can't access ../../proto.
# So we should copy ../../proto to ./proto temporarily during build or use root context.

# Let's stick to the pattern:
# We will assume we need to `cp -r ../../proto ./proto` before building if we were doing a real build.
# BUT, for the "ambitious" user, I'll setup a `Dockerfile.dev` that expects the volume mount.

# This is the production Dockerfile (multi-stage)
# We will omit the build step here that relies on protos unless we solve the context issue.
# Wait, for the build to succeed, `build.rs` runs. `build.rs` reads `../../proto`.
# Inside docker, `../../proto` is outside `/app`.
# So we need to put protos in `/app/proto` and update `build.rs` to look there if in Docker.

# Let's start with Dockerfile.dev for development.
