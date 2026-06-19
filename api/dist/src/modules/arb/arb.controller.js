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
exports.ArbController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const arb_engine_service_1 = require("./arb-engine.service");
let ArbController = class ArbController {
    engine;
    constructor(engine) {
        this.engine = engine;
    }
    async getOpportunities(minRoi) {
        const all = await this.engine.getActiveOpportunities();
        const threshold = minRoi ? parseFloat(minRoi) : 0;
        return all
            .filter((o) => o.roi >= threshold)
            .sort((a, b) => b.roi - a.roi);
    }
};
exports.ArbController = ArbController;
__decorate([
    (0, common_1.Get)('opportunities'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all currently active arbitrage opportunities',
        description: 'Returns opportunities cached in Redis (TTL 60s). Refreshed in real-time as Polymarket & Kalshi WebSocket prices arrive.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'minRoi',
        required: false,
        type: Number,
        example: 1.5,
        description: 'Filter: minimum ROI % (default 0)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Array of active arb opportunities sorted by ROI descending',
        schema: {
            example: [
                {
                    id: 'fed-rate-cut-sept-2026-1718784000000',
                    slug: 'fed-rate-cut-sept-2026',
                    question: 'Will the Fed cut rates in September 2026?',
                    buyYesExchange: 'polymarket',
                    buyYesPrice: 0.52,
                    buyNoExchange: 'kalshi',
                    buyNoPrice: 0.45,
                    totalCost: 0.97,
                    grossProfit: 0.03,
                    netProfit: 0.013,
                    roi: 1.34,
                    estimatedFees: {
                        polymarketFee: 0.0097,
                        kalshiFee: 0.00679,
                        total: 0.01649,
                    },
                    maxPositionSize: 12500,
                    detectedAt: 1718784000000,
                },
            ],
        },
    }),
    __param(0, (0, common_1.Query)('minRoi')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArbController.prototype, "getOpportunities", null);
exports.ArbController = ArbController = __decorate([
    (0, swagger_1.ApiTags)('arb'),
    (0, common_1.Controller)('arb'),
    __metadata("design:paramtypes", [arb_engine_service_1.ArbEngineService])
], ArbController);
//# sourceMappingURL=arb.controller.js.map