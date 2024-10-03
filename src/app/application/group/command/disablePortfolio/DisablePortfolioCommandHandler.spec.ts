import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { DisablePortfolioCommand } from '@khlug/app/application/group/command/disablePortfolio/DisablePortfolioCommand';
import { DisablePortfolioCommandHandler } from '@khlug/app/application/group/command/disablePortfolio/DisablePortfolioCommandHandler';

import {
  ISlackSender,
  SlackSender,
} from '@khlug/app/domain/adapter/ISlackSender';
import {
  GroupLogger,
  IGroupLogger,
} from '@khlug/app/domain/group/IGroupLogger';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@khlug/app/domain/group/IGroupMemberRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@khlug/app/domain/group/IGroupRepository';
import { PointGrantService } from '@khlug/app/domain/user/service/PointGrantService';

import { DomainFixture } from '@khlug/__test__/fixtures';
import { GroupFixture } from '@khlug/__test__/fixtures/GroupFixture';
import { Message } from '@khlug/constant/message';
import { Point } from '@khlug/constant/point';

describe('DisablePortfolioCommandHandler', () => {
  let handler: DisablePortfolioCommandHandler;
  let groupRepository: jest.Mocked<IGroupRepository>;
  let groupMemberRepository: jest.Mocked<IGroupMemberRepository>;
  let groupLogger: jest.Mocked<IGroupLogger>;
  let pointGrantService: jest.Mocked<PointGrantService>;
  let slackSender: jest.Mocked<ISlackSender>;

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        DisablePortfolioCommandHandler,
        {
          provide: GroupRepository,
          useValue: { findById: jest.fn(), save: jest.fn() },
        },
        {
          provide: GroupMemberRepository,
          useValue: { findByGroupId: jest.fn() },
        },
        {
          provide: GroupLogger,
          useValue: { log: jest.fn() },
        },
        {
          provide: PointGrantService,
          useValue: { grant: jest.fn() },
        },
        {
          provide: SlackSender,
          useValue: { send: jest.fn() },
        },
      ],
    }).compile();

    handler = testModule.get(DisablePortfolioCommandHandler);
    groupRepository = testModule.get(GroupRepository);
    groupMemberRepository = testModule.get(GroupMemberRepository);
    groupLogger = testModule.get(GroupLogger);
    pointGrantService = testModule.get(PointGrantService);
    slackSender = testModule.get(SlackSender);
  });

  afterEach(() => clear());

  describe('execute', () => {
    test('그룹이 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      groupRepository.findById.mockResolvedValue(null);

      const command = new DisablePortfolioCommand('groupId', 'requesterUserId');
      await expect(handler.execute(command)).rejects.toThrow(
        Message.GROUP_NOT_FOUND,
      );
    });

    test('요청자가 그룹장이 아니라면 예외를 발생시켜야 한다', async () => {
      const group = GroupFixture.inProgressJoinable({ hasPortfolio: true });
      const notAdminUserId = 'not-admin-user-id';

      groupRepository.findById.mockResolvedValue(group);

      const command = new DisablePortfolioCommand('groupId', notAdminUserId);
      await expect(handler.execute(command)).rejects.toThrow();
    });

    test('대상 그룹이 고객센터 그룹이라면 예외를 발생시켜야 한다', async () => {
      const group = GroupFixture.customerService({ hasPortfolio: true });

      const command = new DisablePortfolioCommand('groupId', group.adminUserId);
      await expect(handler.execute(command)).rejects.toThrow();
    });

    test('포트폴리오 발행을 중단시켜야 한다', async () => {
      const group = GroupFixture.inProgressJoinable({ hasPortfolio: true });
      const adminUserId = group.adminUserId;

      groupRepository.findById.mockResolvedValue(group);
      groupMemberRepository.findByGroupId.mockResolvedValue([]);
      jest.spyOn(group, 'disablePortfolio');

      const command = new DisablePortfolioCommand('groupId', adminUserId);
      await handler.execute(command);

      expect(group.disablePortfolio).toBeCalled();
    });

    test('포트폴리오 발행 중단 그룹 로그를 생성해야 한다', async () => {
      const group = GroupFixture.inProgressJoinable({ hasPortfolio: true });
      const adminUserId = group.adminUserId;

      groupRepository.findById.mockResolvedValue(group);
      groupMemberRepository.findByGroupId.mockResolvedValue([]);

      const command = new DisablePortfolioCommand('groupId', adminUserId);
      await handler.execute(command);

      expect(groupLogger.log).toBeCalled();
    });

    test('모든 그룹원으로부터 포인트를 회수해야 한다', async () => {
      const group = GroupFixture.inProgressJoinable({ hasPortfolio: true });
      const adminUserId = group.adminUserId;
      const groupMemberUserIds = ['user1', 'user2'];

      groupRepository.findById.mockResolvedValue(group);
      groupMemberRepository.findByGroupId.mockResolvedValue([
        DomainFixture.generateGroupMember({ userId: groupMemberUserIds[0] }),
        DomainFixture.generateGroupMember({ userId: groupMemberUserIds[1] }),
      ]);

      const command = new DisablePortfolioCommand('groupId', adminUserId);
      await handler.execute(command);

      expect(pointGrantService.grant).toHaveBeenCalledWith({
        targetUserIds: groupMemberUserIds,
        amount: -Point.GROUP_ENABLED_PORTFOLIO,
        reason: expect.any(String),
      });
    });

    test('그룹장에게 메시지를 보내야 한다', async () => {
      const group = GroupFixture.inProgressJoinable({ hasPortfolio: true });
      const adminUserId = group.adminUserId;

      groupRepository.findById.mockResolvedValue(group);
      groupMemberRepository.findByGroupId.mockResolvedValue([]);

      const command = new DisablePortfolioCommand('groupId', adminUserId);
      await handler.execute(command);

      expect(slackSender.send).toHaveBeenCalledWith(
        expect.objectContaining({ targetUserId: adminUserId }),
      );
    });
  });
});
