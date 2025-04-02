import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, Provider } from '@nestjs/common';

import { DiscordApiAdapter } from '@khlug/app/infra/discord/DiscordApiAdapter';
import { DiscordOAuth2Adapter } from '@khlug/app/infra/discord/DiscordOAuth2Adapter';
import { DiscordStateGenerator } from '@khlug/app/infra/discord/DiscordStateGenerator';
import { CachedDiscordUserIdMapper } from '@khlug/app/infra/notification/CachedDiscordUserIdMapper';
import { DiscordUserIdMapperToken } from '@khlug/app/infra/notification/IDiscordUserIdMapper';
import { DiscordIntegrationEntity } from '@khlug/app/infra/persistence/entity/DiscordIntegrationEntity';
import { DiscordIntegrationQuery } from '@khlug/app/infra/persistence/query/DiscordIntegrationQuery';
import { DiscordIntegrationRepository } from '@khlug/app/infra/persistence/repository/DiscordIntegrationRepository';
import { DiscordIntegrationMapper } from '@khlug/app/infra/persistence/repository/mapper/DiscordIntegrationMapper';

import { InfraBlueManageController } from '@khlug/app/interface/infraBlue/manager/InfraBlueManageController';
import { UserDiscordEventHandler } from '@khlug/app/interface/user/discord/UserDiscordEventHandler';
import { UserManageController } from '@khlug/app/interface/user/manager/UserManageController';
import { UserController } from '@khlug/app/interface/user/public/UserController';

import { DiscordApiAdapterToken } from '@khlug/app/application/adapter/IDiscordApiAdapter';
import { DiscordOAuth2AdapterToken } from '@khlug/app/application/adapter/IDiscordOAuth2Adapter';
import { DiscordStateGeneratorToken } from '@khlug/app/application/adapter/IDiscordStateGenerator';
import { UpdateDoorLockPasswordCommandHandler } from '@khlug/app/application/infraBlue/command/updateDoorLockPassword/UpdateDoorLockPasswordCommandHandler';
import { GetDoorLockPasswordQueryHandler } from '@khlug/app/application/infraBlue/query/getDoorLockPassword/GetDoorLockPasswordQueryHandler';
import { ApplyUserInfoToEnteredDiscordUserCommandHandler } from '@khlug/app/application/user/command/applyUserInfoToEnteredDiscordUser/ApplyUserInfoToEnteredDiscordUserCommandHandler';
import { CreateDiscordIntegrationCommandHandler } from '@khlug/app/application/user/command/createDiscordIntegration/CreateDiscordIntegrationCommandHandler';
import { CreateDiscordOAuth2UrlCommandHandler } from '@khlug/app/application/user/command/createDiscordOAuth2Url/CreateDiscordOAuth2UrlCommandHandler';
import { DeleteUserCommandHandler } from '@khlug/app/application/user/command/deleteUser/DeleteUserCommandHandler';
import { GraduateUserCommandHandler } from '@khlug/app/application/user/command/graduateUser/GraduateUserCommandHandler';
import { RemoveDiscordIntegrationCommandHandler } from '@khlug/app/application/user/command/removeDiscordIntegration/RemoveDiscordIntegrationCommandHandler';
import { GetDiscordIntegrationQueryHandler } from '@khlug/app/application/user/query/getDiscordIntegration/GetDiscordIntegrationQueryHandler';
import { DiscordIntegrationQueryToken } from '@khlug/app/application/user/query/IDiscordIntegrationQuery';
import { ListUserQueryHandler } from '@khlug/app/application/user/query/listUser/ListUserQueryHandler';
import { DiscordMemberService } from '@khlug/app/application/user/service/DiscordMemberService';

import { Cache } from '@khlug/app/domain/cache/model/Cache';
import { DiscordIntegrationRepositoryToken } from '@khlug/app/domain/discord/IDiscordIntegrationRepository';
import { FeeHistory } from '@khlug/app/domain/fee/model/FeeHistory';
import { User } from '@khlug/app/domain/user/model/User';

const adapters: Provider[] = [
  { provide: DiscordApiAdapterToken, useClass: DiscordApiAdapter },
  { provide: DiscordOAuth2AdapterToken, useClass: DiscordOAuth2Adapter },
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
const entityMappers: Provider[] = [DiscordIntegrationMapper];

// 도메인과 무관한 실제 구현체를 넣습니다.
const implementations: Provider[] = [
  {
    provide: DiscordUserIdMapperToken,
    useValue: CachedDiscordUserIdMapper,
  },
];

const controllers = [UserController];
const manageControllers = [InfraBlueManageController, UserManageController];
const discordEventHandlers = [UserDiscordEventHandler];

const commandHandlers: Provider[] = [
  UpdateDoorLockPasswordCommandHandler,
  CreateDiscordIntegrationCommandHandler,
  CreateDiscordOAuth2UrlCommandHandler,
  RemoveDiscordIntegrationCommandHandler,
  ApplyUserInfoToEnteredDiscordUserCommandHandler,
  DeleteUserCommandHandler,
  GraduateUserCommandHandler,
];
const queryHandlers: Provider[] = [
  GetDoorLockPasswordQueryHandler,
  ListUserQueryHandler,
  GetDiscordIntegrationQueryHandler,
];
const services: Provider[] = [DiscordMemberService];

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
    ...entityMappers,
    ...implementations,
    ...discordEventHandlers,
    ...commandHandlers,
    ...queryHandlers,
    ...services,
  ],
})
export class AppModule {}
