<div align="center">
  <a href="https://www.runash.in">
    <img src="public/runashlogo.jpg" width="100" height="100" alt="RunAsh AI logo" />
  </a>
  <h1>RunAsh AI</h1>

  <p>Open-source agentic live commerce built for retail automation, real-time video workflows, and multimodal customer experiences.</p>
</div>

 

## Skills Playbooks

Use the repository playbooks in [`SKILLS/README.md`](./SKILLS/README.md) for repeatable workflows:

- [Frontend Feature Workflow](./SKILLS/frontend-feature-workflow.md)
- [Service Layer Change Workflow](./SKILLS/service-layer-change-workflow.md)
- [Auth & Payment Change Workflow](./SKILLS/auth-payment-change-workflow.md)
- [Docs Quality Review Workflow](./SKILLS/docs-quality-review-workflow.md)

## Introduction

## What RunAsh AI is


RunAsh AI is a Next.js-based platform for building and running AI-assisted commerce and livestream experiences.
It combines storefront and content workflows with agentic tooling, authentication, and data services.
The repository includes product UI, API routes, and shared service/data layers used by the platform.

 
For AI-oriented contribution guidance, see [LLMs.txt](./LLMs.txt).

## Features

## Quickstart


### 1) Install dependencies

```bash
pnpm install
```

### 2) Configure environment

- [ ] Create `.env.local` in the project root.
- [ ] Add the required secrets for auth, AI providers, database, and integrations used in your environment.

### 3) Start the development server

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Core architecture summary

- **Next.js App Router application**
  - `app/` contains routes, pages, layouts, and API handlers.
  - `components/` contains reusable UI and feature modules.
- **Service and integration layer**
  - `services/` and `lib/services/` contain orchestration and business logic.
  - `lib/auth/`, `lib/workflow/`, and integration-specific modules support platform capabilities.
- **Data and model layer**
  - `lib/db/`, `lib/repositories/`, and `lib/data/` contain database access and domain modeling.
  - See `DRIZZLE_ORM.md` for ORM and schema conventions.

## Documentation index

### Working agreements and team docs

- [AGENTS.md](AGENTS.md)
- [AGENTS.override.md](AGENTS.override.md)
- [TEAM_GUIDE.md](TEAM_GUIDE.md)

### Platform and engineering guides

- [PLATFORM_GUIDE.md](PLATFORM_GUIDE.md)
- [RUNASH-AUTH.md](RUNASH-AUTH.md)
- [DRIZZLE_ORM.md](DRIZZLE_ORM.md)
- [SECURITY.md](SECURITY.md)
- [LLMs.txt](LLMs.txt)
- [MCP.md](MCP.md)

## Deployment checklist

- [ ] Build locally: `pnpm build`
- [ ] Validate runtime env vars for target environment
- [ ] Deploy via Vercel (recommended) or your Node hosting platform
- [ ] Verify `/`, auth, and key API routes in the deployed environment

## Contribution checklist

- [ ] Create a branch from `main`
- [ ] Implement and test changes locally (`pnpm dev`, `pnpm build`, `pnpm lint`)
- [ ] Keep docs updated when behavior or architecture changes
- [ ] Open a pull request with a clear summary and validation notes

## License


  <p>Open-source agentic live commerce platform for retail automation, real-time video generation, and multimodal workflows.</p>
</div>

## Overview
RunAsh AI combines live streaming, AI-assisted creation tooling, seller operations, and commerce enablement into a unified platform.

## Seller operations modules
- Seller dashboard now uses live summary metrics from `/api/seller/dashboard/summary`.
- Orders and inventory tabs are integrated with backend CRUD endpoints (`/api/orders`, `/api/products`, `/api/products/:id`).
- Seller business configuration is now API-backed (`GET/PUT /api/seller/settings`) for persisted operations.
- Payout tab is API-backed (`GET /api/seller/payouts`) with settlement summaries and weekly history.
- Inventory supports inline stock edits and guarded deletes for production workflows.

## Quickstart
1. Clone repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (copy `.env.example` to `.env.local` when available).
4. Run development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`.

## Validation commands
```bash
npm run lint
npm run build
```

## Documentation index
### Governance and collaboration
- [AGENTS.md](AGENTS.md) – repository-wide contributor/agent rules
- [AGENTS.override.md](AGENTS.override.md) – high-priority override policies (service/payment scope)
- [TEAM_GUIDE.md](TEAM_GUIDE.md) – team workflow, ownership, release process
- [LLMs.txt](LLMs.txt) – compact machine-readable guidance
- [MCP_SERVER.md](MCP_SERVER.md) – MCP integration guidance
- [SKILLS/README.md](SKILLS/README.md) – reusable workflow playbooks
- [CODEX_CUSTOM_INSTRUCTIONS.md](CODEX_CUSTOM_INSTRUCTIONS.md) – custom Codex instruction policy

### Product and platform docs
- [PLATFORM_GUIDE.md](PLATFORM_GUIDE.md)
- [RUNASH-AUTH.md](RUNASH-AUTH.md)
- [SECURITY.md](SECURITY.md)
- [DRIZZLE_ORM.md](DRIZZLE_ORM.md)
- [RunAsh_AI_Pay.md](RunAsh_AI_Pay.md)
- [RUNASH_PAY_BUSINESS_IMPLEMENTATION.md](RUNASH_PAY_BUSINESS_IMPLEMENTATION.md)

## Contribution
1. Create a focused branch.
2. Keep code + docs in sync.
3. Run validation commands.
4. Open PR with summary, risks, and rollback notes.

 
Team process, ownership boundaries, and delivery policy are documented in [`TEAM_GUIDE.md`](./TEAM_GUIDE.md).

We welcome contributions to the RunAsh AI live streaming platform. To contribute, follow these steps:

## Contributor and Agent Governance


- Default repository policy: [AGENTS.md](./AGENTS.md)
- Temporary/higher-priority directives: [AGENTS.override.md](./AGENTS.override.md)

## License

 
1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Agent Operations

- [MCP Server Guide](./MCP_SERVER.md)
- [Agent Working Guide](./AGENTS.md)
- [Team Guide](./TEAM_GUIDE.md)

MIT and Apache-2.0.

