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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const trading_service_1 = require("./trading.service");
let TradingController = class TradingController {
    service;
    constructor(service) {
        this.service = service;
    }
    placeOrder(dto) {
        return this.service.placeOrder(dto);
    }
    placeArbOrder(dto) {
        return this.service.placeArbOrder(dto);
    }
    getOrders(userId) {
        return this.service.getOrders(userId);
    }
    getPositions(userId) {
        return this.service.getPositions(userId);
    }
    cancelOrder(orderId, body) {
        return this.service.cancelOrder(orderId, body.exchange);
    }
};
exports.TradingController = TradingController;
__decorate([
    (0, common_1.Post)('order'),
    (0, swagger_1.ApiOperation)({ summary: 'Place a single order on Polymarket or Kalshi' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                exchange: 'polymarket',
                marketId: '0x111aaa...',
                side: 'YES',
                orderType: 'LIMIT',
                price: 0.62,
                size: 100,
                userId: 'user_abc123',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Order placed — returns exchange order ID and status',
        schema: {
            example: {
                orderId: 'ord_poly_xyz',
                exchange: 'polymarket',
                status: 'OPEN',
                filledPrice: null,
                filledSize: 0,
                remainingSize: 100,
                fees: 0.62,
                createdAt: '2026-06-19T10:00:00Z',
                slug: 'fed-rate-cut-sept-2026',
                side: 'YES',
                size: 100,
                price: 0.62,
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TradingController.prototype, "placeOrder", null);
__decorate([
    (0, common_1.Post)('arb-order'),
    (0, swagger_1.ApiOperation)({
        summary: 'Execute an arbitrage trade — places YES on one exchange and NO on the other simultaneously',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                arbOpportunityId: 'arb-fed-rate-cut-sept-2026-1718784000000',
                sizeUsd: 500,
                userId: 'user_abc123',
                slippageTolerance: 0.005,
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Both legs placed — returns array of 2 OrderResults',
        schema: {
            example: [
                { orderId: 'ord_poly_001', exchange: 'polymarket', side: 'YES', status: 'OPEN', price: 0.52, size: 961 },
                { orderId: 'ord_kalshi_002', exchange: 'kalshi', side: 'NO', status: 'OPEN', price: 0.45, size: 961 },
            ],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TradingController.prototype, "placeArbOrder", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order history for a user' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: true, example: 'user_abc123' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of orders',
        schema: {
            example: [
                {
                    id: 'clxyz456',
                    userId: 'user_abc123',
                    exchange: 'polymarket',
                    slug: 'fed-rate-cut-sept-2026',
                    side: 'YES',
                    orderType: 'LIMIT',
                    price: 0.62,
                    size: 100,
                    filledSize: 100,
                    status: 'FILLED',
                    fees: 0.62,
                    createdAt: '2026-06-19T10:00:00Z',
                },
            ],
        },
    }),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TradingController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)('positions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get open positions for a user' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: true, example: 'user_abc123' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of open positions with unrealized P&L',
        schema: {
            example: [
                {
                    id: 'clxyz789',
                    userId: 'user_abc123',
                    exchange: 'polymarket',
                    slug: 'fed-rate-cut-sept-2026',
                    question: 'Will the Fed cut rates in September 2026?',
                    side: 'YES',
                    shares: 100,
                    avgEntryPrice: 0.62,
                    currentPrice: 0.68,
                    cost: 62,
                    currentValue: 68,
                    unrealizedPnl: 6,
                    unrealizedPnlPct: 9.68,
                    status: 'OPEN',
                    openedAt: '2026-06-19T10:00:00Z',
                },
            ],
        },
    }),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TradingController.prototype, "getPositions", null);
__decorate([
    (0, common_1.Post)('orders/:orderId/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an open order' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', example: 'ord_poly_xyz' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: { exchange: 'polymarket', userId: 'user_abc123' },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Order cancelled' }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TradingController.prototype, "cancelOrder", null);
exports.TradingController = TradingController = __decorate([
    (0, swagger_1.ApiTags)('trading'),
    (0, common_1.Controller)('trading'),
    __metadata("design:paramtypes", [trading_service_1.TradingService])
], TradingController);
//# sourceMappingURL=trading.controller.js.map