export type Exchange = 'polymarket' | 'kalshi';

export interface PriceTick {
  exchange: Exchange;
  marketId: string;
  slug: string;
  question: string;
  yesPrice: number;
  noPrice: number;
  bestBidYes: number;
  bestAskYes: number;
  volume24h: number;
  liquidity: number;
  expiryDate: string;
  timestamp: number;
}

export interface ArbOpportunity {
  id: string;
  slug: string;
  question: string;
  buyYesExchange: Exchange;
  buyYesPrice: number;
  buyNoExchange: Exchange;
  buyNoPrice: number;
  totalCost: number;
  grossProfit: number;
  netProfit: number;
  roi: number;
  estimatedFees: {
    polymarketFee: number;
    kalshiFee: number;
    total: number;
  };
  maxPositionSize: number;
  detectedAt: number;
  expiresAt?: number;
}

export interface OrderResult {
  orderId: string;
  exchange: Exchange;
  status: 'OPEN' | 'FILLED' | 'CANCELLED' | 'FAILED';
  filledPrice?: number;
  filledSize?: number;
  remainingSize?: number;
  fees?: number;
  createdAt: string;
  slug: string;
  side: 'YES' | 'NO';
  size: number;
  price?: number;
}

export interface MarketMapping {
  slug: string;
  polymarketConditionId: string;
  polymarketTokenIdYes: string;
  polymarketTokenIdNo: string;
  kalshiEventTicker: string;
  kalshiMarketTicker: string;
  question: string;
  category: string;
  expiryDate: string;
}

export interface PlaceOrderDto {
  exchange: Exchange;
  marketId: string;
  side: 'YES' | 'NO';
  orderType: 'LIMIT' | 'MARKET' | 'POST_ONLY';
  price?: number;
  size: number;
  userId: string;
}

export interface PlaceArbOrderDto {
  arbOpportunityId: string;
  sizeUsd: number;
  userId: string;
  slippageTolerance: number;
}
