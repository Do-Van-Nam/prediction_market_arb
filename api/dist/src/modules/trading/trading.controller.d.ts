import { TradingService } from './trading.service';
import type { PlaceArbOrderDto, PlaceOrderDto } from '../../common/types';
export declare class TradingController {
    private readonly service;
    constructor(service: TradingService);
    placeOrder(dto: PlaceOrderDto): Promise<void>;
    placeArbOrder(dto: PlaceArbOrderDto): Promise<void>;
    getOrders(userId: string): Promise<{
        exchange: string;
        marketId: string;
        question: string;
        price: number | null;
        side: string;
        slug: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        exchangeOrderId: string | null;
        orderType: string;
        size: number;
        filledSize: number;
        remainingSize: number | null;
        filledPrice: number | null;
        fees: number | null;
        status: string;
        arbOrderId: string | null;
    }[]>;
    getPositions(userId: string): Promise<{
        exchange: string;
        marketId: string;
        question: string;
        side: string;
        slug: string;
        id: string;
        updatedAt: Date;
        userId: string;
        status: string;
        shares: number;
        avgEntryPrice: number;
        currentPrice: number;
        cost: number;
        currentValue: number;
        unrealizedPnl: number;
        unrealizedPnlPct: number;
        resolvedValue: number | null;
        openedAt: Date;
        closedAt: Date | null;
    }[]>;
    cancelOrder(orderId: string, body: {
        exchange: string;
        userId: string;
    }): Promise<void>;
}
