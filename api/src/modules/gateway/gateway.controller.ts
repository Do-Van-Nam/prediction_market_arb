import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('websocket')
@Controller('ws-info')
export class GatewayController {
  @Get()
  @ApiOperation({
    summary: 'WebSocket event reference (Socket.io at ws://localhost:3001)',
    description: `
Connect via Socket.io:
\`\`\`js
import { io } from 'socket.io-client';
const socket = io('http://localhost:3001');
\`\`\`

**Server → Client events:**

| Event | Payload | Description |
|-------|---------|-------------|
| \`arb:detected\` | ArbOpportunity | New arb opportunity found |
| \`price:update\` | PriceTick | Price change on any market |
| \`order:update\` | OrderResult | Your order status changed |

**Client → Server events:**

| Event | Payload | Description |
|-------|---------|-------------|
| \`subscribe:market\` | slug: string | Join a market room to receive price:update for that slug only |
`,
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        url: 'ws://localhost:3001',
        transport: 'Socket.io v4',
        events: {
          serverToClient: ['arb:detected', 'price:update', 'order:update'],
          clientToServer: ['subscribe:market'],
        },
        sampleArbDetected: {
          id: 'fed-rate-cut-sept-2026-1718784000000',
          slug: 'fed-rate-cut-sept-2026',
          question: 'Will the Fed cut rates in September 2026?',
          buyYesExchange: 'polymarket',
          buyYesPrice: 0.52,
          buyNoExchange: 'kalshi',
          buyNoPrice: 0.45,
          roi: 1.34,
          netProfit: 0.013,
          detectedAt: 1718784000000,
        },
        samplePriceUpdate: {
          exchange: 'polymarket',
          marketId: '0x111aaa...',
          slug: 'fed-rate-cut-sept-2026',
          question: 'Will the Fed cut rates in September 2026?',
          yesPrice: 0.52,
          noPrice: 0.48,
          bestBidYes: 0.515,
          bestAskYes: 0.525,
          volume24h: 125000,
          liquidity: 45000,
          timestamp: 1718784000000,
        },
      },
    },
  })
  getWsInfo() {
    return {
      url: `ws://localhost:${process.env.PORT ?? 3001}`,
      transport: 'Socket.io v4',
      events: {
        serverToClient: ['arb:detected', 'price:update', 'order:update'],
        clientToServer: ['subscribe:market'],
      },
    };
  }
}
