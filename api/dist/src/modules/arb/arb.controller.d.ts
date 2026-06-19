import { ArbEngineService } from './arb-engine.service';
export declare class ArbController {
    private readonly engine;
    constructor(engine: ArbEngineService);
    getOpportunities(minRoi?: string): Promise<import("../../common/types").ArbOpportunity[]>;
}
