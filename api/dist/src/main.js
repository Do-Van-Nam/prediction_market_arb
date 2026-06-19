"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('PredictArb API')
        .setDescription('Backend API for detecting and trading arbitrage opportunities across Polymarket & Kalshi prediction markets.')
        .setVersion('1.0')
        .addTag('markets', 'Market mappings between Polymarket and Kalshi')
        .addTag('trading', 'Place and manage orders across exchanges')
        .addTag('arb', 'Live arbitrage opportunities')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        customSiteTitle: 'PredictArb API Docs',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'list',
            filter: true,
        },
    });
    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(`API:  http://localhost:${port}/api`);
    console.log(`Docs: http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map