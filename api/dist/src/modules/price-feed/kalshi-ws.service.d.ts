import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class KalshiWsService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly events;
    private readonly logger;
    private ws;
    private reconnectTimer;
    private msgSeq;
    private subscribedTickers;
    private books;
    constructor(config: ConfigService, events: EventEmitter2);
    onModuleInit(): void;
    onModuleDestroy(): void;
    subscribeToMarkets(tickers: string[]): void;
    private connect;
    private sendSubscription;
    private handleMessage;
    private applyDelta;
    private normalizeBook;
    private scheduleReconnect;
    private cleanup;
}
