"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceFeedModule = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const polymarket_ws_service_1 = require("./polymarket-ws.service");
const kalshi_ws_service_1 = require("./kalshi-ws.service");
let PriceFeedModule = class PriceFeedModule {
};
exports.PriceFeedModule = PriceFeedModule;
exports.PriceFeedModule = PriceFeedModule = __decorate([
    (0, common_1.Module)({
        imports: [event_emitter_1.EventEmitterModule],
        providers: [polymarket_ws_service_1.PolymarketWsService, kalshi_ws_service_1.KalshiWsService],
        exports: [polymarket_ws_service_1.PolymarketWsService, kalshi_ws_service_1.KalshiWsService],
    })
], PriceFeedModule);
//# sourceMappingURL=price-feed.module.js.map