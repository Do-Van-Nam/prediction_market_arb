import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarketsService } from './markets.service';

@ApiTags('markets')
@Controller('markets')
export class MarketsController {
  constructor(private readonly service: MarketsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active market mappings (Polymarket ↔ Kalshi)' })
  @ApiQuery({ name: 'category', required: false, example: 'politics', description: 'Filter by category' })
  @ApiResponse({
    status: 200,
    description: 'Array of market mappings',
    schema: {
      example: [
        {
          id: 'clxyz123',
          slug: 'fed-rate-cut-sept-2026',
          question: 'Will the Fed cut rates in September 2026?',
          category: 'economics',
          polymarketConditionId: '0xabc...',
          polymarketTokenIdYes: '0x111...',
          polymarketTokenIdNo: '0x222...',
          kalshiEventTicker: 'FED-26SEP',
          kalshiMarketTicker: 'FED-26SEP-Y25',
          expiryDate: '2026-09-30',
          active: true,
        },
      ],
    },
  })
  findAll(@Query('category') category?: string) {
    return this.service.findAll(category);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get single market mapping by slug' })
  @ApiParam({ name: 'slug', example: 'fed-rate-cut-sept-2026' })
  @ApiResponse({
    status: 200,
    description: 'Market mapping or null',
    schema: {
      example: {
        id: 'clxyz123',
        slug: 'fed-rate-cut-sept-2026',
        question: 'Will the Fed cut rates in September 2026?',
        category: 'economics',
        polymarketConditionId: '0xabc...',
        polymarketTokenIdYes: '0x111...',
        polymarketTokenIdNo: '0x222...',
        kalshiEventTicker: 'FED-26SEP',
        kalshiMarketTicker: 'FED-26SEP-Y25',
        expiryDate: '2026-09-30',
        active: true,
      },
    },
  })
  findOne(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }
}
