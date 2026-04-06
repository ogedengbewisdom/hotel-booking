import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class ReqLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const startTime = Date.now();

    res.on('finish', () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(
        `[${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms]`,
      );
    });
    next();
  }
}
