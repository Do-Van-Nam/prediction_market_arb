import { ArbOpportunity, PriceTick } from '../../common/types';
export declare class ArbCalculatorService {
    calculate(polyTick: PriceTick, kalshiTick: PriceTick): ArbOpportunity | null;
}
