import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

import { AppLoggerService } from '@/libs/logger';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { swaggerDocumentOptions, swaggerPath, swaggerSetupOptions } from './swagger';
import { ServerConfig } from '../config/server.config';
import { SwaggerConfig } from '../config/swagger.config';

export const APP_ROOT_PATH = __dirname;

function middleware(app: INestApplication): void {
  // CORS
  if (ServerConfig.corsEnable) {
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept',
      credentials: true,
    });
  }

  app.use(cookieParser());
}

async function setupGlobalFilters(app: INestApplication) {
  const logger = await app.resolve(AppLoggerService);

  app.useGlobalFilters(new HttpExceptionFilter(logger));
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  await setupGlobalFilters(app);

  // set global api prefix
  app.setGlobalPrefix(ServerConfig.apiPrefix);

  app.useGlobalPipes(new ValidationPipe());

  if (SwaggerConfig.enabled) {
    const document = SwaggerModule.createDocument(app, swaggerDocumentOptions);
    SwaggerModule.setup(swaggerPath, app, document, swaggerSetupOptions);
  }

  if (ServerConfig.enableShutdownHooks) {
    app.enableShutdownHooks();
  }

  // middlewares
  middleware(app);

  await app.listen(ServerConfig.port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${ServerConfig.port}/${ServerConfig.apiPrefix}`,
  );
}

(async () => {
  await bootstrap();
})();
