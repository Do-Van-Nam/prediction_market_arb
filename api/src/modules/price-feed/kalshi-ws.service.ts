import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import WebSocket from 'ws';
import { PriceTick } from '../../common/types';

const WS_URL = 'wss://external-api-ws.kalshi.com/trade-api/ws/v2';

interface KalshiOrderbookSnapshot {
  market_ticker: string;
  yes: [number, number][];
  no: [number, number][];
}

@Injectable()
export class KalshiWsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KalshiWsService.name);
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private msgSeq = 1;
  private subscribedTickers: string[] = [];
  private books = new Map<string, KalshiOrderbookSnapshot>();

  constructor(
    private readonly config: ConfigService,
    private readonly events: EventEmitter2,
  ) {}

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.cleanup();
  }

  subscribeToMarkets(tickers: string[]) {
    this.subscribedTickers = tickers;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscription(tickers);
    }
  }

  private connect() {
    const apiKey = this.config.get<string>('KALSHI_API_KEY');
    if (!apiKey) {
      this.logger.warn('KALSHI_API_KEY not set — skipping WS connection');
      return;
    }

    this.logger.log('Connecting to Kalshi WebSocket...');
    this.ws = new WebSocket(WS_URL, {
      headers: { 'KALSHI-ACCESS-KEY': apiKey },
    });

    this.ws.on('open', () => {
      this.logger.log('Kalshi WS connected');
      if (this.subscribedTickers.length > 0) {
        this.sendSubscription(this.subscribedTickers);
      }
    });

    this.ws.on('message', (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());
        this.handleMessage(msg);
      } catch {
        // skip malformed
      }
    });

    this.ws.on('error', (err) => {
      this.logger.error('Kalshi WS error', err.message);
    });

    this.ws.on('close', () => {
      this.logger.warn('Kalshi WS closed, reconnecting in 5s...');
      this.scheduleReconnect();
    });
  }

  private sendSubscription(tickers: string[]) {
    const msg = {
      id: this.msgSeq++,
      cmd: 'subscribe',
      params: {
        channels: ['orderbook_delta'],
        market_tickers: tickers,
      },
    };
    this.ws?.send(JSON.stringify(msg));
  }

  private handleMessage(msg: Record<string, unknown>) {
    const type = msg.type as string;

    if (type === 'orderbook_snapshot') {
      const data = msg.msg as KalshiOrderbookSnapshot;
      this.books.set(data.market_ticker, data);
      const tick = this.normalizeBook(data);
      if (tick) this.events.emit('price.tick', tick);
    }

    if (type === 'orderbook_delta') {
      const data = msg.msg as Record<string, unknown>;
      const ticker = data.market_ticker as string;
      const snapshot = this.books.get(ticker);
      if (snapshot) {
        this.applyDelta(snapshot, data);
        const tick = this.normalizeBook(snapshot);
        if (tick) this.events.emit('price.tick', tick);
      }
    }
  }

  private applyDelta(
    snapshot: KalshiOrderbookSnapshot,
    delta: Record<string, unknown>,
  ) {
    const price = delta.price as number;
    const delta_val = delta.delta as number;
    const side = delta.side as string;

    if (side === 'yes') {
      const existing = snapshot.yes.find((l) => l[0] === price);
      if (existing) {
        existing[1] = Math.max(0, existing[1] + delta_val);
      } else if (delta_val > 0) {
        snapshot.yes.push([price, delta_val]);
      }
    } else {
      const existing = snapshot.no.find((l) => l[0] === price);
      if (existing) {
        existing[1] = Math.max(0, existing[1] + delta_val);
      } else if (delta_val > 0) {
        snapshot.no.push([price, delta_val]);
      }
    }
  }

  private normalizeBook(book: KalshiOrderbookSnapshot): PriceTick | null {
    const yesBids = book.yes.filter((l) => l[1] > 0).sort((a, b) => b[0] - a[0]);
    const yesAsks = book.no.filter((l) => l[1] > 0).sort((a, b) => a[0] - b[0]);

    if (yesBids.length === 0 || yesAsks.length === 0) return null;

    // Kalshi prices are in cents (1-99), normalize to 0-1
    const bestBidYes = yesBids[0][0] / 100;
    const bestAskYes = (100 - yesAsks[0][0]) / 100;
    const midPrice = (bestBidYes + bestAskYes) / 2;

    return {
      exchange: 'kalshi',
      marketId: book.market_ticker,
      slug: book.market_ticker,
      question: '',
      yesPrice: midPrice,
      noPrice: 1 - midPrice,
      bestBidYes,
      bestAskYes,
      volume24h: 0,
      liquidity: yesBids.reduce((s, l) => s + l[0] * l[1], 0) / 100,
      expiryDate: '',
      timestamp: Date.now(),
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  private cleanup() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }
}
