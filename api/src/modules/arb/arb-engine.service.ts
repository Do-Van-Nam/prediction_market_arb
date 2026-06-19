import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../common/redis/redis.module';
import { ArbCalculatorService } from './arb-calculator.service';
import { MarketMapperService } from './market-mapper.service';
import type { PriceTick, ArbOpportunity } from '../../common/types';
import { EventEmitter2 } from '@nestjs/event-emitter';

const ARB_CACHE_TTL = 60; // seconds
const PRICE_CACHE_TTL = 10;

@Injectable()
export class ArbEngineService {
  private readonly logger = new Logger(ArbEngineService.name);
  private priceCache = new Map<string, PriceTick>(); // key: `${exchange}:${slug}`

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly calculator: ArbCalculatorService,
    private readonly mapper: MarketMapperService,
    private readonly events: EventEmitter2,
  ) {}

  @OnEvent('price.tick')
  async handlePriceTick(tick: PriceTick) {
    // Resolve slug from exchange-specific ID
    let slug: string | undefined;
    if (tick.exchange === 'polymarket') {
      slug = this.mapper.findSlugByPolyAsset(tick.marketId) ?? tick.slug;
    } else {
      slug = this.mapper.findSlugByKalshiTicker(tick.marketId) ?? tick.slug;
    }

    const normalizedTick = { ...tick, slug };
    this.priceCache.set(`${tick.exchange}:${slug}`, normalizedTick);

    // Cache in Redis for frontend REST polling fallback
    await this.redis.setex(
      `price:${tick.exchange}:${slug}`,
      PRICE_CACHE_TTL,
      JSON.stringify(normalizedTick),
    );

    // Try to compute arb if we have both sides
    const polyTick = this.priceCache.get(`polymarket:${slug}`);
    const kalshiTick = this.priceCache.get(`kalshi:${slug}`);
    if (!polyTick || !kalshiTick) return;

    const opp = this.calculator.calculate(polyTick, kalshiTick);
    if (!opp) return;

    this.logger.debug(`Arb detected: ${slug} ROI=${opp.roi.toFixed(2)}%`);

    // Publish to Redis (Socket.io gateway subscribes)
    await this.redis.setex(
      `arb:${slug}`,
      ARB_CACHE_TTL,
      JSON.stringify(opp),
    );
    await this.redis.publish('arb:detected', JSON.stringify(opp));

    // Emit internal event so gateway can broadcast
    this.events.emit('arb.detected', opp);
  }

  async getActiveOpportunities(): Promise<ArbOpportunity[]> {
    const keys = await this.redis.keys('arb:*');
    if (keys.length === 0) return [];
    const values = await this.redis.mget(...keys);
    return values
      .filter(Boolean)
      .map((v) => JSON.parse(v!) as ArbOpportunity);
  }
}
