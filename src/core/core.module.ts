import { defineConfig } from '@mikro-orm/mysql';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { ClsModule } from 'nestjs-cls';

import { AuthModule } from '@khlug/core/auth/AuthModule';
import { configuration } from '@khlug/core/config';
import { DatabaseConfig } from '@khlug/core/config/DatabaseConfig';
import { DiscordModule } from '@khlug/core/discord/DiscordModule';
import { HealthController } from '@khlug/core/health/HealthController';
import { HttpExceptionFilter } from '@khlug/core/logging/HttpExceptionFilter';
import { LoggingInterceptor } from '@khlug/core/logging/LoggingInterceptor';
import { EntityModels } from '@khlug/core/persistence/Entities';

@Global()
@Module({
  imports: [
    AuthModule,
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
    DiscordModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
  controllers: [HealthController],
  exports: [ClsModule, ConfigModule, MikroOrmModule, CqrsModule, DiscordModule],
})
export class CoreModule {}
