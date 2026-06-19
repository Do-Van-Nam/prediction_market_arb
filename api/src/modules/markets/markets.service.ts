import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MarketsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(category?: string) {
    return this.prisma.marketMapping.findMany({
      where: { active: true, ...(category ? { category } : {}) },
      orderBy: { question: 'asc' },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.marketMapping.findUnique({ where: { slug } });
  }

  async upsert(data: {
    slug: string;
    polymarketConditionId: string;
    polymarketTokenIdYes: string;
    polymarketTokenIdNo: string;
    kalshiEventTicker: string;
    kalshiMarketTicker: string;
    question: string;
    category: string;
    expiryDate: string;
  }) {
    return this.prisma.marketMapping.upsert({
      where: { slug: data.slug },
      create: { ...data, active: true },
      update: data,
    });
  }
}
