import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import WebSocket from 'ws';
import { PriceTick } from '../../common/types';

const WS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/market';

@Injectable()
export class PolymarketWsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PolymarketWsService.name);
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscribedAssets: string[] = [];

  constructor(private readonly events: EventEmitter2) {}

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.cleanup();
  }

  subscribeToAssets(assetIds: string[]) {
    this.subscribedAssets = assetIds;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscription(assetIds);
    }
  }

  private connect() {
    this.logger.log('Connecting to Polymarket WebSocket...');
    this.ws = new WebSocket(WS_URL);

    this.ws.on('open', () => {
      this.logger.log('Polymarket WS connected');
      if (this.subscribedAssets.length > 0) {
        this.sendSubscription(this.subscribedAssets);
      }
    });

    this.ws.on('message', (data: Buffer) => {
      try {
        const messages = JSON.parse(data.toString());
        const arr = Array.isArray(messages) ? messages : [messages];
        for (const msg of arr) {
          this.handleMessage(msg);
        }
      } catch {
        // skip malformed messages
      }
    });

    this.ws.on('error', (err) => {
      this.logger.error('Polymarket WS error', err.message);
    });

    this.ws.on('close', () => {
      this.logger.warn('Polymarket WS closed, reconnecting in 5s...');
      this.scheduleReconnect();
    });
  }

  private sendSubscription(assetIds: string[]) {
    const msg = {
      type: 'subscribe',
      channel: 'market',
      assets_ids: assetIds,
    };
    this.ws?.send(JSON.stringify(msg));
  }

  private handleMessage(msg: Record<string, unknown>) {
    const eventType = msg.event_type as string;

    if (eventType === 'book' || eventType === 'price_change') {
      const tick = this.normalize(msg);
      if (tick) {
        this.events.emit('price.tick', tick);
      }
    }
  }

  private normalize(msg: Record<string, unknown>): PriceTick | null {
    try {
      const assetId = msg.asset_id as string;
      const market = msg.market as string;
      if (!assetId) return null;

      const bestBidYes = parseFloat((msg.best_bid as string) ?? '0');
      const bestAskYes = parseFloat((msg.best_ask as string) ?? '0');
      const midPrice = (bestBidYes + bestAskYes) / 2;

      return {
        exchange: 'polymarket',
        marketId: assetId,
        slug: market ?? assetId,
        question: (msg.question as string) ?? '',
        yesPrice: midPrice,
        noPrice: 1 - midPrice,
        bestBidYes,
        bestAskYes,
        volume24h: parseFloat((msg.volume as string) ?? '0'),
        liquidity: parseFloat((msg.liquidity as string) ?? '0'),
        expiryDate: (msg.end_date_iso as string) ?? '',
        timestamp: Date.now(),
      };
    } catch {
      return null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  private cleanup() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.ws?.close();
  }
}
