import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppConfig } from '@khlug/core/config/AppConfig';

import { RootModule } from '@khlug/RootModule';

async function bootstrap() {
  const app = await NestFactory.create(RootModule);

  const appConfig = app.get(ConfigService).getOrThrow<AppConfig>('app');
  const corsOptions: CorsOptions | undefined =
    appConfig.env === 'production'
      ? {
          origin: ['https://khlug.org', 'https://app.khlug.org'],
          credentials: true,
        }
      : undefined;

  app.enableCors(corsOptions);
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
