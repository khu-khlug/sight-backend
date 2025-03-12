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

  async clearDiscordIntegration(userId: number): Promise<void> {
    const discordIntegration =
      await this.discordIntegrationRepository.findByUserId(userId);

    if (!discordIntegration) {
      return;
    }

    const discordUserId = discordIntegration.discordUserId;
    const hasMember = await this.discordApiAdapter.hasMember(discordUserId);
    if (hasMember) {
      await this.discordApiAdapter.modifyMember({
        discordUserId,
        roles: [],
      });
    }

    await this.discordIntegrationRepository.remove(discordIntegration);
  }

  async reflectUserInfoToDiscordUser(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ id: userId });
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
