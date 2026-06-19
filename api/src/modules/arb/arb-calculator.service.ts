import { Injectable } from '@nestjs/common';
import { ArbOpportunity, PriceTick } from '../../common/types';

const MIN_NET_ROI = 0.005; // Skip if net profit < 0.5%

// Polymarket taker fee: ~1% of cost, Kalshi: ~0.7% of cost
const POLY_FEE_RATE = 0.01;
const KALSHI_FEE_RATE = 0.007;

@Injectable()
export class ArbCalculatorService {
  calculate(polyTick: PriceTick, kalshiTick: PriceTick): ArbOpportunity | null {
    // Scenario 1: Buy YES on Poly, Buy NO on Kalshi
    const s1Cost = polyTick.bestAskYes + (1 - kalshiTick.bestBidYes);
    // Scenario 2: Buy YES on Kalshi, Buy NO on Poly
    const s2Cost = kalshiTick.bestAskYes + (1 - polyTick.bestBidYes);

    const bestCost = Math.min(s1Cost, s2Cost);
    if (bestCost >= 1.0) return null;

    const grossProfit = 1.0 - bestCost;
    const isS1 = s1Cost <= s2Cost;

    const polyFee = bestCost * POLY_FEE_RATE;
    const kalshiFee = bestCost * KALSHI_FEE_RATE;
    const totalFees = polyFee + kalshiFee;
    const netProfit = grossProfit - totalFees;

    if (netProfit / bestCost < MIN_NET_ROI) return null;

    const maxPositionSize =
      Math.min(polyTick.liquidity, kalshiTick.liquidity) * 0.1;

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
}
