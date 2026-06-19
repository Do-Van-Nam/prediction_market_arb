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
var TradingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let TradingService = TradingService_1 = class TradingService {
    prisma;
    logger = new common_1.Logger(TradingService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async placeOrder(dto) {
        this.logger.log(`placeOrder ${dto.exchange} ${dto.side} ${dto.size}@${dto.price}`);
        throw new common_1.NotImplementedException('Exchange SDK not wired yet');
    }
    async placeArbOrder(dto) {
        this.logger.log(`placeArbOrder arb=${dto.arbOpportunityId} size=${dto.sizeUsd}`);
        throw new common_1.NotImplementedException('Arb execution not wired yet');
    }
    async getOrders(userId) {
        return this.prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async getPositions(userId) {
        return this.prisma.position.findMany({
            where: { userId, status: 'OPEN' },
            orderBy: { openedAt: 'desc' },
        });
    }
    async cancelOrder(orderId, exchange) {
        this.logger.log(`cancelOrder ${orderId} on ${exchange}`);
        throw new common_1.NotImplementedException('Cancel not wired yet');
    }
};
exports.TradingService = TradingService;
exports.TradingService = TradingService = TradingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TradingService);
//# sourceMappingURL=trading.service.js.map