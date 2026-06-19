import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.setGlobalPrefix('api');

  // Swagger docs at /docs (outside globalPrefix)
  const config = new DocumentBuilder()
    .setTitle('PredictArb API')
    .setDescription(
      'Backend API for detecting and trading arbitrage opportunities across Polymarket & Kalshi prediction markets.',
    )
    .setVersion('1.0')
    .addTag('markets', 'Market mappings between Polymarket and Kalshi')
    .addTag('trading', 'Place and manage orders across exchanges')
    .addTag('arb', 'Live arbitrage opportunities')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
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
