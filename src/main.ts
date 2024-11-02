import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { RootModule } from '@khlug/RootModule';

async function bootstrap() {
  const app = await NestFactory.create(RootModule);

  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
