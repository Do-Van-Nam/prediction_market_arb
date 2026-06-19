import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PolymarketWsService } from './polymarket-ws.service';
import { KalshiWsService } from './kalshi-ws.service';

@Module({
  imports: [EventEmitterModule],
  providers: [PolymarketWsService, KalshiWsService],
  exports: [PolymarketWsService, KalshiWsService],
})
export class PriceFeedModule {}
