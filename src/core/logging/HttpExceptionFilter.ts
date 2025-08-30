import {
  ArgumentsHost,
  Catch,
  ConsoleLogger,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  private readonly logger = new ConsoleLogger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<Request>();
    const res = host.switchToHttp().getResponse<Response>();

    const method = req.method.toUpperCase();
    const url = req.url;

    const message = exception.message;
    const stack = exception.stack;
    const status = exception.getStatus();

    this.logger.error(`Error occurred from ${method} ${url}`, stack);

    res.status(status).json({
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
