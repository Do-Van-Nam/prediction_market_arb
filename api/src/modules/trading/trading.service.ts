import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PlaceArbOrderDto, PlaceOrderDto, Exchange } from '../../common/types';

/**
 * Stub trading service — exchange SDK integrations go here.
 * Each method throws NotImplementedException until the real SDK client is wired.
 * Phase 2 work: inject PolymarketTradeClient + KalshiTradeClient.
 */
@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async placeOrder(dto: PlaceOrderDto) {
    this.logger.log(`placeOrder ${dto.exchange} ${dto.side} ${dto.size}@${dto.price}`);
    // TODO Phase 2: call exchange SDK
    throw new NotImplementedException('Exchange SDK not wired yet');
  }

  async placeArbOrder(dto: PlaceArbOrderDto) {
    this.logger.log(`placeArbOrder arb=${dto.arbOpportunityId} size=${dto.sizeUsd}`);
    // TODO Phase 2: fetch opportunity from Redis, place 2 legs concurrently
    throw new NotImplementedException('Arb execution not wired yet');
  }

  async getOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getPositions(userId: string) {
    return this.prisma.position.findMany({
      where: { userId, status: 'OPEN' },
      orderBy: { openedAt: 'desc' },
    });
  }

  async cancelOrder(orderId: string, exchange: Exchange) {
    this.logger.log(`cancelOrder ${orderId} on ${exchange}`);
    // TODO Phase 2: call exchange cancel API
    throw new NotImplementedException('Cancel not wired yet');
  }
}
