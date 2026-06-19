import { PrismaService } from '../../prisma.service';
export declare class MarketsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(category?: string): import("@prisma/client").Prisma.PrismaPromise<{
        question: string;
        slug: string;
        expiryDate: string;
        id: string;
        category: string;
        polymarketConditionId: string;
        polymarketTokenIdYes: string;
        polymarketTokenIdNo: string;
        kalshiEventTicker: string;
        kalshiMarketTicker: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findBySlug(slug: string): import("@prisma/client").Prisma.Prisma__MarketMappingClient<{
        question: string;
        slug: string;
        expiryDate: string;
        id: string;
        category: string;
        polymarketConditionId: string;
        polymarketTokenIdYes: string;
        polymarketTokenIdNo: string;
        kalshiEventTicker: string;
        kalshiMarketTicker: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    upsert(data: {
        slug: string;
        polymarketConditionId: string;
        polymarketTokenIdYes: string;
        polymarketTokenIdNo: string;
        kalshiEventTicker: string;
        kalshiMarketTicker: string;
        question: string;
        category: string;
        expiryDate: string;
    }): Promise<{
        question: string;
        slug: string;
        expiryDate: string;
        id: string;
        category: string;
        polymarketConditionId: string;
        polymarketTokenIdYes: string;
        polymarketTokenIdNo: string;
        kalshiEventTicker: string;
        kalshiMarketTicker: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
