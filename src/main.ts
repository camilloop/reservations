import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as process from 'process';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { LoggerLevel } from './_shared/core/configs/logger-level.enum';
import { logger } from './_shared/core/configs/logger';
import { swaggerConfig } from './_shared/configs/swagger';

async function bootstrap(): Promise<void> {
  const logLevel = process.env.LOG_LEVEL as LoggerLevel;

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(logger(logLevel)),
  });

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap().then(() =>
  new Logger().log(`${process.env.PROCESS_NAME} started successfully on port ${process.env.PORT || 3000}`),
);
