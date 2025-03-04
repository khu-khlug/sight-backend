import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { DiscordAdapter } from '@khlug/app/infra/discord/DiscordAdapter';
import { DiscordStateGenerator } from '@khlug/app/infra/discord/DiscordStateGenerator';

import { InfraBlueManageController } from '@khlug/app/interface/infraBlue/manager/InfraBlueManageController';
import { UserManageController } from '@khlug/app/interface/user/manager/UserManageController';
import { UserController } from '@khlug/app/interface/user/public/UserController';

import { DiscordAdapterToken } from '@khlug/app/application/adapter/IDiscordAdapter';
import { DiscordStateGeneratorToken } from '@khlug/app/application/adapter/IDiscordStateGenerator';
import { UpdateDoorLockPasswordCommandHandler } from '@khlug/app/application/infraBlue/command/updateDoorLockPassword/UpdateDoorLockPasswordCommandHandler';
import { GetDoorLockPasswordQueryHandler } from '@khlug/app/application/infraBlue/query/getDoorLockPassword/GetDoorLockPasswordQueryHandler';
import { CreateDiscordIntegrationCommandHandler } from '@khlug/app/application/user/command/createDiscordIntegration/CreateDiscordIntegrationCommandHandler';
import { CreateDiscordOAuth2UrlCommandHandler } from '@khlug/app/application/user/command/createDiscordOAuth2Url/CreateDiscordOAuth2UrlCommandHandler';
import { RemoveDiscordIntegrationCommandHandler } from '@khlug/app/application/user/command/removeDiscordIntegration/RemoveDiscordIntegrationCommandHandler';
import { GetDiscordIntegrationQueryHandler } from '@khlug/app/application/user/query/getDiscordIntegration/GetDiscordIntegrationQueryHandler';
import { ListUserQueryHandler } from '@khlug/app/application/user/query/listUser/ListUserQueryHandler';

import { Cache } from '@khlug/app/domain/cache/model/Cache';
import { DiscordIntegration } from '@khlug/app/domain/discord/model/DiscordIntegration';
import { FeeHistory } from '@khlug/app/domain/fee/model/FeeHistory';
import { User } from '@khlug/app/domain/user/model/User';

const adapters = [
  { provide: DiscordAdapterToken, useClass: DiscordAdapter },
  { provide: DiscordStateGeneratorToken, useClass: DiscordStateGenerator },
];

const controllers = [UserController];
const manageControllers = [InfraBlueManageController, UserManageController];

const commandHandlers = [
  UpdateDoorLockPasswordCommandHandler,
  CreateDiscordIntegrationCommandHandler,
  CreateDiscordOAuth2UrlCommandHandler,
  RemoveDiscordIntegrationCommandHandler,
];
const queryHandlers = [
  GetDoorLockPasswordQueryHandler,
  ListUserQueryHandler,
  GetDiscordIntegrationQueryHandler,
];

@Module({
  imports: [
    MikroOrmModule.forFeature([Cache, User, FeeHistory, DiscordIntegration]),
  ],
  controllers: [...controllers, ...manageControllers],
  providers: [...adapters, ...commandHandlers, ...queryHandlers],
})
export class AppModule {}
