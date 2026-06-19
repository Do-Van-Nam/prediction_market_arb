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
var PolymarketWsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolymarketWsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const ws_1 = __importDefault(require("ws"));
const WS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/market';
let PolymarketWsService = PolymarketWsService_1 = class PolymarketWsService {
    events;
    logger = new common_1.Logger(PolymarketWsService_1.name);
    ws = null;
    reconnectTimer = null;
    subscribedAssets = [];
    constructor(events) {
        this.events = events;
    }
    onModuleInit() {
        this.connect();
    }
    onModuleDestroy() {
        this.cleanup();
    }
    subscribeToAssets(assetIds) {
        this.subscribedAssets = assetIds;
        if (this.ws?.readyState === ws_1.default.OPEN) {
            this.sendSubscription(assetIds);
        }
    }
    connect() {
        this.logger.log('Connecting to Polymarket WebSocket...');
        this.ws = new ws_1.default(WS_URL);
        this.ws.on('open', () => {
            this.logger.log('Polymarket WS connected');
            if (this.subscribedAssets.length > 0) {
                this.sendSubscription(this.subscribedAssets);
            }
        });
        this.ws.on('message', (data) => {
            try {
                const messages = JSON.parse(data.toString());
                const arr = Array.isArray(messages) ? messages : [messages];
                for (const msg of arr) {
                    this.handleMessage(msg);
                }
            }
            catch {
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
    sendSubscription(assetIds) {
        const msg = {
            type: 'subscribe',
            channel: 'market',
            assets_ids: assetIds,
        };
        this.ws?.send(JSON.stringify(msg));
    }
    handleMessage(msg) {
        const eventType = msg.event_type;
        if (eventType === 'book' || eventType === 'price_change') {
            const tick = this.normalize(msg);
            if (tick) {
                this.events.emit('price.tick', tick);
            }
        }
    }
    normalize(msg) {
        try {
            const assetId = msg.asset_id;
            const market = msg.market;
            if (!assetId)
                return null;
            const bestBidYes = parseFloat(msg.best_bid ?? '0');
            const bestAskYes = parseFloat(msg.best_ask ?? '0');
            const midPrice = (bestBidYes + bestAskYes) / 2;
            return {
                exchange: 'polymarket',
                marketId: assetId,
                slug: market ?? assetId,
                question: msg.question ?? '',
                yesPrice: midPrice,
                noPrice: 1 - midPrice,
                bestBidYes,
                bestAskYes,
                volume24h: parseFloat(msg.volume ?? '0'),
                liquidity: parseFloat(msg.liquidity ?? '0'),
                expiryDate: msg.end_date_iso ?? '',
                timestamp: Date.now(),
            };
        }
        catch {
            return null;
        }
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
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        this.ws?.close();
    }
};
exports.PolymarketWsService = PolymarketWsService;
exports.PolymarketWsService = PolymarketWsService = PolymarketWsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], PolymarketWsService);
//# sourceMappingURL=polymarket-ws.service.js.map