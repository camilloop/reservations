import { Logger, Module } from '@nestjs/common';

import { LoggerMiddleware } from './logger.middleware';

@Module({
  providers: [Logger, LoggerMiddleware],
})
export class LoggerModule {}
