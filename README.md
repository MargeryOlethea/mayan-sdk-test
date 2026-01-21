# 🧩 mayan-sdk-test

A minimal TypeScript setup created to help the **Mayan team** reproduce an SDK-related issue involving Solana swap transactions.

---

## Requirements

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- [Yarn](https://yarnpkg.com/)

---

## Installation

```bash
yarn install
```

## Running the project

```bash
yarn start
```

This command runs the TypeScript entry file using ts-node:

```text
src/index.ts
```

## Environment Variables

Create a .env file in the project root with the following example values:

```env
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=your_solana_private_key_here
```

## Dependencies

- `@mayanfinance/swap-sdk` — Mayan Swap SDK
- `@solana/web3.js` — Solana Web3 SDK
- `bs58` — Base58 encoding/decoding library
- `dotenv` — Environment variable loader
- `@types/node` — TypeScript type definitions for Node.js
