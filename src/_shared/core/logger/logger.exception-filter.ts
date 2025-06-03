import { Catch, ArgumentsHost, Logger, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class LoggerExceptionFilter extends BaseExceptionFilter {
  constructor(private readonly logger: Logger) {
    super();
  }

  catch(exception: HttpException, host: ArgumentsHost): void {
    super.catch(exception, host);
    this.logger.error(`Exception: ${exception.message}`);
    this.logger.error(`Exception details: ${JSON.stringify(exception)}`);
  }
}
