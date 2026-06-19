import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { ArbOpportunity, PriceTick } from '../../common/types';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true },
  namespace: '/',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:market')
  handleSubscribeMarket(
    @MessageBody() slug: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`market:${slug}`);
  }

  @OnEvent('arb.detected')
  broadcastArb(opp: ArbOpportunity) {
    this.server.emit('arb:detected', opp);
  }

  @OnEvent('price.tick')
  broadcastPriceTick(tick: PriceTick) {
    // Fan-out to slug room only (avoid flooding all clients)
    this.server.to(`market:${tick.slug}`).emit('price:update', tick);
    // Also broadcast to anyone subscribed to all ticks
    this.server.emit('price:update', tick);
  }

  broadcastOrderUpdate(userId: string, order: unknown) {
    this.server.to(`user:${userId}`).emit('order:update', order);
  }
}
