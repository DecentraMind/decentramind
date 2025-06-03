# [DecentraMind](https://decentramind.club/)

[DecentraMind](https://decentramind.club/) is a **web3 contribution market** for real builders and a place to help projects to build better communities by progressive ownership model. Built on [AO](https://ao.arweave.dev/), The platform leverages AO's process-based architecture to facilitate community building, task management, and reward distribution in a truly decentralized manner.

## The Background

We all know how much damage the unfair airdrop system, with most of the rules being opaque, has brought to the industry. The airdrop model generated most robot users, which made the project more cautious in airdropping bounties. In the end, the project team exchanged airdrop bait for a large number of robot users and a small number of real users. These false data drove up the speculation of related tokens prices in the secondary market, which obviously turned into a Ponzi game.

## What Will be Changed?

Projects that adopt progressive ownership model by using our dapp will allocate community tokens to real builders who truly contribute to the community rather than to speculative man-made robots. 

In this way, they will build stronger, healthier, more stable and vibrant communities.

For the real builders, receiving crypto bounties through meaningful contributions is a better approach than buying them based on rumors.

## Technology Stack

- **Frontend**: Vue 3, Nuxt 3, TypeScript
- **Styling**: Tailwind CSS, Nuxt UI, Nuxt UI Pro
- **State Management**: Pinia
- **Backend**: AO Process (Decentralized compute on Arweave)
- **Authentication**: Arweave wallet(support Wander wallet extension and Wander wallet mobile app), Vouch verification
- **Testing**: Vitest
- **Package Manager**: pnpm

## Features

- **Community Management**
  - Community creation with unique UUIDs
  - Community administration
  - Private Quest Space access

- **Task Management**
  - Multiple task types (Space, Promotion, Bird, Good Read)
  - Submission validation
  - Scoring system

- **Bounty System**
  - Configurable bounty distribution
  - Transaction tracking
  - History and reports

- **Invite System**
  - Code generation
  - Usage tracking
  - Community and task-level invites

- **User Management**
  - Areave wallet login
  - X (Twitter) based Vouch verification
  - Profile customization

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- pnpm (v9.4.0 or later)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The dev server will running at `http://localhost:3007`

## Deployment

### Deploy to AO Network

```bash
# the name is optional
bash> aos DecentraMind-test --wallet your-wallet.json
DecetraMind-test aos-2.0.0> .load AO/DecentraMind.lua
```

## Development

### Project Structure

- `AO/` - AO process source files
- `components/` - Vue components
- `composables/` - Reusable composition functions
- `pages/` - Application routes
- `server/` - Server API endpoints and periodic tasks
- `stores/` - Pinia stores
- `utils/` - Utility functions
- `lang/` - i18n language files

### Contributin
See [Contributin](./docs/CONTRIBUTION.md)

### TODOs
-[ ] remove all canCreateCommunity related code