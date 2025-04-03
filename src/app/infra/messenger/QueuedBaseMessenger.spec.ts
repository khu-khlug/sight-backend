import { advanceTo, clear } from 'jest-date-mock';

const queue: any = {};
jest.mock('p-queue', () => {
  return jest.fn().mockImplementation(() => queue);
});

import { ConsoleLogger } from '@nestjs/common';

import { QueuedBaseMessenger } from '@khlug/app/infra/messenger/QueuedBaseMessenger';

class NoopNotifier extends QueuedBaseMessenger {
  protected async sendImpl(): Promise<void> {}
  protected async sendToChannelImpl(): Promise<void> {}
}

class ThrowErrorNotifier extends QueuedBaseMessenger {
  protected async sendImpl(): Promise<void> {
    throw new Error('Test error');
  }
  protected async sendToChannelImpl(): Promise<void> {
    throw new Error('Test error');
  }
}

describe('QueuedBaseMessenger', () => {
  beforeEach(() => {
    advanceTo(new Date());

    queue.add = jest.fn((fn: () => Promise<void>) => fn()) as any;
  });

  afterEach(() => clear());

  describe('send', () => {
    test('큐에 알람 전송 작업을 추가해야 한다', () => {
      const logger: jest.Mocked<ConsoleLogger> = {} as any;
      const notifier = new NoopNotifier(logger);

      notifier.send({
        targetUserId: 2,
        message: 'hello',
      });

      expect(queue.add).toHaveBeenCalledTimes(1);
    });

    test('전송 작업 처리 중 에러가 발생해도 정상적으로 종료되어야 한다', async () => {
      const logger: jest.Mocked<ConsoleLogger> = { error: jest.fn() } as any;
      const notifier = new ThrowErrorNotifier(logger);

      expect(() =>
        notifier.send({
          targetUserId: 2,
          message: 'hello',
        }),
      ).not.toThrow();
    });
  });

  describe('sendToChannel', () => {
    test('큐에 알람 전송 작업을 추가해야 한다', () => {
      const logger: jest.Mocked<ConsoleLogger> = {} as any;
      const notifier = new NoopNotifier(logger);

      notifier.sendToChannel({
        channelId: '123',
        message: 'hello',
      });

      expect(queue.add).toHaveBeenCalledTimes(1);
    });

    test('전송 작업 처리 중 에러가 발생해도 정상적으로 종료되어야 한다', async () => {
      const logger: jest.Mocked<ConsoleLogger> = { error: jest.fn() } as any;
      const notifier = new ThrowErrorNotifier(logger);

      expect(() =>
        notifier.sendToChannel({
          channelId: '123',
          message: 'hello',
        }),
      ).not.toThrow();
    });
  });
});
