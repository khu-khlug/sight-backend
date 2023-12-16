import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { ChangeGroupStateCommand } from '@sight/app/application/group/command/changeGroupState/ChangeGroupStateCommand';
import { ChangeGroupStateCommandHandler } from '@sight/app/application/group/command/changeGroupState/ChangeGroupStateCommandHandler';
import { ChangeGroupStateCommandResult } from '@sight/app/application/group/command/changeGroupState/ChangeGroupStateCommandResult';

import { GroupLogFactory } from '@sight/app/domain/group/GroupLogFactory';
import { GroupState } from '@sight/app/domain/group/model/constant';
import { Group } from '@sight/app/domain/group/model/Group';
import {
  GroupLogRepository,
  IGroupLogRepository,
} from '@sight/app/domain/group/IGroupLogRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';

import { DomainFixture } from '@sight/__test__/fixtures';
import { generateEmptyProviders } from '@sight/__test__/util';
import { Message } from '@sight/constant/message';

describe('ChangeGroupStateCommandHandler', () => {
  let handler: ChangeGroupStateCommandHandler;
  let groupRepository: jest.Mocked<IGroupRepository>;
  let groupLogFactory: jest.Mocked<GroupLogFactory>;
  let groupLogRepository: jest.Mocked<IGroupLogRepository>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        ChangeGroupStateCommandHandler,
        ...generateEmptyProviders(
          GroupRepository,
          GroupLogFactory,
          GroupLogRepository,
        ),
      ],
    }).compile();

    handler = testModule.get(ChangeGroupStateCommandHandler);
    groupRepository = testModule.get(GroupRepository);
    groupLogFactory = testModule.get(GroupLogFactory);
    groupLogRepository = testModule.get(GroupLogRepository);
  });

  afterAll(() => {
    clear();
  });

  describe('execute', () => {
    let group: Group;

    const requesterUserId = 'requester-user-id';
    const groupId = 'group-id';
    const nextState = GroupState.END_SUCCESS;

    beforeEach(() => {
      group = DomainFixture.generateGroup({
        adminUserId: requesterUserId,
      });
      const log = DomainFixture.generateGroupLog();

      group.isCustomerServiceGroup = jest.fn().mockReturnValue(false);
      group.isPracticeGroup = jest.fn().mockReturnValue(false);
      groupLogFactory.create = jest.fn().mockReturnValue(log);
      groupRepository.findById = jest.fn().mockResolvedValue(group);
      groupLogRepository.nextId = jest.fn().mockReturnValue('some-id');

      group.changeState = jest.fn();
      groupRepository.save = jest.fn();
      groupLogRepository.save = jest.fn();
    });

    test('그룹이 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      groupRepository.findById = jest.fn().mockResolvedValue(null);

      const command = new ChangeGroupStateCommand(
        { userId: requesterUserId, isManager: false },
        groupId,
        nextState,
      );
      await expect(handler.execute(command)).rejects.toThrowError(
        Message.GROUP_NOT_FOUND,
      );
    });

    test('고객센터 그룹의 상태를 수정하려 하면 예외를 발생시켜야 한다', async () => {
      group.isCustomerServiceGroup = jest.fn().mockReturnValue(true);

      const command = new ChangeGroupStateCommand(
        { userId: requesterUserId, isManager: false },
        groupId,
        nextState,
      );
      await expect(handler.execute(command)).rejects.toThrowError(
        Message.GROUP_NOT_EDITABLE,
      );
    });

    test('그룹 활용 실습 그룹의 상태를 수정하려 하면 예외를 발생시켜야 한다', async () => {
      group.isPracticeGroup = jest.fn().mockReturnValue(true);

      const command = new ChangeGroupStateCommand(
        { userId: requesterUserId, isManager: false },
        groupId,
        nextState,
      );
      await expect(handler.execute(command)).rejects.toThrowError(
        Message.GROUP_NOT_EDITABLE,
      );
    });

    test('그룹을 저장하고 변경된 상태를 반환해야 한다', async () => {
      const command = new ChangeGroupStateCommand(
        { userId: requesterUserId, isManager: false },
        groupId,
        nextState,
      );
      const expected = new ChangeGroupStateCommandResult(nextState);

      const result = await handler.execute(command);

      expect(groupRepository.save).toBeCalledTimes(1);
      expect(groupRepository.save).toBeCalledWith(group);

      expect(result).toEqual(expected);
    });

    describe('일반 유저가 요청했을 때', () => {
      const isManager = false;

      test('요청자가 그룹의 관리자가 아니라면 예외를 발생시켜야 한다', async () => {
        const otherUserId = 'other-user-id';

        const command = new ChangeGroupStateCommand(
          { userId: otherUserId, isManager },
          groupId,
          nextState,
        );
        await expect(handler.execute(command)).rejects.toThrowError(
          Message.ONLY_GROUP_ADMIN_CAN_EDIT_GROUP,
        );
      });

      test('그룹을 중단 처리하려 하면 예외를 발생시켜야 한다', async () => {
        const command = new ChangeGroupStateCommand(
          { userId: requesterUserId, isManager },
          groupId,
          GroupState.SUSPEND,
        );
        await expect(handler.execute(command)).rejects.toThrowError(
          Message.ONLY_MANAGER_CAN_SUSPEND_GROUP,
        );
      });
    });

    describe('관리자가 요청했을 때', () => {
      const isManager = true;

      test('요청자가 그룹의 관리자가 아니더라도 상태를 변경할 수 있어야 한다', async () => {
        const otherManagerUserId = 'other-manager-user-id';

        const command = new ChangeGroupStateCommand(
          { userId: otherManagerUserId, isManager },
          groupId,
          nextState,
        );
        await handler.execute(command);

        expect(group.changeState).toBeCalledTimes(1);
        expect(group.changeState).toBeCalledWith(nextState);
      });

      test('그룹을 중단시킬 수 있어야 한다', async () => {
        const command = new ChangeGroupStateCommand(
          { userId: requesterUserId, isManager },
          groupId,
          GroupState.SUSPEND,
        );
        await handler.execute(command);

        expect(group.changeState).toBeCalledTimes(1);
        expect(group.changeState).toBeCalledWith(GroupState.SUSPEND);
      });
    });
  });
});
