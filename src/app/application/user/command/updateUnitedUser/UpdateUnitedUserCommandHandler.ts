import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Transactional } from '@khlug/core/persistence/transaction/Transactional';

import { UpdateUnitedUserCommand } from '@khlug/app/application/user/command/updateUnitedUser/UpdateUnitedUserCommand';
import { UpdateUnitedUserCommandResult } from '@khlug/app/application/user/command/updateUnitedUser/UpdateUnitedUserCommandResult';

import {
  IUserRepository,
  UserRepository,
} from '@khlug/app/domain/user/IUserRepository';

import { Message } from '@khlug/constant/error';

@CommandHandler(UpdateUnitedUserCommand)
export class UpdateUnitedUserCommandHandler
  implements
    ICommandHandler<UpdateUnitedUserCommand, UpdateUnitedUserCommandResult>
{
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  @Transactional()
  async execute(
    command: UpdateUnitedUserCommand,
  ): Promise<UpdateUnitedUserCommandResult> {
    const { userId, email } = command;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(Message.USER_NOT_FOUND);
    }

    user.setProfile({ email });
    await this.userRepository.save(user);

    return new UpdateUnitedUserCommandResult(user);
  }
}
