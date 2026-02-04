# Ledger Service

The Ledger service is a Rust-based microservice responsible for managing financial transactions,
balances, and double-entry accounting records within the exchange platform. It communicates with other services via gRPC.

## Prerequisites

- **Rust**: Latest stable version (install via [rustup](https://rustup.rs/)).
- **Docker**: For running the database and other dependent services.
- **Protobuf Compiler (`protoc`)**: Required for generating gRPC code.
  - MacOS: `brew install protobuf`
  - Ubuntu: `apt install -y protobuf-compiler`

## Project Structure

```
services/ledger/
├── Cargo.toml          # Rust dependencies and package configuration
├── build.rs            # Build script for compiling Protobuf files
├── src/
│   └── main.rs         # Application entry point
├── Dockerfile          # Production Docker image definition
└── Dockerfile.dev      # Development Docker image with hot-reload
```

## Running Locally

### 1. Environment Setup

Ensure you have the required environment variables. You can set them inline or use a `.env` file (if `dotenv` is configured).

### 2. Install Dependencies

Fetch and compile the dependencies:

```bash
cargo build
```

This step will also compile the Protobuf definitions found in `../../proto`.

### 3. Run the Service

To run the service in development mode:

```bash
cargo run
```

The service will start listening on port `50052` (as defined in `src/main.rs`).

### 4. Watch Mode (Hot Reload)

For a better development experience, use `cargo-watch` to automatically restart the server on file changes:

```bash
cargo install cargo-watch
cargo watch -x run
```

## Running with Docker

This service is part of the main `docker-compose` setup.

To start the ledger service along with the rest of the stack:

```bash
# From the root of the workspace
docker-compose up ledger
```

This uses `Dockerfile.dev` which includes `cargo-watch` for hot reloading inside the container.

## Database Migrations

This service uses `sqlx` for database interactions.

1.  **Install SQLx CLI**:

    ```bash
    cargo install sqlx-cli
    ```

2.  **Run Migrations**:
    ```bash
    # Ensure DATABASE_URL is set
    sqlx migrate run
    ```

## Testing

To run unit and integration tests:

```bash
cargo test
```
