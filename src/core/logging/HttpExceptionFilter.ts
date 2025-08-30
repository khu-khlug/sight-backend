import {
  ArgumentsHost,
  Catch,
  ConsoleLogger,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  private readonly logger = new ConsoleLogger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<Request>();

    const method = req.method.toUpperCase();
    const url = req.url;

    const message = exception.message;
    const stack = exception.stack;

    this.logger.error(
      `Error occurred '${message}' from ${method} ${url}`,
      stack,
    );
  }
}
