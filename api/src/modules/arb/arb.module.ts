import { Module } from '@nestjs/common';
import { ArbCalculatorService } from './arb-calculator.service';
import { MarketMapperService } from './market-mapper.service';
import { ArbEngineService } from './arb-engine.service';
import { ArbController } from './arb.controller';

@Module({
  controllers: [ArbController],
  providers: [ArbCalculatorService, MarketMapperService, ArbEngineService],
  exports: [ArbEngineService, MarketMapperService],
})
export class ArbModule {}
