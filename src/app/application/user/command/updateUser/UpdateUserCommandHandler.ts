import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Transactional } from '@khlug/core/persistence/transaction/Transactional';

import { UpdateUserCommand } from '@khlug/app/application/user/command/updateUser/UpdateUserCommand';
import { UpdateUserCommandResult } from '@khlug/app/application/user/command/updateUser/UpdateUserCommandResult';

import {
  IInterestRepository,
  InterestRepository,
} from '@khlug/app/domain/interest/IInterestRepository';
import {
  IUserInterestRepository,
  UserInterestRepository,
} from '@khlug/app/domain/interest/IUserInterestRepository';
import { UserInterest } from '@khlug/app/domain/interest/model/UserInterest';
import { UserInterestFactory } from '@khlug/app/domain/interest/UserInterestFactory';
import {
  IUserRepository,
  UserRepository,
} from '@khlug/app/domain/user/IUserRepository';

import { Message } from '@khlug/constant/message';

@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler
  implements ICommandHandler<UpdateUserCommand, UpdateUserCommandResult>
{
  constructor(
    @Inject(UserInterestFactory)
    private readonly userInterestFactory: UserInterestFactory,
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(InterestRepository)
    private readonly interestRepository: IInterestRepository,
    @Inject(UserInterestRepository)
    private readonly userInterestRepository: IUserInterestRepository,
  ) {}

  @Transactional()
  async execute(command: UpdateUserCommand): Promise<UpdateUserCommandResult> {
    const { userId, email, phone, homepage, language, interestIds, prefer } =
      command;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(Message.USER_NOT_FOUND);
    }

    user.setProfile({ email, phone, homepage, language, prefer });
    await this.updateInterests(userId, interestIds);

    await this.userRepository.save(user);

    return new UpdateUserCommandResult(user);
  }

  private async updateInterests(
    userId: string,
    interestIds: string[],
  ): Promise<void> {
    const interests = await this.interestRepository.findByIds(interestIds);
    if (interestIds.length !== interests.length) {
      throw new NotFoundException(Message.SOME_INTERESTS_NOT_FOUND);
    }

    await this.userInterestRepository.removeByUserId(userId);

    const newUserInterests: UserInterest[] = interestIds.map((interestId) => {
      const newUserInterest = this.userInterestFactory.create({
        id: this.userInterestRepository.nextId(),
        userId,
        interestId,
      });
      return newUserInterest;
    });

    await this.userInterestRepository.save(...newUserInterests);
  }
}
