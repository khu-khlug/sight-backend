import { EntityRepository } from '@mikro-orm/mysql';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import {
  DiscordApiAdapterToken,
  DiscordRole,
  IDiscordApiAdapter,
} from '@khlug/app/application/adapter/IDiscordApiAdapter';
import { DiscordMemberService } from '@khlug/app/application/user/service/DiscordMemberService';

import {
  DiscordIntegrationRepositoryToken,
  IDiscordIntegrationRepository,
} from '@khlug/app/domain/discord/IDiscordIntegrationRepository';
import { User } from '@khlug/app/domain/user/model/User';

import { DiscordIntegrationFixture } from '@khlug/__test__/fixtures/DiscordIntegrationFixture';
import { UserFixture } from '@khlug/__test__/fixtures/domain';

describe('DiscordMemberService', () => {
  let discordMemberService: DiscordMemberService;
  let discordApiAdapter: jest.Mocked<IDiscordApiAdapter>;
  let discordIntegrationRepository: jest.Mocked<IDiscordIntegrationRepository>;
  let userRepository: jest.Mocked<EntityRepository<User>>;

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        DiscordMemberService,
        {
          provide: DiscordApiAdapterToken,
          useValue: {
            hasMember: jest.fn(),
            modifyMember: jest.fn(),
          },
        },
        {
          provide: DiscordIntegrationRepositoryToken,
          useValue: {
            findByUserId: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    discordMemberService = testModule.get(DiscordMemberService);
    discordApiAdapter = testModule.get(DiscordApiAdapterToken);
    discordIntegrationRepository = testModule.get(
      DiscordIntegrationRepositoryToken,
    );
    userRepository = testModule.get(getRepositoryToken(User));
  });

  afterEach(() => clear());

  describe('reflectUserInfoToDiscordUser', () => {
    test('유저가 존재하지 않으면 디스코드 멤버 정보를 수정하지 않아야 한다', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await discordMemberService.reflectUserInfoToDiscordUser(1);

      expect(discordApiAdapter.modifyMember).not.toHaveBeenCalled();
    });

    test('디스코드 연동 정보가 존재하지 않으면 디스코드 멤버 정보를 수정하지 않아야 한다', async () => {
      userRepository.findOne.mockResolvedValue(UserFixture.undergraduated());
      discordIntegrationRepository.findByUserId = jest
        .fn()
        .mockResolvedValueOnce(undefined);

      await discordMemberService.reflectUserInfoToDiscordUser(1);

      expect(discordApiAdapter.modifyMember).not.toHaveBeenCalled();
    });

    test('유저가 쿠러그 디스코드 채널에 들어와있지 않으면 디스코드 멤버 정보를 수정하지 않아야 한다', async () => {
      userRepository.findOne.mockResolvedValue(UserFixture.undergraduated());
      discordIntegrationRepository.findByUserId = jest
        .fn()
        .mockResolvedValueOnce(DiscordIntegrationFixture.normal());
      discordApiAdapter.hasMember = jest.fn().mockResolvedValueOnce(false);

      await discordMemberService.reflectUserInfoToDiscordUser(1);

      expect(discordApiAdapter.modifyMember).not.toHaveBeenCalled();
    });

    test('디스코드 멤버의 이름으로 유저의 이름을 사용해야 한다', async () => {
      const user = UserFixture.undergraduated();

      userRepository.findOne.mockResolvedValue(user);
      discordIntegrationRepository.findByUserId = jest
        .fn()
        .mockResolvedValueOnce(DiscordIntegrationFixture.normal());
      discordApiAdapter.hasMember = jest.fn().mockResolvedValueOnce(true);

      await discordMemberService.reflectUserInfoToDiscordUser(1);

      expect(discordApiAdapter.modifyMember).toHaveBeenCalledWith(
        expect.objectContaining({
          nickname: user.profile.name,
        }),
      );
    });

    test('유저가 활성 상태가 아니라면 디스코드 역할이 비어야 한다', async () => {
      userRepository.findOne.mockResolvedValue(UserFixture.unauthorized());
      discordIntegrationRepository.findByUserId = jest
        .fn()
        .mockResolvedValueOnce(DiscordIntegrationFixture.normal());
      discordApiAdapter.hasMember = jest.fn().mockResolvedValueOnce(true);

      await discordMemberService.reflectUserInfoToDiscordUser(1);

      expect(discordApiAdapter.modifyMember).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: [],
        }),
      );
    });

    test('유저가 활성 상태이며 졸업 상태가 아니라면 "회원" 디스코드 역할을 가져야 한다', async () => {
      userRepository.findOne.mockResolvedValue(UserFixture.undergraduated());
      discordIntegrationRepository.findByUserId = jest
        .fn()
        .mockResolvedValueOnce(DiscordIntegrationFixture.normal());
      discordApiAdapter.hasMember = jest.fn().mockResolvedValueOnce(true);

      await discordMemberService.reflectUserInfoToDiscordUser(1);

      expect(discordApiAdapter.modifyMember).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: expect.arrayContaining([DiscordRole.MEMBER]),
        }),
      );
    });

    test('유저가 활성 상태이며 졸업했다면 "명예 회원" 디스코드 역할을 가져야 한다', async () => {
      userRepository.findOne.mockResolvedValue(UserFixture.graduated());
      discordIntegrationRepository.findByUserId = jest
        .fn()
        .mockResolvedValueOnce(DiscordIntegrationFixture.normal());
      discordApiAdapter.hasMember = jest.fn().mockResolvedValueOnce(true);

      await discordMemberService.reflectUserInfoToDiscordUser(1);

      expect(discordApiAdapter.modifyMember).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: expect.arrayContaining([DiscordRole.GRADUATED_MEMBER]),
        }),
      );
    });

    test('유저가 운영진이라면 "운영진" 디스코드 역할을 가져야 한다', async () => {
      userRepository.findOne.mockResolvedValueOnce(UserFixture.manager());
      discordIntegrationRepository.findByUserId = jest
        .fn()
        .mockResolvedValueOnce(DiscordIntegrationFixture.normal());
      discordApiAdapter.hasMember = jest.fn().mockResolvedValueOnce(true);

      await discordMemberService.reflectUserInfoToDiscordUser(1);

      expect(discordApiAdapter.modifyMember).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: expect.arrayContaining([DiscordRole.MANAGER]),
        }),
      );
    });
  });
});
