import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { InfraBlueManageController } from '@khlug/app/interface/infraBlue/manager/InfraBlueManageController';

import { UpdateDoorLockPasswordCommandHandler } from '@khlug/app/application/infraBlue/command/updateDoorLockPassword/UpdateDoorLockPasswordCommandHandler';
import { GetDoorLockPasswordQueryHandler } from '@khlug/app/application/infraBlue/query/getDoorLockPassword/GetDoorLockPasswordQueryHandler';

import { Cache } from '@khlug/app/domain/cache/model/Cache';

const controllers = [];
const manageControllers = [InfraBlueManageController];

const commandHandlers = [UpdateDoorLockPasswordCommandHandler];
const queryHandlers = [GetDoorLockPasswordQueryHandler];

@Module({
  imports: [MikroOrmModule.forFeature([Cache])],
  controllers: [...controllers, ...manageControllers],
  providers: [...commandHandlers, ...queryHandlers],
})
export class AppModule {}
