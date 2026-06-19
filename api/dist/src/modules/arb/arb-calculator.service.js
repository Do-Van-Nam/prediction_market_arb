"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArbCalculatorService = void 0;
const common_1 = require("@nestjs/common");
const MIN_NET_ROI = 0.005;
const POLY_FEE_RATE = 0.01;
const KALSHI_FEE_RATE = 0.007;
let ArbCalculatorService = class ArbCalculatorService {
    calculate(polyTick, kalshiTick) {
        const s1Cost = polyTick.bestAskYes + (1 - kalshiTick.bestBidYes);
        const s2Cost = kalshiTick.bestAskYes + (1 - polyTick.bestBidYes);
        const bestCost = Math.min(s1Cost, s2Cost);
        if (bestCost >= 1.0)
            return null;
        const grossProfit = 1.0 - bestCost;
        const isS1 = s1Cost <= s2Cost;
        const polyFee = bestCost * POLY_FEE_RATE;
        const kalshiFee = bestCost * KALSHI_FEE_RATE;
        const totalFees = polyFee + kalshiFee;
        const netProfit = grossProfit - totalFees;
        if (netProfit / bestCost < MIN_NET_ROI)
            return null;
        const maxPositionSize = Math.min(polyTick.liquidity, kalshiTick.liquidity) * 0.1;
        return {
            id: `${polyTick.slug}-${Date.now()}`,
            slug: polyTick.slug,
            question: polyTick.question || kalshiTick.question,
            buyYesExchange: isS1 ? 'polymarket' : 'kalshi',
            buyYesPrice: isS1 ? polyTick.bestAskYes : kalshiTick.bestAskYes,
            buyNoExchange: isS1 ? 'kalshi' : 'polymarket',
            buyNoPrice: isS1
                ? 1 - kalshiTick.bestBidYes
                : 1 - polyTick.bestBidYes,
            totalCost: bestCost,
            grossProfit,
            netProfit,
            roi: (netProfit / bestCost) * 100,
            estimatedFees: { polymarketFee: polyFee, kalshiFee, total: totalFees },
            maxPositionSize,
            detectedAt: Date.now(),
        };
    }
};
exports.ArbCalculatorService = ArbCalculatorService;
exports.ArbCalculatorService = ArbCalculatorService = __decorate([
    (0, common_1.Injectable)()
], ArbCalculatorService);
//# sourceMappingURL=arb-calculator.service.js.map