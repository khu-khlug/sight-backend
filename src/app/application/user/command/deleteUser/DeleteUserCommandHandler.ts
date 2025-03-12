import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeleteUserCommand } from '@khlug/app/application/user/command/deleteUser/DeleteUserCommand';

import { User } from '@khlug/app/domain/user/model/User';

import { Message } from '@khlug/constant/message';

@CommandHandler(DeleteUserCommand)
export class DeleteUserCommandHandler
  implements ICommandHandler<DeleteUserCommand>
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const { userId } = command;

    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException(Message.USER_NOT_FOUND);
    }

    user.leave();

    // TODO: UserRepository 구현하여 사용하도록 수정 필요
    await this.userRepository.getEntityManager().persistAndFlush(user);

    // TODO: 운영진에게 탈퇴 관련 메시지 전송 필요
  }
}
