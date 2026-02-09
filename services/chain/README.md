# Chain Service

## Overview

This is a POC repo for OpenC token and example contracts.

## Structure

- `contracts/` - Solidity contracts
- `scripts/` - Deployment and helper scripts
- `test/` - Unit tests
- `deployments/` - Deployed addresses per network
- `config/` - Network configs
- `utils/` - Future utilities like vesting scripts

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```

- Spin up local network of nodes
- Deploy OpenC to network

```sh
npx hardhat node
npx hardhat run scripts/deploy_openc.ts --network localhost

```
