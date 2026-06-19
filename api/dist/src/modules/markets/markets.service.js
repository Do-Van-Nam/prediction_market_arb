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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let MarketsService = class MarketsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(category) {
        return this.prisma.marketMapping.findMany({
            where: { active: true, ...(category ? { category } : {}) },
            orderBy: { question: 'asc' },
        });
    }
    findBySlug(slug) {
        return this.prisma.marketMapping.findUnique({ where: { slug } });
    }
    async upsert(data) {
        return this.prisma.marketMapping.upsert({
            where: { slug: data.slug },
            create: { ...data, active: true },
            update: data,
        });
    }
};
exports.MarketsService = MarketsService;
exports.MarketsService = MarketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MarketsService);
//# sourceMappingURL=markets.service.js.map