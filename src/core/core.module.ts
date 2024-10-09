import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';

import { DatabaseConfig } from '@khlug/core/config/DatabaseConfig';
import { EntityModels } from '@khlug/core/persistence/Entities';
import { TransactionModule } from '@khlug/core/persistence/transaction/TransactionModule';

@Module({
  imports: [
    ClsModule.forRoot({ middleware: { mount: true } }),
    ConfigModule.forRoot({ envFilePath: `.env.${process.env.NODE_ENV}` }),
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseConfig =
          configService.getOrThrow<DatabaseConfig>('database');

        return {
          entities: EntityModels,
          type: 'mysql',
          host: databaseConfig?.host,
          port: databaseConfig?.port,
          user: databaseConfig?.username,
          password: databaseConfig?.password,
          dbName: databaseConfig?.database,
        };
      },
    }),
    TransactionModule,
  ],
  exports: [ClsModule, MikroOrmModule, TransactionModule],
})
export class CoreModule {}
