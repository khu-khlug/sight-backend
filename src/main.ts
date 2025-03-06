// TODO: discord.js에서 Nodejs 18부터 지원하는 ReadableStream을 사용하므로,
//       라이브러리를 정상적으로 사용하기 위해 폴리필을 적용하였습니다.
//       추후 포팅이 완료되어 Node.js 버전을 올릴 수 있을 때가 오면 제거해야 합니다.
import 'web-streams-polyfill/polyfill';

import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { AppConfig } from '@khlug/core/config/AppConfig';

import { RootModule } from '@khlug/RootModule';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

async function bootstrap() {
  const app = await NestFactory.create(RootModule);

  const appConfig = app.get(ConfigService).getOrThrow<AppConfig>('app');
  const corsOptions: CorsOptions | undefined =
    appConfig.env === 'production'
      ? {
          origin: ['https://khlug.org', 'https://app.khlug.org'],
          credentials: true,
        }
      : {
          origin: ['http://localhost:5173'],
          credentials: true,
        };

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
