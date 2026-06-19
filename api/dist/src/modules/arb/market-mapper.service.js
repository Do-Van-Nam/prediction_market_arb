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
var MarketMapperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketMapperService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let MarketMapperService = MarketMapperService_1 = class MarketMapperService {
    prisma;
    logger = new common_1.Logger(MarketMapperService_1.name);
    mappings = [];
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.loadMappings();
    }
    async loadMappings() {
        const rows = await this.prisma.marketMapping.findMany({
            where: { active: true },
        });
        this.mappings = rows.map((r) => ({
            slug: r.slug,
            polymarketConditionId: r.polymarketConditionId,
            polymarketTokenIdYes: r.polymarketTokenIdYes,
            polymarketTokenIdNo: r.polymarketTokenIdNo,
            kalshiEventTicker: r.kalshiEventTicker,
            kalshiMarketTicker: r.kalshiMarketTicker,
            question: r.question,
            category: r.category,
            expiryDate: r.expiryDate,
        }));
        this.logger.log(`Loaded ${this.mappings.length} market mappings`);
    }
    getAll() {
        return this.mappings;
    }
    getBySlug(slug) {
        return this.mappings.find((m) => m.slug === slug);
    }
    findSlugByPolyAsset(assetId) {
        return this.mappings.find((m) => m.polymarketTokenIdYes === assetId)?.slug;
    }
    findSlugByKalshiTicker(ticker) {
        return this.mappings.find((m) => m.kalshiMarketTicker === ticker)?.slug;
    }
};
exports.MarketMapperService = MarketMapperService;
exports.MarketMapperService = MarketMapperService = MarketMapperService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MarketMapperService);
//# sourceMappingURL=market-mapper.service.js.map