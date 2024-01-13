import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { EnablePortfolioCommand } from '@sight/app/application/group/command/enablePortfolio/EnablePortfolioCommand';
import { EnablePortfolioCommandHandler } from '@sight/app/application/group/command/enablePortfolio/EnablePortfolioCommandHandler';

import { Group } from '@sight/app/domain/group/model/Group';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';

import { DomainFixture } from '@sight/__test__/fixtures';
import { Message } from '@sight/constant/message';

describe('EnablePortfolioCommandHandler', () => {
  let handler: EnablePortfolioCommandHandler;
  let groupRepository: jest.Mocked<IGroupRepository>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        EnablePortfolioCommandHandler,
        { provide: GroupRepository, useValue: {} },
      ],
    }).compile();

    handler = testModule.get(EnablePortfolioCommandHandler);
    groupRepository = testModule.get(GroupRepository);
  });

  afterAll(() => {
    clear();
  });

  describe('handle', () => {
    let group: Group;

    const groupId = 'groupId';
    const groupAdminUserId = 'groupAdminUserId';

    beforeEach(() => {
      group = DomainFixture.generateGroup({
        adminUserId: groupAdminUserId,
        hasPortfolio: false,
      });

      groupRepository.findById = jest.fn().mockResolvedValue(group);

      groupRepository.save = jest.fn();
    });

    test('그룹이 존재하지 않는다면 예외를 발생시켜야 한다', async () => {
      groupRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        handler.execute(new EnablePortfolioCommand(groupId, groupAdminUserId)),
      ).rejects.toThrowError(Message.GROUP_NOT_FOUND);
    });

    test('요청자가 그룹장이 아니라면 예외를 발생시켜야 한다', async () => {
      const otherUserId = 'otherUserId';

      await expect(
        handler.execute(new EnablePortfolioCommand(groupId, otherUserId)),
      ).rejects.toThrowError(Message.ONLY_GROUP_ADMIN_CAN_EDIT_GROUP);
    });

    test('그룹이 고객센터 그룹이라면 예외를 발생시켜야 한다', async () => {
      jest.spyOn(group, 'isCustomerServiceGroup').mockReturnValue(true);

      await expect(
        handler.execute(new EnablePortfolioCommand(groupId, groupAdminUserId)),
      ).rejects.toThrowError(Message.CANNOT_MODIFY_CUSTOMER_SERVICE_GROUP);
    });

    test('그룹의 포트폴리오를 활성화 시켜야 한다', async () => {
      jest.spyOn(group, 'enablePortfolio');

      await handler.execute(
        new EnablePortfolioCommand(groupId, groupAdminUserId),
      );

      expect(group.enablePortfolio).toBeCalled();
    });

    test('그룹을 저장해야 한다', async () => {
      await handler.execute(
        new EnablePortfolioCommand(groupId, groupAdminUserId),
      );

      expect(groupRepository.save).toBeCalledWith(group);
      expect(groupRepository.save).toBeCalledTimes(1);
    });
  });
});
