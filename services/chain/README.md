# Local Chain Service

This service sets up a local blockchain development environment using Hardhat, designed to simulate Ethereum Mainnet (L1) and Optimism (L2) networks. It allows for testing smart contracts, deployment scripts, and cross-chain interactions without spending real ETH.

## Features

- **Simulated Networks**: Runs local instances of L1 (Mainnet) and L2 (Optimism) chains using `edr-simulated`.
- **Smart Contract Development**: Includes sample contracts (`Counter`, `Greeter`, `Lock`, `MyToken`) written in Solidity.
- **Deployment Tools**: Utilizes Hardhat Ignition for declarative deployments.
- **Interaction Scripts**: Helper scripts for deploying tokens, reading accounts, and sending transactions on L2.
- **Testing Framework**: Supports testing with Viem and Foundry (via `forge-std`).

## Getting Started

### Prerequisites

- Node.js (v22.10.0 recommended)
- npm or yarn

### Installation

1.  Navigate to the `services/chain` directory:
    ```bash
    cd services/chain
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run:
    ```bash
    npx hardhat node
    ```

### Running the Chain

To start the local Hardhat node (which simulates the configured networks):

```bash
npx hardhat node
```

This will spin up the local blockchain and provide you with a set of funded test accounts.

## Project Structure

- `contracts/`: Solidity smart contracts.
  - `Counter.sol`: Simple counter contract.
  - `Greeter.sol`: Basic greeting contract.
  - `Lock.sol`: Time-lock contract example.
  - `MyToken.sol`: ERC20 token example.
- `ignition/modules/`: Hardhat Ignition deployment modules.
  - `Counter.ts`: Module to deploy the Counter contract.
- `scripts/`: Utility scripts for interaction and deployment.
  - `deploy.ts`: General deployment script.
  - `deploy-token.ts`: Script to deploy `MyToken`.
  - `read-accounts.ts`: helper to view account balances.
  - `send-op-tx.ts`: Example of sending a transaction on the Optimism L2 chain.
- `hardhat.config.ts`: Configuration file defining networks (`hardhatMainnet`, `hardhatOp`, `sepolia`) and plugins.

## Usage

### Compilation

Compile the smart contracts:

```bash
npx hardhat compile
```

### Deployment

Deploy contracts using Hardhat Ignition:

```bash
npx hardhat ignition deploy ignition/modules/Counter.ts --network localhost
```

Or run standalone scripts:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

### Testing

Run the test suite:

```bash
npx hardhat test
```

## Networks Configuration

The `hardhat.config.ts` is set up with the following networks:

- **`hardhatMainnet`**: A simulated L1 chain.
- **`hardhatOp`**: A simulated Optimism L2 chain.
- **`sepolia`**: Configuration for deploying to the Sepolia testnet (requires `.env` setup).

## Environment Variables

To use the Sepolia network or other external providers, create a `.env` file in the root of this directory and add:

```env
SEPOLIA_RPC_URL=your_sepolia_rpc_url
SEPOLIA_PRIVATE_KEY=your_private_key
```
