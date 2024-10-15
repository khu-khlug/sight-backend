import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetDoorLockPasswordQuery } from '@khlug/app/application/infraBlue/query/getDoorLockPassword/GetDoorLockPasswordQuery';
import { GetDoorLockPasswordQueryResult } from '@khlug/app/application/infraBlue/query/getDoorLockPassword/GetDoorLockPasswordQueryResult';

import { Cache, CacheId } from '@khlug/app/domain/cache/model/Cache';

import { Message } from '@khlug/constant/message';

@QueryHandler(GetDoorLockPasswordQuery)
export class GetDoorLockPasswordQueryHandler
  implements
    IQueryHandler<GetDoorLockPasswordQuery, GetDoorLockPasswordQueryResult>
{
  constructor(
    @InjectRepository(Cache)
    private readonly cacheRepository: EntityRepository<Cache>,
  ) {}

  async execute(): Promise<GetDoorLockPasswordQueryResult> {
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

    return new GetDoorLockPasswordQueryResult({
      master: masterPassword.content,
      forJajudy: jajudyPassword.content,
      forFacilityTeam: facilityTeamPassword.content,
    });
  }
}
