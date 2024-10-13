import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateDoorLockPasswordCommand } from '@khlug/app/application/infraBlue/command/updateDoorLockPassword/UpdateDoorLockPasswordCommand';

import { Cache } from '@khlug/app/domain/cache/model/Cache';

import { Message } from '@khlug/constant/message';

export const MASTER_PASSWORD_CACHE_ID = '100';
export const JAJUDY_PASSWORD_CACHE_ID = '101';
export const FACILITY_TEAM_PASSWORD_CACHE_ID = '102';

@CommandHandler(UpdateDoorLockPasswordCommand)
export class UpdateDoorLockPasswordCommandHandler
  implements ICommandHandler<UpdateDoorLockPasswordCommand, void>
{
  constructor(
    @InjectRepository(Cache)
    private readonly cacheRepository: EntityRepository<Cache>,
  ) {}

  async execute(command: UpdateDoorLockPasswordCommand): Promise<void> {
    const { master, forJajudy, forFacilityTeam } = command;

    const passwords = await this.cacheRepository.find({
      id: {
        $in: [
          MASTER_PASSWORD_CACHE_ID,
          JAJUDY_PASSWORD_CACHE_ID,
          FACILITY_TEAM_PASSWORD_CACHE_ID,
        ],
      },
    });

    const masterPassword = passwords.find(
      (password) => password.id === MASTER_PASSWORD_CACHE_ID,
    );
    const jajudyPassword = passwords.find(
      (password) => password.id === JAJUDY_PASSWORD_CACHE_ID,
    );
    const facilityTeamPassword = passwords.find(
      (password) => password.id === FACILITY_TEAM_PASSWORD_CACHE_ID,
    );

    if (!masterPassword || !jajudyPassword || !facilityTeamPassword) {
      throw new NotFoundException(Message.SOME_DOOR_LOCK_PASSWORD_NOT_FOUND);
    }

    masterPassword.updateContent(master);
    jajudyPassword.updateContent(forJajudy);
    facilityTeamPassword.updateContent(forFacilityTeam);

    await this.cacheRepository
      .getEntityManager()
      .persistAndFlush([masterPassword, jajudyPassword, facilityTeamPassword]);
  }
}
