import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const request = {
      headers: req.headers,
      body: req.body,
      originalUrl: req.originalUrl,
    };

    this.logger.debug(`Request: ${JSON.stringify(request)}`);

    next();
  }
}
