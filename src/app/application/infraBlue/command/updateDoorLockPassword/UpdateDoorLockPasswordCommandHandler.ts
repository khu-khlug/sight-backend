import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateDoorLockPasswordCommand } from '@khlug/app/application/infraBlue/command/updateDoorLockPassword/UpdateDoorLockPasswordCommand';

import { Cache, CacheId } from '@khlug/app/domain/cache/model/Cache';

import { Message } from '@khlug/constant/message';

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
          CacheId.masterPassword,
          CacheId.jajudyPassword,
          CacheId.facilityTeamPassword,
        ],
      },
    });

    const masterPassword = passwords.find(
      (password) => password.id === CacheId.masterPassword,
    );
    const jajudyPassword = passwords.find(
      (password) => password.id === CacheId.jajudyPassword,
    );
    const facilityTeamPassword = passwords.find(
      (password) => password.id === CacheId.facilityTeamPassword,
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
