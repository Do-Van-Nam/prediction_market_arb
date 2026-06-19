import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { MarketMapping } from '../../common/types';
export declare class MarketMapperService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    private mappings;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    loadMappings(): Promise<void>;
    getAll(): MarketMapping[];
    getBySlug(slug: string): MarketMapping | undefined;
    findSlugByPolyAsset(assetId: string): string | undefined;
    findSlugByKalshiTicker(ticker: string): string | undefined;
}
