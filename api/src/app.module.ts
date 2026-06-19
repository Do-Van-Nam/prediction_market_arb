import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisModule } from './common/redis/redis.module';
import { PrismaModule } from './prisma.module';
import { PriceFeedModule } from './modules/price-feed/price-feed.module';
import { ArbModule } from './modules/arb/arb.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { MarketsModule } from './modules/markets/markets.module';
import { TradingModule } from './modules/trading/trading.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot({ wildcard: false }),
    RedisModule,
    PrismaModule,
    PriceFeedModule,
    ArbModule,
    GatewayModule,
    MarketsModule,
    TradingModule,
  ],
})
export class AppModule {}
