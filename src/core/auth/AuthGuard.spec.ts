import { EntityManager } from '@mikro-orm/mysql';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';
import { ClsService } from 'nestjs-cls';

import {
  AUTH_DECORATOR_METADATA_KEY,
  AuthMetadata,
} from '@khlug/core/auth/Auth';
import { AuthGuard } from '@khlug/core/auth/AuthGuard';
import { AuthServiceAdapter } from '@khlug/core/auth/AuthServiceAdapter';
import { IRequester } from '@khlug/core/auth/IRequester';
import { UserRole } from '@khlug/core/auth/UserRole';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let laravelAuthnAdapter: jest.Mocked<AuthServiceAdapter>;
  let clsService: jest.Mocked<ClsService>;
  let entityManager: jest.Mocked<EntityManager>;

  beforeAll(() => advanceTo(new Date()));

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthServiceAdapter,
          useValue: {
            authenticate: jest.fn(),
          },
        },
        {
          provide: ClsService,
          useValue: {
            set: jest.fn(),
          },
        },
        {
          provide: EntityManager,
          useValue: {
            getConnection: (() => {
              const connectionMock = { execute: jest.fn() };
              return () => connectionMock;
            })(),
          },
        },
      ],
    }).compile();

    authGuard = testModule.get(AuthGuard);
    laravelAuthnAdapter = testModule.get(AuthServiceAdapter);
    clsService = testModule.get(ClsService);
    entityManager = testModule.get(EntityManager);
  });

  afterEach(() => clear());

  describe('canActivate', () => {
    const createExecutionContext = (cookies: Record<string, string>) => {
      const handler = function () {};
      const cookieString = Object.entries(cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join(';');
      const request = { headers: { cookie: cookieString } };

      return {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
        getHandler: () => handler,
      } as unknown as ExecutionContext;
    };

    test('@Auth() 데코레이터에 의한 메타데이터가 존재하지 않으면 `true`를 반환해야 한다', async () => {
      const context = createExecutionContext({});

      await expect(authGuard.canActivate(context)).resolves.toBe(true);
    });

    test('세션 정보가 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      const context = createExecutionContext({});
      const authMetadata: AuthMetadata = { roles: [] };

      Reflect.defineMetadata(
        AUTH_DECORATOR_METADATA_KEY,
        authMetadata,
        context.getHandler(),
      );

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    test('인증 처리 후 요청자의 유저 ID를 구할 수 없으면 예외를 발생시켜야 한다', async () => {
      const context = createExecutionContext({ khlug_session: 'session' });
      const authMetadata: AuthMetadata = { roles: [] };

      Reflect.defineMetadata(
        AUTH_DECORATOR_METADATA_KEY,
        authMetadata,
        context.getHandler(),
      );
      laravelAuthnAdapter.authenticate.mockResolvedValue(null);

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    test('요청자의 유저 ID로 조회한 유저가 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      const context = createExecutionContext({ khlug_session: 'session' });
      const authMetadata: AuthMetadata = { roles: [] };

      Reflect.defineMetadata(
        AUTH_DECORATOR_METADATA_KEY,
        authMetadata,
        context.getHandler(),
      );
      laravelAuthnAdapter.authenticate.mockResolvedValue(100);
      entityManager.getConnection().execute = jest.fn().mockResolvedValue([]);

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    test('요청자의 역할이 허용되지 않았다면 예외를 발생시켜야 한다', async () => {
      const context = createExecutionContext({ khlug_session: 'session' });
      const authMetadata: AuthMetadata = { roles: [UserRole.MANAGER] };

      Reflect.defineMetadata(
        AUTH_DECORATOR_METADATA_KEY,
        authMetadata,
        context.getHandler(),
      );
      laravelAuthnAdapter.authenticate.mockResolvedValue(100);
      entityManager.getConnection().execute = jest
        .fn()
        .mockResolvedValue([{ id: '1', manager: false }]);

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    test('요청 객체에 요청자 정보를 저장해야 한다', async () => {
      const context = createExecutionContext({ khlug_session: 'session' });
      const authMetadata: AuthMetadata = { roles: [UserRole.USER] };
      const userId = 100;

      Reflect.defineMetadata(
        AUTH_DECORATOR_METADATA_KEY,
        authMetadata,
        context.getHandler(),
      );
      laravelAuthnAdapter.authenticate.mockResolvedValue(userId);
      entityManager.getConnection().execute = jest
        .fn()
        .mockResolvedValue([{ id: userId, manager: false }]);

      await expect(authGuard.canActivate(context)).resolves.toBe(true);

      const expected: IRequester = {
        userId,
        role: UserRole.USER,
      };
      expect(context.switchToHttp().getRequest()['requester']).toEqual(
        expected,
      );
    });

    test('CLS에 요청자 정보를 저장해야 한다', async () => {
      const context = createExecutionContext({ khlug_session: 'session' });
      const authMetadata: AuthMetadata = { roles: [UserRole.USER] };
      const userId = 100;

      Reflect.defineMetadata(
        AUTH_DECORATOR_METADATA_KEY,
        authMetadata,
        context.getHandler(),
      );
      laravelAuthnAdapter.authenticate.mockResolvedValue(userId);
      entityManager.getConnection().execute = jest
        .fn()
        .mockResolvedValue([{ id: userId, manager: false }]);

      await expect(authGuard.canActivate(context)).resolves.toBe(true);

      const expected: IRequester = {
        userId,
        role: UserRole.USER,
      };
      expect(clsService.set).toHaveBeenCalledWith('requester', expected);
    });
  });
});
