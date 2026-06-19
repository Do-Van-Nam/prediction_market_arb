import Redis from 'ioredis';
import { ArbCalculatorService } from './arb-calculator.service';
import { MarketMapperService } from './market-mapper.service';
import type { PriceTick, ArbOpportunity } from '../../common/types';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class ArbEngineService {
    private readonly redis;
    private readonly calculator;
    private readonly mapper;
    private readonly events;
    private readonly logger;
    private priceCache;
    constructor(redis: Redis, calculator: ArbCalculatorService, mapper: MarketMapperService, events: EventEmitter2);
    handlePriceTick(tick: PriceTick): Promise<void>;
    getActiveOpportunities(): Promise<ArbOpportunity[]>;
}
