# Build stage
FROM rust:latest AS builder

WORKDIR /app

# Install protobuf compiler
RUN apt-get update && apt-get install -y protobuf-compiler

# Copy the Cargo.toml and Cargo.lock to cache dependencies
# We maintain the directory structure matching the repo to make relative paths work
# Note: This assumes the build context is the repository root
COPY services/ledger/Cargo.toml services/ledger/Cargo.lock ./services/ledger/
# Copy root workspace files if they exist (optional, but good practice)
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir -p services/ledger/src && echo "fn main() {}" > services/ledger/src/main.rs

# Build dependencies
WORKDIR /app/services/ledger
RUN cargo build --release
RUN rm src/*.rs

# Copy the proto files (needed for build.rs)
# We copy them to /app/proto so that ../../proto works from /app/services/ledger
WORKDIR /app
COPY proto ./proto

# Copy the actual source code
COPY services/ledger/src ./services/ledger/src
COPY services/ledger/build.rs ./services/ledger/build.rs
# Copy sqlx-data.json for offline compilation
COPY services/ledger/.sqlx ./services/ledger/.sqlx

# Build the actual application
WORKDIR /app/services/ledger
# Touch main.rs to force rebuild
# We need to ensure that sqlx works.
# Since we don't have a database connection during build, we must use offline mode.
# If sqlx-data.json is missing, this build will fail unless we provide DATABASE_URL.
RUN touch src/main.rs
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim
WORKDIR /app
# Install OpenSSL and CA certificates (needed for HTTP/database connections)
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/ledger /app/ledger
CMD ["/app/ledger"]
