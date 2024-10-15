import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { CoreModule } from '@khlug/core/core.module';

import { Cache } from '@khlug/app/domain/cache/model/Cache';

import { AppModule } from '@khlug/app/AppModule';

@Module({
  imports: [AppModule, CoreModule, MikroOrmModule.forFeature([Cache])],
  controllers: [],
  providers: [],
})
export class RootModule {}
