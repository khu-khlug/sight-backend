import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { CoreModule } from '@khlug/core/core.module';

import { Cache } from '@khlug/app/domain/cache/model/Cache';

@Module({
  imports: [CoreModule, MikroOrmModule.forFeature([Cache])],
  controllers: [],
  providers: [],
})
export class AppModule {}
