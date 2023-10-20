import {
  Connection,
  Entity,
  EntityManager,
  MikroORM,
  PrimaryKey,
} from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AopModule } from '@toss/nestjs-aop';
import { advanceTo, clear } from 'jest-date-mock';
import { ClsModule, ClsService } from 'nestjs-cls';

import { TRANSACTIONAL_ENTITY_MANAGER } from '@sight/core/persistence/transaction/constant';
import { Transactional } from '@sight/core/persistence/transaction/Transactional';
import { TransactionalDecorator } from '@sight/core/persistence/transaction/TransactionalDecorator';

@Entity({ tableName: 'Mock' })
class MockEntity {
  @PrimaryKey({ type: 'varchar', length: 100 })
  id!: string;
}

@Injectable()
class MockClass {
  @Transactional()
  async someFn(fn: () => Promise<void>) {
    await fn();
  }
}

describe('Transactional', () => {
  let mockClass: MockClass;
  let cls: ClsService;
  let entityManager: EntityManager;
  let testModule: TestingModule;

  beforeAll(async () => {
    advanceTo(new Date());

    const dbFilePath = './src/__test__/test.sqlite3';

    testModule = await Test.createTestingModule({
      imports: [
        ClsModule,
        AopModule,
        MikroOrmModule.forRoot({
          type: 'sqlite',
          dbName: dbFilePath,
          entities: [MockEntity],
        }),
      ],
      providers: [TransactionalDecorator, MockClass],
    }).compile();

    mockClass = testModule.get(MockClass);
    cls = testModule.get(ClsService);
    entityManager = testModule.get(EntityManager).fork();

    const mikroORM = testModule.get(MikroORM);
    await mikroORM.getSchemaGenerator().refreshDatabase();

    await testModule.init();
  });

  afterAll(async () => {
    clear();

    // MikroORM 커넥션을 닫기 위해 사용합니다.
    await testModule.close();
  });

  test('처리 중에 에러가 발생하면 롤백되어야 한다', async () => {
    let connection: Connection;

    await cls.runWith(
      {
        [TRANSACTIONAL_ENTITY_MANAGER]: entityManager,
      },
      async () => {
        try {
          await mockClass.someFn(async () => {
            const managerInTransaction: EntityManager = cls.get(
              TRANSACTIONAL_ENTITY_MANAGER,
            );
            connection = managerInTransaction.getConnection();

            jest.spyOn(connection, 'rollback');

            throw new Error();
          });
        } catch (e) {}
      },
    );

    expect(connection!.rollback).toBeCalledTimes(1);
  });

  test.todo('lock에 걸릴 경우 롤백되어야 한다');
});
