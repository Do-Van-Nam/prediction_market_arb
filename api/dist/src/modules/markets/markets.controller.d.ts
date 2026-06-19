import { MarketsService } from './markets.service';
export declare class MarketsController {
    private readonly service;
    constructor(service: MarketsService);
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
    findOne(slug: string): import("@prisma/client").Prisma.Prisma__MarketMappingClient<{
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
}
