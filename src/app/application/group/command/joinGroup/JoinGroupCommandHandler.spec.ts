import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { JoinGroupCommand } from '@sight/app/application/group/command/joinGroup/JoinGroupCommand';
import { JoinGroupCommandHandler } from '@sight/app/application/group/command/joinGroup/JoinGroupCommandHandler';

import { GroupDomainService } from '@sight/app/domain/group/service/GroupDomainService';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';
import {
  IUserRepository,
  UserRepository,
} from '@sight/app/domain/user/IUserRepository';

import { DomainFixture } from '@sight/__test__/fixtures';
import { generateEmptyProviders } from '@sight/__test__/util';
import { Message } from '@sight/constant/message';

describe('JoinGroupCommandHandler', () => {
  let handler: JoinGroupCommandHandler;
  let groupRepository: jest.Mocked<IGroupRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let groupDomainService: jest.Mocked<GroupDomainService>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        JoinGroupCommandHandler,
        ...generateEmptyProviders(
          GroupRepository,
          UserRepository,
          GroupDomainService,
        ),
      ],
    }).compile();

    handler = testModule.get(JoinGroupCommandHandler);
    groupRepository = testModule.get(GroupRepository);
    userRepository = testModule.get(UserRepository);
    groupDomainService = testModule.get(GroupDomainService);
  });

  afterAll(() => {
    clear();
  });

  describe('execute', () => {
    const groupId = 'groupId';
    const userId = 'userId';

    beforeEach(() => {
      groupRepository.findById = jest.fn();
      userRepository.findById = jest.fn();
      groupDomainService.joinGroup = jest.fn();
    });

    test('그룹이 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      groupRepository.findById = jest.fn().mockResolvedValueOnce(null);

      await expect(
        handler.execute(new JoinGroupCommand(groupId, userId)),
      ).rejects.toThrowError(Message.GROUP_NOT_FOUND);
    });

    test('유저가 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      groupRepository.findById = jest
        .fn()
        .mockResolvedValueOnce(DomainFixture.generateGroup());
      userRepository.findById = jest.fn().mockResolvedValueOnce(null);

      await expect(
        handler.execute(new JoinGroupCommand(groupId, userId)),
      ).rejects.toThrowError(Message.USER_NOT_FOUND);
    });

    test('그룹에 참여해야 한다', async () => {
      const group = DomainFixture.generateGroup();
      const user = DomainFixture.generateUser();

      groupRepository.findById = jest.fn().mockResolvedValueOnce(group);
      userRepository.findById = jest.fn().mockResolvedValueOnce(user);

      await handler.execute(new JoinGroupCommand(groupId, userId));

      expect(groupDomainService.joinGroup).toBeCalledWith(group, user);
    });
  });
});
