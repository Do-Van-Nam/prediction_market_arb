"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let GatewayController = class GatewayController {
    getWsInfo() {
        return {
            url: `ws://localhost:${process.env.PORT ?? 3001}`,
            transport: 'Socket.io v4',
            events: {
                serverToClient: ['arb:detected', 'price:update', 'order:update'],
                clientToServer: ['subscribe:market'],
            },
        };
    }
};
exports.GatewayController = GatewayController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'WebSocket event reference (Socket.io at ws://localhost:3001)',
        description: `
Connect via Socket.io:
\`\`\`js
import { io } from 'socket.io-client';
const socket = io('http://localhost:3001');
\`\`\`

**Server → Client events:**

| Event | Payload | Description |
|-------|---------|-------------|
| \`arb:detected\` | ArbOpportunity | New arb opportunity found |
| \`price:update\` | PriceTick | Price change on any market |
| \`order:update\` | OrderResult | Your order status changed |

**Client → Server events:**

| Event | Payload | Description |
|-------|---------|-------------|
| \`subscribe:market\` | slug: string | Join a market room to receive price:update for that slug only |
`,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        schema: {
            example: {
                url: 'ws://localhost:3001',
                transport: 'Socket.io v4',
                events: {
                    serverToClient: ['arb:detected', 'price:update', 'order:update'],
                    clientToServer: ['subscribe:market'],
                },
                sampleArbDetected: {
                    id: 'fed-rate-cut-sept-2026-1718784000000',
                    slug: 'fed-rate-cut-sept-2026',
                    question: 'Will the Fed cut rates in September 2026?',
                    buyYesExchange: 'polymarket',
                    buyYesPrice: 0.52,
                    buyNoExchange: 'kalshi',
                    buyNoPrice: 0.45,
                    roi: 1.34,
                    netProfit: 0.013,
                    detectedAt: 1718784000000,
                },
                samplePriceUpdate: {
                    exchange: 'polymarket',
                    marketId: '0x111aaa...',
                    slug: 'fed-rate-cut-sept-2026',
                    question: 'Will the Fed cut rates in September 2026?',
                    yesPrice: 0.52,
                    noPrice: 0.48,
                    bestBidYes: 0.515,
                    bestAskYes: 0.525,
                    volume24h: 125000,
                    liquidity: 45000,
                    timestamp: 1718784000000,
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GatewayController.prototype, "getWsInfo", null);
exports.GatewayController = GatewayController = __decorate([
    (0, swagger_1.ApiTags)('websocket'),
    (0, common_1.Controller)('ws-info')
], GatewayController);
//# sourceMappingURL=gateway.controller.js.map