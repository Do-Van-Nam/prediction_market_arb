"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArbModule = void 0;
const common_1 = require("@nestjs/common");
const arb_calculator_service_1 = require("./arb-calculator.service");
const market_mapper_service_1 = require("./market-mapper.service");
const arb_engine_service_1 = require("./arb-engine.service");
const arb_controller_1 = require("./arb.controller");
let ArbModule = class ArbModule {
};
exports.ArbModule = ArbModule;
exports.ArbModule = ArbModule = __decorate([
    (0, common_1.Module)({
        controllers: [arb_controller_1.ArbController],
        providers: [arb_calculator_service_1.ArbCalculatorService, market_mapper_service_1.MarketMapperService, arb_engine_service_1.ArbEngineService],
        exports: [arb_engine_service_1.ArbEngineService, market_mapper_service_1.MarketMapperService],
    })
], ArbModule);
//# sourceMappingURL=arb.module.js.map