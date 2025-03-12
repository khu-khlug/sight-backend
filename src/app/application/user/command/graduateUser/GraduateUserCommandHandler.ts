import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { GraduateUserCommand } from '@khlug/app/application/user/command/graduateUser/GraduateUserCommand';
import { DiscordMemberService } from '@khlug/app/application/user/service/DiscordMemberService';

import { User } from '@khlug/app/domain/user/model/User';

import { Message } from '@khlug/constant/message';

@CommandHandler(GraduateUserCommand)
export class GraduateUserCommandHandler
  implements ICommandHandler<GraduateUserCommand>
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly discordMemberService: DiscordMemberService,
  ) {}

  async execute(command: GraduateUserCommand): Promise<void> {
    const { userId } = command;

    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException(Message.USER_NOT_FOUND);
    }

    user.graduate();

    // TODO: UserRepository 구현하여 사용하도록 수정 필요
    await this.userRepository.getEntityManager().persistAndFlush(user);

    // TODO: 운영진 및 졸업자에게 관련 메시지 전송 필요

    await this.discordMemberService.reflectUserInfoToDiscordUser(userId);
  }
}
