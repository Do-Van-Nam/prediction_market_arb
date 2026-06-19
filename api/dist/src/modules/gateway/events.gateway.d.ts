import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { ArbOpportunity, PriceTick } from '../../common/types';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger;
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribeMarket(slug: string, client: Socket): void;
    broadcastArb(opp: ArbOpportunity): void;
    broadcastPriceTick(tick: PriceTick): void;
    broadcastOrderUpdate(userId: string, order: unknown): void;
}
