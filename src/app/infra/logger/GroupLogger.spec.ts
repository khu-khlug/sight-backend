import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';
import { ClsService } from 'nestjs-cls';

import { IRequester } from '@khlug/core/auth/IRequester';
import { UserRole } from '@khlug/core/auth/UserRole';

import { GroupLoggerImpl } from '@khlug/app/infra/logger/GroupLogger';

import { GroupLogFactory } from '@khlug/app/domain/group/GroupLogFactory';
import {
  GroupLogRepository,
  IGroupLogRepository,
} from '@khlug/app/domain/group/IGroupLogRepository';

import { generateEmptyProviders } from '@khlug/__test__/util';

describe('GroupLogger', () => {
  let groupLogger: GroupLoggerImpl;
  let groupLogFactory: GroupLogFactory;
  let groupLogRepository: jest.Mocked<IGroupLogRepository>;
  let clsService: jest.Mocked<ClsService>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        GroupLoggerImpl,
        GroupLogFactory,
        ...generateEmptyProviders(ClsService, GroupLogRepository),
      ],
    }).compile();

    groupLogger = testModule.get(GroupLoggerImpl);
    groupLogFactory = testModule.get(GroupLogFactory);
    groupLogRepository = testModule.get(GroupLogRepository);
    clsService = testModule.get(ClsService);
  });

  afterAll(() => {
    clear();
  });

  describe('log', () => {
    let requester: IRequester;

    const newLogId = 'newLogId';
    const groupId = 'groupId';
    const message = 'message';

    beforeEach(() => {
      requester = { userId: 100, role: UserRole.USER };

      clsService.get = jest.fn().mockReturnValue(requester);
      groupLogRepository.nextId = jest.fn().mockReturnValue(newLogId);

      jest.spyOn(groupLogFactory, 'create');
      groupLogRepository.save = jest.fn();
    });

    test('요청자 정보로 새로운 그룹 로그를 생성해야 한다', async () => {
      await groupLogger.log(groupId, message);

      expect(groupLogFactory.create).toBeCalledTimes(1);
    });

    test('의도대로 그룹 로그를 생성해서 저장해야 한다', async () => {
      const expected = groupLogFactory.create({
        id: newLogId,
        groupId,
        userId: requester.userId,
        message,
      });

      await groupLogger.log(groupId, message);

      expect(groupLogRepository.save).toBeCalledTimes(1);
      expect(groupLogRepository.save).toBeCalledWith(expected);
    });
  });
});
