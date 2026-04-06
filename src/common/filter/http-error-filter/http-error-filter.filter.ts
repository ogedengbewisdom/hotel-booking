import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpErrorFilterFilter<T> implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const is_http_exception = exception instanceof HttpException;
    const statusCode = is_http_exception
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = is_http_exception
      ? (exception.getResponse() as any)
      : null;
    const errorCode = is_http_exception
      ? exceptionResponse?.error?.toUpperCase().replace(/ /g, '_') ||
        'UNKNOWN_ERROR'
      : 'INTERNAL_SERVER_ERROR';

    const message = is_http_exception
      ? exceptionResponse?.message || 'An unknown error occurred'
      : (exception as Error)?.message || 'Internal server error';

    res.status(statusCode).json({
      statusCode,
      status: 'error',
      method: req.method,
      path: req.originalUrl,
      error: {
        errorCode,
        message,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
