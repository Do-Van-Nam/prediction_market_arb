import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TradingService } from './trading.service';
import type { PlaceArbOrderDto, PlaceOrderDto } from '../../common/types';

@ApiTags('trading')
@Controller('trading')
export class TradingController {
  constructor(private readonly service: TradingService) {}

  @Post('order')
  @ApiOperation({ summary: 'Place a single order on Polymarket or Kalshi' })
  @ApiBody({
    schema: {
      example: {
        exchange: 'polymarket',
        marketId: '0x111aaa...',
        side: 'YES',
        orderType: 'LIMIT',
        price: 0.62,
        size: 100,
        userId: 'user_abc123',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Order placed — returns exchange order ID and status',
    schema: {
      example: {
        orderId: 'ord_poly_xyz',
        exchange: 'polymarket',
        status: 'OPEN',
        filledPrice: null,
        filledSize: 0,
        remainingSize: 100,
        fees: 0.62,
        createdAt: '2026-06-19T10:00:00Z',
        slug: 'fed-rate-cut-sept-2026',
        side: 'YES',
        size: 100,
        price: 0.62,
      },
    },
  })
  placeOrder(@Body() dto: PlaceOrderDto) {
    return this.service.placeOrder(dto);
  }

  @Post('arb-order')
  @ApiOperation({
    summary: 'Execute an arbitrage trade — places YES on one exchange and NO on the other simultaneously',
  })
  @ApiBody({
    schema: {
      example: {
        arbOpportunityId: 'arb-fed-rate-cut-sept-2026-1718784000000',
        sizeUsd: 500,
        userId: 'user_abc123',
        slippageTolerance: 0.005,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Both legs placed — returns array of 2 OrderResults',
    schema: {
      example: [
        { orderId: 'ord_poly_001', exchange: 'polymarket', side: 'YES', status: 'OPEN', price: 0.52, size: 961 },
        { orderId: 'ord_kalshi_002', exchange: 'kalshi', side: 'NO', status: 'OPEN', price: 0.45, size: 961 },
      ],
    },
  })
  placeArbOrder(@Body() dto: PlaceArbOrderDto) {
    return this.service.placeArbOrder(dto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get order history for a user' })
  @ApiQuery({ name: 'userId', required: true, example: 'user_abc123' })
  @ApiResponse({
    status: 200,
    description: 'List of orders',
    schema: {
      example: [
        {
          id: 'clxyz456',
          userId: 'user_abc123',
          exchange: 'polymarket',
          slug: 'fed-rate-cut-sept-2026',
          side: 'YES',
          orderType: 'LIMIT',
          price: 0.62,
          size: 100,
          filledSize: 100,
          status: 'FILLED',
          fees: 0.62,
          createdAt: '2026-06-19T10:00:00Z',
        },
      ],
    },
  })
  getOrders(@Query('userId') userId: string) {
    return this.service.getOrders(userId);
  }

  @Get('positions')
  @ApiOperation({ summary: 'Get open positions for a user' })
  @ApiQuery({ name: 'userId', required: true, example: 'user_abc123' })
  @ApiResponse({
    status: 200,
    description: 'List of open positions with unrealized P&L',
    schema: {
      example: [
        {
          id: 'clxyz789',
          userId: 'user_abc123',
          exchange: 'polymarket',
          slug: 'fed-rate-cut-sept-2026',
          question: 'Will the Fed cut rates in September 2026?',
          side: 'YES',
          shares: 100,
          avgEntryPrice: 0.62,
          currentPrice: 0.68,
          cost: 62,
          currentValue: 68,
          unrealizedPnl: 6,
          unrealizedPnlPct: 9.68,
          status: 'OPEN',
          openedAt: '2026-06-19T10:00:00Z',
        },
      ],
    },
  })
  getPositions(@Query('userId') userId: string) {
    return this.service.getPositions(userId);
  }

  @Post('orders/:orderId/cancel')
  @ApiOperation({ summary: 'Cancel an open order' })
  @ApiParam({ name: 'orderId', example: 'ord_poly_xyz' })
  @ApiBody({
    schema: {
      example: { exchange: 'polymarket', userId: 'user_abc123' },
    },
  })
  @ApiResponse({ status: 201, description: 'Order cancelled' })
  cancelOrder(
    @Param('orderId') orderId: string,
    @Body() body: { exchange: string; userId: string },
  ) {
    return this.service.cancelOrder(orderId, body.exchange as 'polymarket' | 'kalshi');
  }
}
