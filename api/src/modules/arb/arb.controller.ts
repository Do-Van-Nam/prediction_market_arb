import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ArbEngineService } from './arb-engine.service';

@ApiTags('arb')
@Controller('arb')
export class ArbController {
  constructor(private readonly engine: ArbEngineService) {}

  @Get('opportunities')
  @ApiOperation({
    summary: 'Get all currently active arbitrage opportunities',
    description:
      'Returns opportunities cached in Redis (TTL 60s). Refreshed in real-time as Polymarket & Kalshi WebSocket prices arrive.',
  })
  @ApiQuery({
    name: 'minRoi',
    required: false,
    type: Number,
    example: 1.5,
    description: 'Filter: minimum ROI % (default 0)',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of active arb opportunities sorted by ROI descending',
    schema: {
      example: [
        {
          id: 'fed-rate-cut-sept-2026-1718784000000',
          slug: 'fed-rate-cut-sept-2026',
          question: 'Will the Fed cut rates in September 2026?',
          buyYesExchange: 'polymarket',
          buyYesPrice: 0.52,
          buyNoExchange: 'kalshi',
          buyNoPrice: 0.45,
          totalCost: 0.97,
          grossProfit: 0.03,
          netProfit: 0.013,
          roi: 1.34,
          estimatedFees: {
            polymarketFee: 0.0097,
            kalshiFee: 0.00679,
            total: 0.01649,
          },
          maxPositionSize: 12500,
          detectedAt: 1718784000000,
        },
      ],
    },
  })
  async getOpportunities(@Query('minRoi') minRoi?: string) {
    const all = await this.engine.getActiveOpportunities();
    const threshold = minRoi ? parseFloat(minRoi) : 0;
    return all
      .filter((o) => o.roi >= threshold)
      .sort((a, b) => b.roi - a.roi);
  }
}
