# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**PredictArb** — arbitrage detection and trading platform for Polymarket & Kalshi prediction markets. Two apps in one repo:

- `api/` — NestJS backend (port 3001): WebSocket consumers, arb engine, REST API, Socket.io gateway
- `web/` — Next.js frontend (port 3000): dashboard, trading terminal, simulated live data

Full architecture: `prediction-market-platform-architecture.md`

---

## Commands

### API (`cd api/`)

```bash
npm run start:dev     # dev server with watch (port 3001)
npm run build         # TypeScript compile check
npm run start:prod    # serve compiled dist/main.js
npm run lint          # ESLint --fix
npm run test          # Jest unit tests
npm run test:e2e      # end-to-end tests

npx prisma generate              # regenerate Prisma client after schema changes
npx prisma migrate dev --name X  # create + apply a new migration
npx prisma studio                # GUI to browse DB
```

### Web (`cd web/`)

```bash
npm run dev       # Turbopack dev server (port 3000)
npm run build     # production build + TypeScript check
npm run lint      # ESLint
```

---

## Architecture

### Data flow (Phase 1 — current state)

```
Polymarket WS ──┐                              ┌── Socket.io ──► Next.js frontend
                ├──► ArbEngineService ──► Redis ┤
Kalshi WS ──────┘                              └── REST GET /api/arb/opportunities
```

`PolymarketWsService` and `KalshiWsService` each emit `price.tick` events via `EventEmitter2`. `ArbEngineService` listens with `@OnEvent('price.tick')`, calculates cross-exchange arb using `ArbCalculatorService`, and publishes hits to Redis (`arb:<slug>` key, 60s TTL) + re-emits `arb.detected`. `EventsGateway` (Socket.io) listens to both events and broadcasts to connected clients.

**Frontend is currently decoupled from the backend.** All live data comes from `web/hooks/useSimulatedSocket.ts` (mock intervals). To connect: set `NEXT_PUBLIC_WS_URL` and replace `useSimulatedSocket` with a real `socket.io-client` connection.

### API modules (`api/src/modules/`)

| Module | Responsibility |
|--------|---------------|
| `price-feed/` | WebSocket consumers for Polymarket (raw WS) and Kalshi (orderbook delta). Both normalize ticks to `PriceTick` and emit `price.tick` |
| `arb/` | `ArbCalculatorService` (pure math), `MarketMapperService` (slug↔exchangeId lookup from DB), `ArbEngineService` (orchestrates, writes Redis), `ArbController` (GET /api/arb/opportunities) |
| `gateway/` | `EventsGateway` (Socket.io gateway), `GatewayController` (GET /api/ws-info — Swagger docs for WS events) |
| `markets/` | CRUD for `MarketMapping` table — the join table linking Polymarket condition IDs to Kalshi tickers |
| `trading/` | REST endpoints for orders/positions. **Currently stubs** — all methods throw `NotImplementedException`. Phase 2: inject Polymarket CLOB SDK + Kalshi REST client |

### Shared types

`api/src/common/types.ts` is the canonical type source for the backend. The frontend has a parallel `web/lib/types.ts` — keep them in sync when changing domain types.

### Prisma (Prisma v7)

Schema: `api/prisma/schema.prisma`. Models: `MarketMapping`, `Order`, `Position`, `Alert`.

Prisma v7 uses `prisma.config.ts` (not `url=` in schema). Connection via `PrismaPg` adapter injected in `PrismaService`. Run `npx prisma generate` after any schema change.

### Frontend state (three Zustand stores in `web/store/`)

| Store | Owns |
|-------|------|
| `arb.store.ts` | Opportunities list, filter state (minRoi, searchQuery, selectedExchanges), selected row |
| `price.store.ts` | Per-slug price ticks, WebSocket connection status, account balance |
| `trade.store.ts` | Active market/exchange/side, order type, order book snapshot, recent orders |

### API docs (Swagger)

Available at `http://localhost:3001/docs` when the API is running. Tags: `arb`, `markets`, `trading`, `websocket`.

---

## Setup

```bash
# API
cd api
cp .env.example .env          # fill DATABASE_URL + REDIS_HOST/PORT
npx prisma migrate dev --name init
npm run start:dev

# Web (separate terminal)
cd web
cp .env.example .env.local    # set NEXT_PUBLIC_WS_URL=http://localhost:3001
npm run dev
```

Redis and PostgreSQL required locally. Free options: [Upstash](https://upstash.com) (Redis), [Supabase](https://supabase.com) (Postgres).

---

## What's not built yet (Phase 2+)

- `trading/trading.service.ts` — Polymarket CLOB SDK + Kalshi REST client integration
- Market mapping seed data (top 50 Poly↔Kalshi matches)
- Frontend ↔ backend connection (replace `useSimulatedSocket`)
- Auth (NextAuth or Clerk)
- BullMQ job queue for scheduled price polling fallback
