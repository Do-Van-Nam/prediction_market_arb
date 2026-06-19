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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ArbEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArbEngineService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const ioredis_1 = __importDefault(require("ioredis"));
const redis_module_1 = require("../../common/redis/redis.module");
const arb_calculator_service_1 = require("./arb-calculator.service");
const market_mapper_service_1 = require("./market-mapper.service");
const event_emitter_2 = require("@nestjs/event-emitter");
const ARB_CACHE_TTL = 60;
const PRICE_CACHE_TTL = 10;
let ArbEngineService = ArbEngineService_1 = class ArbEngineService {
    redis;
    calculator;
    mapper;
    events;
    logger = new common_1.Logger(ArbEngineService_1.name);
    priceCache = new Map();
    constructor(redis, calculator, mapper, events) {
        this.redis = redis;
        this.calculator = calculator;
        this.mapper = mapper;
        this.events = events;
    }
    async handlePriceTick(tick) {
        let slug;
        if (tick.exchange === 'polymarket') {
            slug = this.mapper.findSlugByPolyAsset(tick.marketId) ?? tick.slug;
        }
        else {
            slug = this.mapper.findSlugByKalshiTicker(tick.marketId) ?? tick.slug;
        }
        const normalizedTick = { ...tick, slug };
        this.priceCache.set(`${tick.exchange}:${slug}`, normalizedTick);
        await this.redis.setex(`price:${tick.exchange}:${slug}`, PRICE_CACHE_TTL, JSON.stringify(normalizedTick));
        const polyTick = this.priceCache.get(`polymarket:${slug}`);
        const kalshiTick = this.priceCache.get(`kalshi:${slug}`);
        if (!polyTick || !kalshiTick)
            return;
        const opp = this.calculator.calculate(polyTick, kalshiTick);
        if (!opp)
            return;
        this.logger.debug(`Arb detected: ${slug} ROI=${opp.roi.toFixed(2)}%`);
        await this.redis.setex(`arb:${slug}`, ARB_CACHE_TTL, JSON.stringify(opp));
        await this.redis.publish('arb:detected', JSON.stringify(opp));
        this.events.emit('arb.detected', opp);
    }
    async getActiveOpportunities() {
        const keys = await this.redis.keys('arb:*');
        if (keys.length === 0)
            return [];
        const values = await this.redis.mget(...keys);
        return values
            .filter(Boolean)
            .map((v) => JSON.parse(v));
    }
};
exports.ArbEngineService = ArbEngineService;
__decorate([
    (0, event_emitter_1.OnEvent)('price.tick'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArbEngineService.prototype, "handlePriceTick", null);
exports.ArbEngineService = ArbEngineService = ArbEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [ioredis_1.default,
        arb_calculator_service_1.ArbCalculatorService,
        market_mapper_service_1.MarketMapperService,
        event_emitter_2.EventEmitter2])
], ArbEngineService);
//# sourceMappingURL=arb-engine.service.js.map