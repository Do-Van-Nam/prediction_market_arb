import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { GatewayController } from './gateway.controller';

@Module({
  controllers: [GatewayController],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class GatewayModule {}
