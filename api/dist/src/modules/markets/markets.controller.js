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
exports.MarketsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const markets_service_1 = require("./markets.service");
let MarketsController = class MarketsController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(category) {
        return this.service.findAll(category);
    }
    findOne(slug) {
        return this.service.findBySlug(slug);
    }
};
exports.MarketsController = MarketsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all active market mappings (Polymarket ↔ Kalshi)' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, example: 'politics', description: 'Filter by category' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Array of market mappings',
        schema: {
            example: [
                {
                    id: 'clxyz123',
                    slug: 'fed-rate-cut-sept-2026',
                    question: 'Will the Fed cut rates in September 2026?',
                    category: 'economics',
                    polymarketConditionId: '0xabc...',
                    polymarketTokenIdYes: '0x111...',
                    polymarketTokenIdNo: '0x222...',
                    kalshiEventTicker: 'FED-26SEP',
                    kalshiMarketTicker: 'FED-26SEP-Y25',
                    expiryDate: '2026-09-30',
                    active: true,
                },
            ],
        },
    }),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarketsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single market mapping by slug' }),
    (0, swagger_1.ApiParam)({ name: 'slug', example: 'fed-rate-cut-sept-2026' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Market mapping or null',
        schema: {
            example: {
                id: 'clxyz123',
                slug: 'fed-rate-cut-sept-2026',
                question: 'Will the Fed cut rates in September 2026?',
                category: 'economics',
                polymarketConditionId: '0xabc...',
                polymarketTokenIdYes: '0x111...',
                polymarketTokenIdNo: '0x222...',
                kalshiEventTicker: 'FED-26SEP',
                kalshiMarketTicker: 'FED-26SEP-Y25',
                expiryDate: '2026-09-30',
                active: true,
            },
        },
    }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarketsController.prototype, "findOne", null);
exports.MarketsController = MarketsController = __decorate([
    (0, swagger_1.ApiTags)('markets'),
    (0, common_1.Controller)('markets'),
    __metadata("design:paramtypes", [markets_service_1.MarketsService])
], MarketsController);
//# sourceMappingURL=markets.controller.js.map