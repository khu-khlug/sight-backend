import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';

import { UpdateUserCommand } from '@sight/app/application/user/command/updateUser/UpdateUserCommand';
import { UpdateUserCommandResult } from '@sight/app/application/user/command/updateUser/UpdateUserCommandResult';

import { UserInterest } from '@sight/app/domain/interest/model/UserInterest';
import { UserInterestFactory } from '@sight/app/domain/interest/UserInterestFactory';
import {
  IInterestRepository,
  InterestRepository,
} from '@sight/app/domain/interest/IInterestRepository';
import {
  IUserInterestRepository,
  UserInterestRepository,
} from '@sight/app/domain/interest/IUserInterestRepository';
import {
  IUserRepository,
  UserRepository,
} from '@sight/app/domain/user/IUserRepository';

import { Message } from '@sight/constant/message';

@Injectable()
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

  // TODO @Transactional()
  async execute(command: UpdateUserCommand): Promise<UpdateUserCommandResult> {
    const { userId, email, phone, homepage, languages, interestIds, prefer } =
      command;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(Message.USER_NOT_FOUND);
    }

    user.setProfile({ email, phone, homepage, languages, prefer });
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
