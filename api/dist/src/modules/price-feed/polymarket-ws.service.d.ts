import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class PolymarketWsService implements OnModuleInit, OnModuleDestroy {
    private readonly events;
    private readonly logger;
    private ws;
    private reconnectTimer;
    private subscribedAssets;
    constructor(events: EventEmitter2);
    onModuleInit(): void;
    onModuleDestroy(): void;
    subscribeToAssets(assetIds: string[]): void;
    private connect;
    private sendSubscription;
    private handleMessage;
    private normalize;
    private scheduleReconnect;
    private cleanup;
}
