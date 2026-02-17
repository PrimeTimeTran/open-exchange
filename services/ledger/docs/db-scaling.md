# Database Scaling Roadmap

This document outlines the trajectory for scaling the Ledger Service database infrastructure from its current state to a hyperscale architecture.

## 1. Current Architecture (Single Node)

- **Topology:** Single PostgreSQL Primary Instance.
- **Connection Model:** Configurable Connection Pool (Default: 50 connections).
- **Concurrency Control:** Application-level `FOR UPDATE` row locking prevents race conditions.
- **Pros:** Simple, strongly consistent (ACID), easy to back up and reason about.
- **Cons:** Vertical scaling limit (CPU/RAM of one machine). Writes and Reads compete for the same resources.
- **Suitability:** Suitable for MVP, startup phase, and moderate throughput (thousands of TPS).

## 2. Phase 1: Read Replicas (Read Scaling)

- **Trigger:** Read latency increases due to heavy reporting, dashboard refreshes, or user queries, but Write volume is stable.
- **Topology:**
  - **1 Primary (Writer):** Handles all `INSERT`, `UPDATE`, `DELETE`, and `FOR UPDATE` locking.
  - **N Replicas (Readers):** Asynchronous copies of the Primary.
- **Code Implementation:**
  - Maintain two connection pools: `write_pool` and `read_pool`.
  - Update Repositories to route `get()`, `list()`, and `query()` methods to `read_pool`.
  - Keep transactional logic and locking on `write_pool`.
- **Pros:** Linearly scalable Read throughput. Offloads reporting queries from the transactional core.
- **Cons:** Replication lag (Reads might be slightly stale). Added complexity in configuration.

## 3. Phase 2: Vertical Sharding (Domain Splitting)

- **Trigger:** Write volume exceeds the capacity of a single machine, or distinct domains have different scaling needs.
- **Topology:** Multiple distinct physical databases.
  - `ledger_db`: Wallets, Entries, Orders.
  - `users_db`: Profiles, KYC, Auth.
  - `market_db`: Instruments, Tickers.
- **Code Implementation:**
  - Services (`LedgerService`, `UserService`) talk to their respective databases independently.
  - Cross-domain data (e.g., User Name on a Ledger Statement) is fetched via gRPC calls to the owning service, not SQL JOINs.
- **Pros:** Isolates failures (User DB down doesn't stop Matching Engine). Allows independent scaling of domains.
- **Cons:** No SQL Joins across domains. Application logic must handle data stitching.

## 4. Phase 3: Horizontal Sharding (Hyperscale)

- **Trigger:** A single table (e.g., `LedgerEntry`) grows too large for one disk (Petabytes) or Write throughput exceeds single-node IOPS.
- **Topology:** Multiple identical database nodes (`Shard 1` ... `Shard N`), each holding a subset of rows.
- **Sharding Strategy:**
  - **Key-Based:** `shard_id = tenant_id % N` or `user_id % N`.
  - **Tenant-Based:** All data for "Tenant A" lives on Shard 1.
- **Code Implementation:**
  - **Application Router:** A generic `Repository` wrapper that inspects the request (e.g., `tenant_id`) and selects the correct Connection Pool.
  - **Transactions:** Transactions are scoped to a single shard. Cross-shard transactions are avoided or handled via Sagas (eventual consistency).
- **Pros:** Virtually infinite write scaling.
- **Cons:** Extremely high operational complexity. Rebalancing shards (moving data) is difficult. Reporting requires aggregation across all shards.
