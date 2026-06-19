"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const redis_module_1 = require("./common/redis/redis.module");
const prisma_module_1 = require("./prisma.module");
const price_feed_module_1 = require("./modules/price-feed/price-feed.module");
const arb_module_1 = require("./modules/arb/arb.module");
const gateway_module_1 = require("./modules/gateway/gateway.module");
const markets_module_1 = require("./modules/markets/markets.module");
const trading_module_1 = require("./modules/trading/trading.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            event_emitter_1.EventEmitterModule.forRoot({ wildcard: false }),
            redis_module_1.RedisModule,
            prisma_module_1.PrismaModule,
            price_feed_module_1.PriceFeedModule,
            arb_module_1.ArbModule,
            gateway_module_1.GatewayModule,
            markets_module_1.MarketsModule,
            trading_module_1.TradingModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map