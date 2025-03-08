import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import {
  DiscordApiAdapterToken,
  DiscordRole,
  IDiscordApiAdapter,
} from '@khlug/app/application/adapter/IDiscordApiAdapter';

import {
  DiscordIntegrationRepositoryToken,
  IDiscordIntegrationRepository,
} from '@khlug/app/domain/discord/IDiscordIntegrationRepository';
import {
  StudentStatus,
  UserStatus,
} from '@khlug/app/domain/user/model/constant';
import { User } from '@khlug/app/domain/user/model/User';

@Injectable()
export class DiscordMemberService {
  constructor(
    @Inject(DiscordApiAdapterToken)
    private readonly discordApiAdapter: IDiscordApiAdapter,
    @Inject(DiscordIntegrationRepositoryToken)
    private readonly discordIntegrationRepository: IDiscordIntegrationRepository,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async reflectUserInfoToDiscordUser(userId: number): Promise<void> {
    // TODO: UserRepository 별도 구현 후 수정해야 함
    //       현재는 엔티티에 직접 매핑되므로 `_id`를 사용하지 않기 위해 쿼리 빌더를 사용함
    const user = await this.userRepository
      .createQueryBuilder('u')
      .where('u.id = ?', [userId])
      .getSingleResult();
    if (!user) {
      return;
    }

    const discordIntegration =
      await this.discordIntegrationRepository.findByUserId(userId);
    if (!discordIntegration) {
      return;
    }

    const discordUserId = discordIntegration.discordUserId;
    const hasMember = await this.discordApiAdapter.hasMember(discordUserId);
    if (!hasMember) {
      return;
    }

    await this.discordApiAdapter.modifyMember({
      discordUserId,
      nickname: user.profile.name,
      roles: this.calcRoles(user),
    });
  }

  private calcRoles(user: User): DiscordRole[] {
    const roles: DiscordRole[] = [];

    if (
      user.status === UserStatus.ACTIVE &&
      user.studentStatus !== StudentStatus.GRADUATE
    ) {
      roles.push(DiscordRole.MEMBER);
    }

    if (
      user.status === UserStatus.ACTIVE &&
      user.studentStatus === StudentStatus.GRADUATE
    ) {
      roles.push(DiscordRole.GRADUATED_MEMBER);
    }

    if (user.manager) {
      roles.push(DiscordRole.MANAGER);
    }

    return roles;
  }
}
