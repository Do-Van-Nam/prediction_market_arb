import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { MarketMapping } from '../../common/types';

@Injectable()
export class MarketMapperService implements OnModuleInit {
  private readonly logger = new Logger(MarketMapperService.name);
  private mappings: MarketMapping[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.loadMappings();
  }

  async loadMappings() {
    const rows = await this.prisma.marketMapping.findMany({
      where: { active: true },
    });
    this.mappings = rows.map((r) => ({
      slug: r.slug,
      polymarketConditionId: r.polymarketConditionId,
      polymarketTokenIdYes: r.polymarketTokenIdYes,
      polymarketTokenIdNo: r.polymarketTokenIdNo,
      kalshiEventTicker: r.kalshiEventTicker,
      kalshiMarketTicker: r.kalshiMarketTicker,
      question: r.question,
      category: r.category,
      expiryDate: r.expiryDate,
    }));
    this.logger.log(`Loaded ${this.mappings.length} market mappings`);
  }

  getAll(): MarketMapping[] {
    return this.mappings;
  }

  getBySlug(slug: string): MarketMapping | undefined {
    return this.mappings.find((m) => m.slug === slug);
  }

  /** Returns slug for a given Polymarket asset ID (YES token) */
  findSlugByPolyAsset(assetId: string): string | undefined {
    return this.mappings.find((m) => m.polymarketTokenIdYes === assetId)?.slug;
  }

  /** Returns slug for a given Kalshi market ticker */
  findSlugByKalshiTicker(ticker: string): string | undefined {
    return this.mappings.find((m) => m.kalshiMarketTicker === ticker)?.slug;
  }
}
