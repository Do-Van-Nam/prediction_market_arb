# Kiến Trúc Xây Dựng Prediction Market Platform (AlertPilot Clone)

> **Mục tiêu:** Xây dựng web app tích hợp 2 module chính:
> - **Module 1 — Price & Arbitrage Engine:** lấy dữ liệu realtime từ Polymarket + Kalshi, phát hiện cơ hội arbitrage
> - **Module 2 — Trading Terminal:** đặt lệnh, theo dõi vị thế, đóng lệnh trực tiếp trên giao diện

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Tech Stack](#2-tech-stack)
3. [Module 1 — Price & Arbitrage Engine](#3-module-1--price--arbitrage-engine)
4. [Module 2 — Trading Terminal](#4-module-2--trading-terminal)
5. [Backend — Data Pipeline & API](#5-backend--data-pipeline--api)
6. [Frontend — Next.js Dashboard](#6-frontend--nextjs-dashboard)
7. [Database & Storage](#7-database--storage)
8. [Authentication & Security](#8-authentication--security)
9. [Sơ đồ luồng dữ liệu](#9-sơ-đồ-luồng-dữ-liệu)
10. [Cấu trúc thư mục dự án](#10-cấu-trúc-thư-mục-dự-án)
11. [API Reference — Polymarket & Kalshi](#11-api-reference--polymarket--kalshi)
12. [Code mẫu quan trọng](#12-code-mẫu-quan-trọng)
13. [Lộ trình phát triển (Roadmap)](#13-lộ-trình-phát-triển-roadmap)
14. [Rủi ro & Giải pháp](#14-rủi-ro--giải-pháp)

---

## 1. Tổng quan kiến trúc

```
┌──────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                       │
│  ┌─────────────────┐    ┌──────────────────────────────┐  │
│  │  Arb Dashboard  │    │     Trading Terminal          │  │
│  │  - Live prices  │    │  - Order form                │  │
│  │  - Arb scanner  │    │  - Positions table           │  │
│  │  - Alerts feed  │    │  - P&L tracker               │  │
│  └────────┬────────┘    └──────────────┬───────────────┘  │
└───────────┼──────────────────────────-─┼─────────────────┘
            │ WebSocket / REST            │ REST API calls
┌───────────▼─────────────────────────── ▼─────────────────┐
│                   BACKEND (Node.js / NestJS)               │
│  ┌────────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │  WS Gateway    │  │  Arb Engine │  │  Trade Router  │  │
│  │  (Socket.io)   │  │  (Worker)   │  │  (Proxy)       │  │
│  └───────┬────────┘  └──────┬──────┘  └───────┬───────┘  │
│          │                  │                  │           │
│  ┌───────▼──────────────────▼──────────────────▼────────┐ │
│  │               Redis Pub/Sub + Cache                   │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌──────────────────┐        ┌────────────────────────┐   │
│  │  PostgreSQL       │        │  BullMQ (Job Queue)    │   │
│  │  (trades, alerts) │        │  (price polling tasks) │   │
│  └──────────────────┘        └────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
            │                                 │
┌───────────▼──────────┐         ┌────────────▼──────────┐
│   POLYMARKET APIs     │         │    KALSHI APIs         │
│  - CLOB REST          │         │  - REST API v2         │
│  - WebSocket CLOB     │         │  - WebSocket stream    │
│  - Gamma (metadata)   │         │  - FIX (optional)      │
│  - Data API           │         │                        │
└──────────────────────┘         └───────────────────────┘
```

**Nguyên tắc thiết kế:**
- Backend là trung gian duy nhất giao tiếp với exchange APIs — frontend không gọi trực tiếp
- WebSocket từ Polymarket/Kalshi → Backend → Redis Pub/Sub → Frontend (fan-out hiệu quả)
- Module Trading hoạt động qua REST proxy để bảo mật API key người dùng
- Stateless Next.js frontend, stateful backend

---

## 2. Tech Stack

### Frontend
| Lớp | Công nghệ | Lý do chọn |
|-----|-----------|------------|
| Framework | **Next.js 15** (App Router) | SSR/SSG cho SEO, file-based routing, API routes |
| Language | **TypeScript** | Type safety cho dữ liệu trading |
| UI | **Tailwind CSS + shadcn/ui** | Rapid UI, dark mode tốt cho trading dashboard |
| State | **Zustand** | Nhẹ, phù hợp realtime state management |
| Realtime | **Socket.io-client** | WebSocket với fallback polling |
| Charts | **TradingView Lightweight Charts** | Miễn phí, chuyên biệt cho financial data |
| Data fetch | **TanStack Query (React Query)** | Cache, refetch, loading states |
| Forms | **React Hook Form + Zod** | Validation cho order forms |

### Backend
| Lớp | Công nghệ | Lý do chọn |
|-----|-----------|------------|
| Runtime | **Node.js 22** | Ecosystem tốt, async I/O phù hợp cho WebSocket |
| Framework | **NestJS** | Modules, DI, dễ scale, TypeScript native |
| WebSocket server | **Socket.io** | Fan-out broadcast tới nhiều clients |
| Job queue | **BullMQ + Redis** | Xử lý polling tasks, retry, scheduling |
| ORM | **Prisma** | Type-safe DB queries |
| Validation | **Zod** | Runtime schema validation |

### Infrastructure
| Lớp | Công nghệ | Lý do chọn |
|-----|-----------|------------|
| Cache + Pub/Sub | **Redis (Upstash/Railway)** | Hot state: order books, arb opportunities |
| Database | **PostgreSQL (Supabase/Railway)** | Lưu trades, positions, alert history |
| Deploy | **Vercel (Next.js) + Railway (Backend)** | Đơn giản, tự scale |
| Auth | **NextAuth.js / Clerk** | OAuth + wallet connect |
| Monitoring | **Sentry + Pino logger** | Error tracking, structured logs |

> **Lưu ý quan trọng:** Next.js API Routes **không phù hợp** cho WebSocket server (stateless). Backend NestJS chạy riêng trên cổng khác (ví dụ `:3001`) là bắt buộc.

---

## 3. Module 1 — Price & Arbitrage Engine

### 3.1 Luồng lấy dữ liệu realtime

```
Polymarket WS ──┐
                ├──► Price Normalizer ──► Arb Calculator ──► Redis Pub/Sub ──► Clients
Kalshi WS ──────┘
```

**Bước 1:** Kết nối WebSocket tới từng exchange
**Bước 2:** Normalize dữ liệu về cùng schema
**Bước 3:** Map các markets tương đồng giữa 2 sàn
**Bước 4:** Tính arbitrage spread mỗi khi giá thay đổi
**Bước 5:** Publish kết quả lên Redis → push tới clients

### 3.2 Data schema chuẩn hóa

```typescript
// Unified price tick từ bất kỳ exchange nào
interface PriceTick {
  exchange: 'polymarket' | 'kalshi';
  marketId: string;           // ID nội bộ của exchange
  slug: string;               // human-readable: "fed-rate-cut-sept-2026"
  question: string;
  yesPrice: number;           // 0.01 – 0.99
  noPrice: number;            // computed: 1 - yesPrice khi không có
  bestBidYes: number;
  bestAskYes: number;
  volume24h: number;
  liquidity: number;
  expiryDate: string;
  timestamp: number;          // Unix ms
}

// Cơ hội arbitrage
interface ArbOpportunity {
  id: string;
  slug: string;
  question: string;
  
  // Side A: mua YES ở đây
  buyYesExchange: 'polymarket' | 'kalshi';
  buyYesPrice: number;
  
  // Side B: mua NO ở đây
  buyNoExchange: 'polymarket' | 'kalshi';
  buyNoPrice: number;
  
  totalCost: number;          // buyYesPrice + buyNoPrice
  grossProfit: number;        // 1.00 - totalCost
  netProfit: number;          // sau phí cả 2 sàn
  roi: number;                // netProfit / totalCost * 100
  
  estimatedFees: {
    polymarketFee: number;
    kalshiFee: number;
    total: number;
  };
  
  maxPositionSize: number;    // tính từ liquidity cả 2 sàn
  detectedAt: number;
  expiresAt?: number;         // dự kiến khi opportunity mất
}
```

### 3.3 Arbitrage Calculator

```typescript
// src/modules/arb/arb-calculator.service.ts
@Injectable()
export class ArbCalculatorService {
  
  calculateCrossPlatformArb(
    polyTick: PriceTick,
    kalshiTick: PriceTick
  ): ArbOpportunity | null {
    
    // Scenario 1: Buy YES on Poly, Buy NO on Kalshi
    const scenario1Cost = polyTick.bestAskYes + (1 - kalshiTick.bestBidYes);
    
    // Scenario 2: Buy YES on Kalshi, Buy NO on Poly
    const scenario2Cost = kalshiTick.bestAskYes + (1 - polyTick.bestBidYes);
    
    const bestScenario = Math.min(scenario1Cost, scenario2Cost);
    
    if (bestScenario >= 1.00) return null; // Không có arb
    
    const grossProfit = 1.00 - bestScenario;
    
    // Ước tính phí (Polymarket ~1% taker, Kalshi ~0.75% taker)
    const estimatedFees = bestScenario * 0.0175;
    const netProfit = grossProfit - estimatedFees;
    
    if (netProfit <= 0.005) return null; // < 0.5% không đáng
    
    const isScenario1 = scenario1Cost <= scenario2Cost;
    
    return {
      id: `${polyTick.slug}-${Date.now()}`,
      slug: polyTick.slug,
      question: polyTick.question,
      buyYesExchange: isScenario1 ? 'polymarket' : 'kalshi',
      buyYesPrice: isScenario1 ? polyTick.bestAskYes : kalshiTick.bestAskYes,
      buyNoExchange: isScenario1 ? 'kalshi' : 'polymarket',
      buyNoPrice: isScenario1 ? (1 - kalshiTick.bestBidYes) : (1 - polyTick.bestBidYes),
      totalCost: bestScenario,
      grossProfit,
      netProfit,
      roi: (netProfit / bestScenario) * 100,
      estimatedFees: {
        polymarketFee: bestScenario * 0.01,
        kalshiFee: bestScenario * 0.0075,
        total: estimatedFees,
      },
      maxPositionSize: Math.min(polyTick.liquidity, kalshiTick.liquidity) * 0.1,
      detectedAt: Date.now(),
    };
  }
}
```

### 3.4 Market Matcher — ghép market 2 sàn

```typescript
// Vấn đề: Polymarket dùng slug khác Kalshi
// Giải pháp: Map bằng semantic similarity hoặc manual mapping table

interface MarketMapping {
  slug: string;              // shared slug
  polymarketConditionId: string;
  polymarketTokenId: string;
  kalshiEventTicker: string;
  kalshiMarketTicker: string;
}

// Ví dụ mapping table (lưu trong DB, có thể seed thủ công hoặc dùng AI để auto-match)
const MARKET_MAPPINGS: MarketMapping[] = [
  {
    slug: 'fed-rate-cut-sept-2026',
    polymarketConditionId: '0x...',
    polymarketTokenId: '...',
    kalshiEventTicker: 'FED-26SEP',
    kalshiMarketTicker: 'FED-26SEP-Y25',
  },
  // ...
];
```

---

## 4. Module 2 — Trading Terminal

### 4.1 Luồng đặt lệnh

```
User fills form
      │
      ▼
Frontend validates (Zod)
      │
      ▼
POST /api/trade/order  (Next.js → NestJS proxy)
      │
      ▼
NestJS Trade Router
  ├── exchange === 'polymarket' ──► Polymarket CLOB API
  └── exchange === 'kalshi'    ──► Kalshi REST API
      │
      ▼
Order response saved → PostgreSQL
      │
      ▼
Emit 'order:update' via Socket.io → Client
```

### 4.2 Order types hỗ trợ

| Type | Polymarket | Kalshi | Mô tả |
|------|-----------|--------|-------|
| Limit | ✅ GTC | ✅ GTC | Đặt giá, chờ khớp |
| Market | ✅ FOK | ✅ IOC | Khớp ngay giá tốt nhất |
| Batch | ✅ (15 orders/call) | ✅ | Arbitrage: đặt 2 lệnh cùng lúc |
| Post-only | ✅ | ✅ | Chỉ maker, không bao giờ taker |

### 4.3 Trade Service interface

```typescript
// src/modules/trading/trading.service.ts

interface PlaceOrderDto {
  exchange: 'polymarket' | 'kalshi';
  marketId: string;
  side: 'YES' | 'NO';
  orderType: 'LIMIT' | 'MARKET' | 'POST_ONLY';
  price?: number;       // Bắt buộc với LIMIT
  size: number;         // số shares
  userId: string;
}

interface OrderResult {
  orderId: string;
  exchange: string;
  status: 'OPEN' | 'FILLED' | 'CANCELLED' | 'FAILED';
  filledPrice?: number;
  filledSize?: number;
  remainingSize?: number;
  fees?: number;
  createdAt: string;
}

// Đặt lệnh arbitrage 2 sàn cùng lúc
interface PlaceArbOrderDto {
  arbOpportunityId: string;
  sizeUsd: number;        // Vốn muốn bỏ vào
  userId: string;
  slippageTolerance: number; // Ví dụ 0.005 = 0.5%
}
```

### 4.4 Position Tracker

```typescript
interface Position {
  id: string;
  userId: string;
  exchange: 'polymarket' | 'kalshi';
  marketId: string;
  slug: string;
  question: string;
  side: 'YES' | 'NO';
  shares: number;
  avgEntryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  cost: number;
  currentValue: number;
  status: 'OPEN' | 'CLOSED' | 'RESOLVED';
  openedAt: string;
  closedAt?: string;
  resolvedValue?: number;   // 0 hoặc 1 khi market resolve
}
```

---

## 5. Backend — Data Pipeline & API

### 5.1 NestJS Module structure

```
src/
├── modules/
│   ├── price-feed/
│   │   ├── polymarket-ws.service.ts    # Polymarket WebSocket consumer
│   │   ├── kalshi-ws.service.ts        # Kalshi WebSocket consumer
│   │   ├── price-normalizer.service.ts # Normalize về PriceTick
│   │   └── price-feed.module.ts
│   │
│   ├── arb/
│   │   ├── arb-calculator.service.ts   # Tính arb opportunities
│   │   ├── market-mapper.service.ts    # Map markets giữa 2 sàn
│   │   ├── arb-publisher.service.ts    # Publish lên Redis
│   │   └── arb.module.ts
│   │
│   ├── trading/
│   │   ├── polymarket-trade.service.ts # Wrap Polymarket CLOB SDK
│   │   ├── kalshi-trade.service.ts     # Wrap Kalshi REST client
│   │   ├── position-tracker.service.ts # Sync + track positions
│   │   ├── trading.controller.ts       # REST endpoints
│   │   └── trading.module.ts
│   │
│   ├── gateway/
│   │   ├── events.gateway.ts           # Socket.io gateway
│   │   └── gateway.module.ts
│   │
│   └── markets/
│       ├── markets.service.ts          # CRUD market metadata
│       ├── markets.controller.ts
│       └── markets.module.ts
│
├── common/
│   ├── redis/                          # Redis client wrapper
│   ├── guards/                         # Auth guards
│   └── interceptors/
│
└── main.ts
```

### 5.2 Socket.io Events

**Server → Client (broadcast):**

| Event | Data | Mô tả |
|-------|------|-------|
| `price:update` | `PriceTick` | Giá mới từ bất kỳ sàn nào |
| `arb:detected` | `ArbOpportunity` | Cơ hội arbitrage mới |
| `arb:expired` | `{ id: string }` | Opportunity đã mất |
| `orderbook:snapshot` | `OrderBook` | Full orderbook khi subscribe |
| `orderbook:delta` | `OrderBookDelta` | Thay đổi incremental |

**Client → Server (authenticated):**

| Event | Data | Mô tả |
|-------|------|-------|
| `subscribe:market` | `{ slug: string }` | Theo dõi market cụ thể |
| `subscribe:orderbook` | `{ exchange, marketId }` | Nhận orderbook updates |
| `unsubscribe:market` | `{ slug: string }` | Hủy theo dõi |

**Server → User (private, per-user room):**

| Event | Data | Mô tả |
|-------|------|-------|
| `order:update` | `OrderResult` | Trạng thái lệnh thay đổi |
| `position:update` | `Position` | Vị thế thay đổi |
| `alert:triggered` | `Alert` | Cảnh báo giá được kích hoạt |

### 5.3 REST API Endpoints

```
# Markets
GET  /api/markets                         # Danh sách markets với giá hiện tại
GET  /api/markets/:slug                   # Chi tiết 1 market
GET  /api/markets/:slug/orderbook         # Orderbook hiện tại

# Arbitrage
GET  /api/arb/opportunities               # Danh sách arb opportunities hiện tại
GET  /api/arb/history                     # Lịch sử arb đã phát hiện
GET  /api/arb/stats                       # Thống kê: số lượng, avg ROI, ...

# Trading (yêu cầu xác thực)
POST /api/trade/order                     # Đặt 1 lệnh đơn
POST /api/trade/arb-order                 # Đặt lệnh arb (2 sàn cùng lúc)
DELETE /api/trade/order/:orderId          # Hủy lệnh
GET  /api/trade/orders                    # Danh sách lệnh của user
GET  /api/trade/positions                 # Vị thế hiện tại
POST /api/trade/position/:positionId/close  # Đóng vị thế (market order)

# Alerts
GET  /api/alerts                          # Danh sách alerts
POST /api/alerts                          # Tạo alert mới
DELETE /api/alerts/:alertId               # Xóa alert

# Account
GET  /api/account/balance                 # Số dư USDC trên từng sàn
GET  /api/account/pnl                     # P&L summary
```

---

## 6. Frontend — Next.js Dashboard

### 6.1 Page structure (App Router)

```
app/
├── layout.tsx                  # Root layout: providers, nav, auth
├── page.tsx                    # Landing / redirect to dashboard
│
├── (dashboard)/
│   ├── layout.tsx              # Dashboard sidebar + header
│   │
│   ├── arb/
│   │   └── page.tsx            # Arbitrage scanner — Module 1
│   │
│   ├── markets/
│   │   ├── page.tsx            # Market list
│   │   └── [slug]/
│   │       └── page.tsx        # Market detail + orderbook
│   │
│   ├── trade/
│   │   └── page.tsx            # Trading terminal — Module 2
│   │
│   ├── positions/
│   │   └── page.tsx            # Open + closed positions
│   │
│   └── alerts/
│       └── page.tsx            # Alert management
│
└── api/
    └── trade/
        └── [...route]/
            └── route.ts        # Proxy tới NestJS backend
```

### 6.2 Arb Scanner UI (Module 1)

```tsx
// app/(dashboard)/arb/page.tsx — các component chính

// 1. Live stats bar
<ArbStatsBar 
  totalOpportunities={opportunities.length}
  avgRoi={avgRoi}
  topRoi={topRoi}
  lastUpdated={lastUpdated}
/>

// 2. Bảng opportunities realtime
<ArbTable
  opportunities={opportunities}       // từ socket 'arb:detected'
  onSelectRow={(arb) => setSelected(arb)}
  columns={['market', 'buyYes', 'buyNo', 'cost', 'netProfit', 'roi', 'liquidity', 'age']}
  sortBy="roi"
/>

// 3. Detail panel khi chọn 1 row
<ArbDetailPanel
  opportunity={selected}
  onTrade={(arb) => openTradeModal(arb)}   // Mở modal đặt lệnh arb
/>

// 4. Price chart cho market được chọn
<PriceChart
  slug={selected?.slug}
  showBothExchanges={true}   // Polymarket vs Kalshi cùng 1 chart
/>
```

### 6.3 Trading Terminal UI (Module 2)

```tsx
// app/(dashboard)/trade/page.tsx

// Layout 3 cột
<div className="grid grid-cols-[1fr_400px_350px] gap-4">

  {/* Cột trái: Danh sách markets + tìm kiếm */}
  <MarketList
    onSelect={(market) => setActiveMarket(market)}
    searchable
    filterable
  />

  {/* Cột giữa: Chart + Orderbook */}
  <div>
    <PriceChart slug={activeMarket?.slug} />
    <OrderBook
      marketId={activeMarket?.id}
      exchange={activeExchange}
    />
  </div>

  {/* Cột phải: Order form + Positions */}
  <div>
    <OrderForm
      market={activeMarket}
      exchange={activeExchange}
      onSubmit={placeOrder}
      onExchangeSwitch={setActiveExchange}
    />
    <PositionsTable
      positions={userPositions}
      onClose={closePosition}
    />
  </div>

</div>
```

### 6.4 WebSocket Hook

```typescript
// hooks/useMarketSocket.ts
export function useMarketSocket() {
  const { data: session } = useSession();
  
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token: session?.accessToken },
    });

    socket.on('price:update', (tick: PriceTick) => {
      usePriceStore.getState().updatePrice(tick);
    });

    socket.on('arb:detected', (opp: ArbOpportunity) => {
      useArbStore.getState().addOpportunity(opp);
    });

    socket.on('arb:expired', ({ id }) => {
      useArbStore.getState().removeOpportunity(id);
    });

    socket.on('order:update', (order: OrderResult) => {
      useTradeStore.getState().updateOrder(order);
    });

    return () => { socket.disconnect(); };
  }, [session?.accessToken]);
}
```

### 6.5 Zustand Stores

```typescript
// store/arb.store.ts
interface ArbStore {
  opportunities: ArbOpportunity[];
  addOpportunity: (opp: ArbOpportunity) => void;
  removeOpportunity: (id: string) => void;
  filterByMinRoi: (minRoi: number) => ArbOpportunity[];
}

// store/price.store.ts
interface PriceStore {
  prices: Record<string, PriceTick>;           // slug → latest tick
  updatePrice: (tick: PriceTick) => void;
  getPriceForMarket: (slug: string, exchange: string) => PriceTick | undefined;
}

// store/trade.store.ts
interface TradeStore {
  openOrders: OrderResult[];
  positions: Position[];
  updateOrder: (order: OrderResult) => void;
  updatePosition: (position: Position) => void;
}
```

---

## 7. Database & Storage

### 7.1 PostgreSQL Schema (Prisma)

```prisma
// prisma/schema.prisma

model User {
  id            String     @id @default(cuid())
  email         String     @unique
  // Encrypted API keys cho từng sàn
  polyApiKey    String?    // encrypted
  polyPrivKey   String?    // encrypted (private key cho signing)
  kalshiApiKey  String?    // encrypted
  kalshiApiSecret String?  // encrypted
  orders        Order[]
  positions     Position[]
  alerts        Alert[]
  createdAt     DateTime   @default(now())
}

model MarketMapping {
  id                    String   @id @default(cuid())
  slug                  String   @unique
  question              String
  polyConditionId       String?  @unique
  polyTokenIdYes        String?
  polyTokenIdNo         String?
  kalshiEventTicker     String?
  kalshiMarketTicker    String?
  category              String?
  expiryDate            DateTime?
  isActive              Boolean  @default(true)
  updatedAt             DateTime @updatedAt
}

model Order {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  exchange      String    // 'polymarket' | 'kalshi'
  externalId    String?   // ID từ exchange
  marketId      String
  slug          String
  side          String    // 'YES' | 'NO'
  orderType     String    // 'LIMIT' | 'MARKET'
  requestedPrice Float?
  requestedSize Float
  filledPrice   Float?
  filledSize    Float?
  fees          Float?
  status        String    @default("PENDING")
  arbGroupId    String?   // Link 2 lệnh arb lại với nhau
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Position {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  exchange      String
  marketId      String
  slug          String
  question      String
  side          String
  shares        Float
  avgEntryPrice Float
  cost          Float
  status        String   @default("OPEN")  // 'OPEN' | 'CLOSED' | 'RESOLVED'
  resolvedValue Float?
  realizedPnl   Float?
  openedAt      DateTime @default(now())
  closedAt      DateTime?
}

model Alert {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  type       String   // 'PRICE_ABOVE' | 'PRICE_BELOW' | 'ARB_ROI_ABOVE'
  slug       String?
  exchange   String?
  threshold  Float
  triggered  Boolean  @default(false)
  triggeredAt DateTime?
  createdAt  DateTime @default(now())
}

model ArbHistory {
  id             String  @id @default(cuid())
  slug           String
  question       String
  buyYesExchange String
  buyYesPrice    Float
  buyNoExchange  String
  buyNoPrice     Float
  grossProfit    Float
  netProfit      Float
  roi            Float
  detectedAt     DateTime
  expiredAt      DateTime?
  durationMs     Int?
}
```

### 7.2 Redis Key Structure

```
# Giá mới nhất (TTL: 60s, tự expire nếu feed mất)
price:poly:{slug}        → JSON PriceTick
price:kalshi:{slug}      → JSON PriceTick

# Orderbook snapshot
orderbook:poly:{tokenId}    → JSON OrderBook
orderbook:kalshi:{ticker}   → JSON OrderBook

# Danh sách arb opportunities hiện tại
arb:active               → Set of opportunity IDs
arb:opp:{id}             → JSON ArbOpportunity (TTL: 30s)

# Pub/Sub channels
channel:prices           → broadcast price updates
channel:arb              → broadcast arb opportunities
channel:orders:{userId}  → per-user order updates
```

---

## 8. Authentication & Security

### 8.1 Luồng Auth

```
User login (NextAuth / Clerk)
    │
    ▼
JWT access token (short-lived: 15 min)
    │
    ▼
User nhập API keys của Polymarket + Kalshi
    │
    ▼
Backend mã hóa bằng AES-256-GCM (KEY từ env)
    │
    ▼
Lưu encrypted keys vào PostgreSQL
    │
    ▼
Khi trade: Backend decrypt → ký lệnh → gửi tới exchange
```

### 8.2 Bảo mật API Keys

```typescript
// Backend: không bao giờ expose raw API key ra response
// Chỉ decrypt in-memory khi cần sign order

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(encrypted: string): string {
  const [ivHex, authTagHex, dataHex] = encrypted.split(':');
  const decipher = createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  return decipher.update(Buffer.from(dataHex, 'hex')) + decipher.final('utf8');
}
```

### 8.3 Rate Limiting

```typescript
// Giới hạn gọi tới exchange APIs
// Polymarket: ~10 req/s REST, WebSocket unlimited
// Kalshi: ~10 req/s REST, WebSocket limited

// Dùng BullMQ rate limiter cho outgoing requests
const queue = new Queue('exchange-api', {
  limiter: { max: 8, duration: 1000 }, // 8 req/s
});
```

---

## 9. Sơ đồ luồng dữ liệu

### Luồng Module 1 (Arb Detection)

```
1. Polymarket WS connects: wss://ws-subscriptions-clob.polymarket.com/ws/market
2. Subscribe to list of matched market token IDs
3. Receive 'book' / 'price_change' / 'best_bid_ask' events
4. Normalize → PriceTick
5. Store in Redis: price:poly:{slug}

6. Kalshi WS connects: wss://trading-api/v1/ws
7. Subscribe to matched market tickers
8. Receive orderbook updates
9. Normalize → PriceTick
10. Store in Redis: price:kalshi:{slug}

11. ArbCalculatorService: subscribe Redis channel
12. Khi có update: load cả 2 ticks, chạy calculateCrossPlatformArb()
13. Nếu có arb:
    - Store trong Redis: arb:opp:{id} (TTL 30s)
    - Thêm vào Set arb:active
    - Publish trên channel:arb
    - Lưu vào DB (ArbHistory)
14. Socket.io Gateway: subscribe channel:arb
15. Broadcast 'arb:detected' tới tất cả connected clients
```

### Luồng Module 2 (Trade Execution)

```
1. User submit order form trên frontend
2. POST /api/trade/order (Next.js route → proxy to NestJS)
3. NestJS: xác thực JWT, load user
4. Decrypt API keys từ DB
5. Tạo order request theo exchange:
   - Polymarket: ký EIP-712, gọi POST /order (CLOB v2)
   - Kalshi: ký với ECDSA/RSA, gọi POST /portfolio/orders
6. Exchange trả về order ID
7. Lưu Order vào PostgreSQL
8. Emit 'order:update' qua Socket.io tới user room
9. Background job: poll order status mỗi 2s cho đến khi filled/cancelled
10. Khi filled: tạo/update Position record
11. Emit 'position:update' tới client
```

---

## 10. Cấu trúc thư mục dự án

```
prediction-market-platform/
│
├── apps/
│   ├── web/                        # Next.js frontend
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── arb/page.tsx
│   │   │   │   ├── trade/page.tsx
│   │   │   │   ├── positions/page.tsx
│   │   │   │   └── markets/[slug]/page.tsx
│   │   │   └── api/trade/[...route]/route.ts
│   │   ├── components/
│   │   │   ├── arb/
│   │   │   │   ├── ArbTable.tsx
│   │   │   │   ├── ArbDetailPanel.tsx
│   │   │   │   └── ArbStatsBar.tsx
│   │   │   ├── trading/
│   │   │   │   ├── OrderForm.tsx
│   │   │   │   ├── OrderBook.tsx
│   │   │   │   ├── PositionsTable.tsx
│   │   │   │   └── PriceChart.tsx
│   │   │   └── shared/
│   │   ├── hooks/
│   │   │   ├── useMarketSocket.ts
│   │   │   ├── useOrderBook.ts
│   │   │   └── usePositions.ts
│   │   ├── store/
│   │   │   ├── arb.store.ts
│   │   │   ├── price.store.ts
│   │   │   └── trade.store.ts
│   │   └── lib/
│   │       ├── api.ts             # API client
│   │       └── formatters.ts
│   │
│   └── api/                        # NestJS backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── price-feed/
│       │   │   ├── arb/
│       │   │   ├── trading/
│       │   │   ├── gateway/
│       │   │   └── markets/
│       │   ├── common/
│       │   │   ├── redis/
│       │   │   ├── crypto/         # Key encryption
│       │   │   └── guards/
│       │   └── main.ts
│       └── prisma/
│           └── schema.prisma
│
├── packages/
│   ├── shared-types/               # Types dùng chung FE/BE
│   │   └── src/index.ts           # PriceTick, ArbOpportunity, etc.
│   └── exchange-clients/           # Wrapper cho Polymarket + Kalshi SDKs
│       ├── src/
│       │   ├── polymarket/
│       │   └── kalshi/
│       └── package.json
│
├── docker-compose.yml              # Local dev: Redis + PostgreSQL
├── turbo.json                      # Turborepo config
└── package.json
```

> Dùng **Turborepo** (monorepo) để chia sẻ types giữa frontend và backend mà không duplicate code.

---

## 11. API Reference — Polymarket & Kalshi

### 11.1 Polymarket APIs

Polymarket có **3 REST API surfaces** + 1 WebSocket:

| API | Base URL | Mục đích |
|-----|----------|---------|
| **CLOB API** | `https://clob.polymarket.com` | Orderbook, giá, đặt lệnh |
| **Gamma API** | `https://gamma-api.polymarket.com` | Market metadata, categories |
| **Data API** | `https://data-api.polymarket.com` | Lịch sử, positions on-chain |
| **WebSocket** | `wss://ws-subscriptions-clob.polymarket.com/ws/market` | Realtime prices |

**Các endpoint quan trọng:**

```
# CLOB — Market data (public, không cần auth)
GET  /prices                              # Giá nhiều markets
GET  /orderbook/:tokenId                  # Full orderbook
GET  /last-trade-price/:tokenId           # Giá giao dịch gần nhất

# CLOB — Trading (cần EIP-712 signature)
POST /order                               # Đặt lệnh đơn
POST /orders                              # Batch (tối đa 15)
DELETE /order/:orderId                    # Hủy lệnh
GET  /orders?maker_address=...            # Lệnh đang mở

# Gamma — Market discovery
GET  /markets?active=true&limit=100       # Danh sách markets
GET  /markets?slug=fed-rate-cut           # Tìm theo slug

# WebSocket subscription
{
  "type": "market",
  "assets_ids": ["TOKEN_ID_1", "TOKEN_ID_2"],
  "custom_feature_enabled": true
}
```

**Authentication Polymarket:**
- SDK: `@polymarket/clob-client-v2`
- Dùng Ethereum wallet (EIP-712 signing)
- Tạo API credentials từ wallet signature
- Cần tài khoản trên Polygon, nạp USDC

### 11.2 Kalshi APIs

| API | Base URL | Mục đích |
|-----|----------|---------|
| **REST v2** | `https://trading-api.kalshi.com/trade-api/v2` | Tất cả operations |
| **WebSocket** | `wss://trading-api.kalshi.com/trade-api/ws/v2` | Realtime |

**Các endpoint quan trọng:**

```
# Market data (public)
GET  /markets                             # Danh sách markets
GET  /markets/{market_ticker}             # Chi tiết 1 market
GET  /markets/{market_ticker}/orderbook   # Orderbook
GET  /events/{event_ticker}               # Chi tiết event

# Trading (cần API key + RSA signature)
POST /portfolio/orders                    # Đặt lệnh
DELETE /portfolio/orders/{order_id}       # Hủy lệnh
GET  /portfolio/orders                    # Lệnh của bạn
GET  /portfolio/positions                 # Vị thế hiện tại
GET  /portfolio/balance                   # Số dư

# WebSocket channels
{ "id": 1, "cmd": "subscribe", "params": { "channels": ["orderbook_delta"], "market_tickers": ["FED-26SEP"] }}
```

**Authentication Kalshi:**
- Tạo API key trong Kalshi dashboard
- Dùng RSA private key để ký requests
- Header: `Authorization: Bearer {token}` (token từ login)

### 11.3 Fee Structure (tháng 6/2026)

| Sàn | Maker fee | Taker fee | Winning fee |
|-----|-----------|-----------|-------------|
| Polymarket | 0% (rebate) | 0.75–1.8% (theo category) | ~2% |
| Kalshi | 0% | ~0.75% | 0% |

> **Lưu ý:** Phí thay đổi thường xuyên. Luôn fetch fee schedule từ API trước khi tính arb.

---

## 12. Code mẫu quan trọng

### 12.1 Polymarket WebSocket consumer (TypeScript)

```typescript
// src/modules/price-feed/polymarket-ws.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import WebSocket from 'ws';

@Injectable()
export class PolymarketWsService implements OnModuleInit {
  private ws: WebSocket;
  private subscribedTokens: Set<string> = new Set();

  onModuleInit() {
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(
      'wss://ws-subscriptions-clob.polymarket.com/ws/market'
    );

    this.ws.on('open', () => {
      console.log('Polymarket WS connected');
      if (this.subscribedTokens.size > 0) {
        this.sendSubscription([...this.subscribedTokens]);
      }
    });

    this.ws.on('message', (data: string) => {
      const messages = JSON.parse(data);
      const events = Array.isArray(messages) ? messages : [messages];
      for (const event of events) {
        this.handleEvent(event);
      }
    });

    this.ws.on('close', () => {
      console.log('Polymarket WS disconnected. Reconnecting in 3s...');
      setTimeout(() => this.connect(), 3000);
    });

    this.ws.on('error', (err) => {
      console.error('Polymarket WS error:', err.message);
    });
  }

  subscribeToMarkets(tokenIds: string[]) {
    tokenIds.forEach(id => this.subscribedTokens.add(id));
    if (this.ws.readyState === WebSocket.OPEN) {
      this.sendSubscription(tokenIds);
    }
  }

  private sendSubscription(tokenIds: string[]) {
    this.ws.send(JSON.stringify({
      type: 'market',
      assets_ids: tokenIds,
      custom_feature_enabled: true,
    }));
  }

  private handleEvent(event: any) {
    switch (event.event_type) {
      case 'best_bid_ask':
        // { asset_id, bid_price, ask_price, timestamp }
        this.emit('price', {
          exchange: 'polymarket',
          tokenId: event.asset_id,
          bestBid: parseFloat(event.bid_price),
          bestAsk: parseFloat(event.ask_price),
          timestamp: Date.now(),
        });
        break;
      case 'last_trade_price':
        // Giá giao dịch gần nhất
        break;
      case 'market_resolved':
        this.emit('resolved', { tokenId: event.asset_id });
        break;
    }
  }

  private emit(event: string, data: any) {
    // Publish to Redis channel
    // this.redisService.publish(`channel:prices`, JSON.stringify(data));
  }
}
```

### 12.2 Đặt lệnh Polymarket (TypeScript)

```typescript
import { ClobClient, Side } from '@polymarket/clob-client-v2';
import { ethers } from 'ethers';

// Khởi tạo client
const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const clobClient = new ClobClient({
  host: 'https://clob.polymarket.com',
  chain: 137,  // Polygon
  signer: wallet,
  creds: {
    key: API_KEY,
    secret: API_SECRET,
    passphrase: API_PASSPHRASE,
  }
});

// Đặt limit order mua YES
async function placeLimitOrder(tokenId: string, price: number, sizeUsdc: number) {
  const order = await clobClient.createAndPostOrder({
    tokenID: tokenId,
    price,
    size: sizeUsdc / price,  // convert USDC to shares
    side: Side.BUY,
  }, {
    tickSize: '0.01',
    negRisk: false,
  });
  
  return order;
}

// Đặt batch order cho arbitrage (YES ở Polymarket + NO ở Kalshi)
async function placeArbOrders(arbOpp: ArbOpportunity, sizeUsd: number) {
  // Tính số shares
  const yesShares = sizeUsd / arbOpp.buyYesPrice;
  const noShares  = sizeUsd / arbOpp.buyNoPrice;

  // Đặt cả 2 lệnh gần như cùng lúc
  const [polyOrder, kalshiOrder] = await Promise.all([
    placeLimitOrder(POLY_TOKEN_ID, arbOpp.buyYesPrice, sizeUsd),
    placeKalshiOrder(KALSHI_TICKER, 'no', arbOpp.buyNoPrice, noShares),
  ]);

  return { polyOrder, kalshiOrder };
}
```

### 12.3 Đặt lệnh Kalshi (TypeScript)

```typescript
// Kalshi sử dụng REST API với API key authentication

async function placeKalshiOrder(
  marketTicker: string,
  side: 'yes' | 'no',
  price: number,  // Kalshi dùng cents (0–99)
  count: number   // số contracts
) {
  const response = await fetch(
    'https://trading-api.kalshi.com/trade-api/v2/portfolio/orders',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KALSHI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticker: marketTicker,
        client_order_id: crypto.randomUUID(),
        type: 'limit',
        action: 'buy',
        side,
        count,
        yes_price: side === 'yes' ? Math.round(price * 100) : undefined,
        no_price:  side === 'no'  ? Math.round(price * 100) : undefined,
        expiration_ts: null, // GTC
      }),
    }
  );
  
  return response.json();
}
```

---

## 13. Lộ trình phát triển (Roadmap)

### Phase 1 — MVP (4–6 tuần)

- [ ] Thiết lập monorepo (Next.js + NestJS + shared types)
- [ ] Kết nối WebSocket Polymarket — lấy giá realtime
- [ ] Market matching table cho top 50 markets phổ biến
- [ ] Arb calculator cơ bản (cross-platform only)
- [ ] Dashboard hiển thị bảng arb opportunities
- [ ] Auth với NextAuth (email/password)
- [ ] PostgreSQL + Prisma schema

### Phase 2 — Trading (4–6 tuần)

- [ ] Kết nối Kalshi WebSocket
- [ ] Integrate Polymarket CLOB client (đặt/hủy lệnh)
- [ ] Integrate Kalshi API client
- [ ] Trading terminal UI (order form + orderbook)
- [ ] Position tracking realtime
- [ ] P&L calculation

### Phase 3 — Advanced Features (4 tuần)

- [ ] One-click arb execution (đặt 2 lệnh cùng lúc)
- [ ] Alert system (price alerts, arb ROI threshold)
- [ ] Arb history + analytics
- [ ] Account balance display (cả 2 sàn)
- [ ] Mobile responsive

### Phase 4 — Production (2 tuần)

- [ ] Deploy Vercel + Railway
- [ ] Monitoring (Sentry, Pino)
- [ ] Rate limiting, circuit breaker
- [ ] Load testing

---

## 14. Rủi ro & Giải pháp

| Rủi ro | Xác suất | Giải pháp |
|--------|----------|-----------|
| Arb opportunity mất trước khi đặt cả 2 lệnh | Cao | Đặt batch order, slippage tolerance, fallback cancel |
| API key Polymarket bị lộ | Thấp | AES-256 encryption, không log keys, HTTPS only |
| Kalshi thay đổi API | Trung bình | Adapter pattern, version pinning, changelog monitoring |
| Polymarket WS ngắt kết nối | Cao | Auto-reconnect với exponential backoff |
| Slippage ăn hết profit | Trung bình | Chỉ execute khi net ROI sau phí + slippage > 0.5% |
| Polymarket địa lý (US restricted) | Trung bình | Verify TOS, xem xét jurisdiction, không trade trực tiếp nếu bị restricted |
| Liquidity thấp → không đặt được cả 2 lệnh | Trung bình | Kiểm tra liquidity cả 2 sàn trước khi show opportunity |

---

## Tài nguyên tham khảo

- [Polymarket Docs](https://docs.polymarket.com) — CLOB API v2, WebSocket
- [Polymarket CLOB Client v2](https://github.com/Polymarket/clob-client) — TypeScript SDK chính thức
- [Kalshi API Docs](https://trading-api.readme.kalshi.com) — REST + WebSocket
- [py_clob_client](https://github.com/Polymarket/py_clob_client) — Python SDK
- [NestJS Docs](https://docs.nestjs.com) — Framework backend
- [Socket.io Docs](https://socket.io/docs) — Real-time communication
- [Prisma Docs](https://www.prisma.io/docs) — ORM
- [Turborepo Docs](https://turbo.build/repo/docs) — Monorepo tooling
- [TradingView Lightweight Charts](https://tradingview.github.io/lightweight-charts) — Charts
