import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, Provider } from '@nestjs/common';

import { DiscordAdapter } from '@khlug/app/infra/discord/DiscordAdapter';
import { DiscordStateGenerator } from '@khlug/app/infra/discord/DiscordStateGenerator';
import { DiscordIntegrationEntity } from '@khlug/app/infra/persistence/entity/DiscordIntegrationEntity';
import { DiscordIntegrationQuery } from '@khlug/app/infra/persistence/query/DiscordIntegrationQuery';
import { DiscordIntegrationRepository } from '@khlug/app/infra/persistence/repository/DiscordIntegrationRepository';
import { DiscordIntegrationMapper } from '@khlug/app/infra/persistence/repository/mapper/DiscordIntegrationMapper';

import { InfraBlueManageController } from '@khlug/app/interface/infraBlue/manager/InfraBlueManageController';
import { UserDiscordEventHandler } from '@khlug/app/interface/user/discord/UserDiscordEventHandler';
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
import { DiscordIntegrationQueryToken } from '@khlug/app/application/user/query/IDiscordIntegrationQuery';
import { ListUserQueryHandler } from '@khlug/app/application/user/query/listUser/ListUserQueryHandler';

import { Cache } from '@khlug/app/domain/cache/model/Cache';
import { DiscordIntegrationRepositoryToken } from '@khlug/app/domain/discord/IDiscordIntegrationRepository';
import { FeeHistory } from '@khlug/app/domain/fee/model/FeeHistory';
import { User } from '@khlug/app/domain/user/model/User';

const adapters: Provider[] = [
  { provide: DiscordAdapterToken, useClass: DiscordAdapter },
  { provide: DiscordStateGeneratorToken, useClass: DiscordStateGenerator },
];
const queries: Provider[] = [
  { provide: DiscordIntegrationQueryToken, useClass: DiscordIntegrationQuery },
];
const repositories: Provider[] = [
  {
    provide: DiscordIntegrationRepositoryToken,
    useClass: DiscordIntegrationRepository,
  },
];
const mappers: Provider[] = [DiscordIntegrationMapper];

const controllers = [UserController];
const manageControllers = [InfraBlueManageController, UserManageController];
const discordEventHandlers = [UserDiscordEventHandler];

const commandHandlers: Provider[] = [
  UpdateDoorLockPasswordCommandHandler,
  CreateDiscordIntegrationCommandHandler,
  CreateDiscordOAuth2UrlCommandHandler,
  RemoveDiscordIntegrationCommandHandler,
];
const queryHandlers: Provider[] = [
  GetDoorLockPasswordQueryHandler,
  ListUserQueryHandler,
  GetDiscordIntegrationQueryHandler,
];

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Cache,
      User,
      FeeHistory,
      DiscordIntegrationEntity,
    ]),
  ],
  controllers: [...controllers, ...manageControllers],
  providers: [
    ...adapters,
    ...queries,
    ...repositories,
    ...mappers,
    ...discordEventHandlers,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class AppModule {}
