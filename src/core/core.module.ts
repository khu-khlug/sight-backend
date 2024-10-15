import { defineConfig } from '@mikro-orm/mysql';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ClsModule } from 'nestjs-cls';

import { configuration } from '@khlug/core/config';
import { DatabaseConfig } from '@khlug/core/config/DatabaseConfig';
import { EntityModels } from '@khlug/core/persistence/Entities';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({ middleware: { mount: true } }),
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [configuration],
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseConfig =
          configService.getOrThrow<DatabaseConfig>('database');

        return defineConfig({
          entities: EntityModels,
          host: databaseConfig?.host,
          port: databaseConfig?.port,
          user: databaseConfig?.username,
          password: databaseConfig?.password,
          dbName: databaseConfig?.database,
        });
      },
    }),
    CqrsModule,
  ],
  exports: [ClsModule, ConfigModule, MikroOrmModule, CqrsModule],
})
export class CoreModule {}
