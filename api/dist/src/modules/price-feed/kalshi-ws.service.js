"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var KalshiWsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KalshiWsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const ws_1 = __importDefault(require("ws"));
const WS_URL = 'wss://external-api-ws.kalshi.com/trade-api/ws/v2';
let KalshiWsService = KalshiWsService_1 = class KalshiWsService {
    config;
    events;
    logger = new common_1.Logger(KalshiWsService_1.name);
    ws = null;
    reconnectTimer = null;
    msgSeq = 1;
    subscribedTickers = [];
    books = new Map();
    constructor(config, events) {
        this.config = config;
        this.events = events;
    }
    onModuleInit() {
        this.connect();
    }
    onModuleDestroy() {
        this.cleanup();
    }
    subscribeToMarkets(tickers) {
        this.subscribedTickers = tickers;
        if (this.ws?.readyState === ws_1.default.OPEN) {
            this.sendSubscription(tickers);
        }
    }
    connect() {
        const apiKey = this.config.get('KALSHI_API_KEY');
        if (!apiKey) {
            this.logger.warn('KALSHI_API_KEY not set — skipping WS connection');
            return;
        }
        this.logger.log('Connecting to Kalshi WebSocket...');
        this.ws = new ws_1.default(WS_URL, {
            headers: { 'KALSHI-ACCESS-KEY': apiKey },
        });
        this.ws.on('open', () => {
            this.logger.log('Kalshi WS connected');
            if (this.subscribedTickers.length > 0) {
                this.sendSubscription(this.subscribedTickers);
            }
        });
        this.ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());
                this.handleMessage(msg);
            }
            catch {
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
    sendSubscription(tickers) {
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
    handleMessage(msg) {
        const type = msg.type;
        if (type === 'orderbook_snapshot') {
            const data = msg.msg;
            this.books.set(data.market_ticker, data);
            const tick = this.normalizeBook(data);
            if (tick)
                this.events.emit('price.tick', tick);
        }
        if (type === 'orderbook_delta') {
            const data = msg.msg;
            const ticker = data.market_ticker;
            const snapshot = this.books.get(ticker);
            if (snapshot) {
                this.applyDelta(snapshot, data);
                const tick = this.normalizeBook(snapshot);
                if (tick)
                    this.events.emit('price.tick', tick);
            }
        }
    }
    applyDelta(snapshot, delta) {
        const price = delta.price;
        const delta_val = delta.delta;
        const side = delta.side;
        if (side === 'yes') {
            const existing = snapshot.yes.find((l) => l[0] === price);
            if (existing) {
                existing[1] = Math.max(0, existing[1] + delta_val);
            }
            else if (delta_val > 0) {
                snapshot.yes.push([price, delta_val]);
            }
        }
        else {
            const existing = snapshot.no.find((l) => l[0] === price);
            if (existing) {
                existing[1] = Math.max(0, existing[1] + delta_val);
            }
            else if (delta_val > 0) {
                snapshot.no.push([price, delta_val]);
            }
        }
    }
    normalizeBook(book) {
        const yesBids = book.yes.filter((l) => l[1] > 0).sort((a, b) => b[0] - a[0]);
        const yesAsks = book.no.filter((l) => l[1] > 0).sort((a, b) => a[0] - b[0]);
        if (yesBids.length === 0 || yesAsks.length === 0)
            return null;
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
    scheduleReconnect() {
        if (this.reconnectTimer)
            return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, 5000);
    }
    cleanup() {
        if (this.reconnectTimer)
            clearTimeout(this.reconnectTimer);
        this.ws?.close();
    }
};
exports.KalshiWsService = KalshiWsService;
exports.KalshiWsService = KalshiWsService = KalshiWsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        event_emitter_1.EventEmitter2])
], KalshiWsService);
//# sourceMappingURL=kalshi-ws.service.js.map