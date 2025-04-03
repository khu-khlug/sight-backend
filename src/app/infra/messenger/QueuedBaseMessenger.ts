import { LoggerService } from '@nestjs/common';
import PQueue from 'p-queue';

import {
  IMessenger,
  MessengerSendParams,
  MessengerSendToChannelParams,
} from '@khlug/app/domain/adapter/IMessenger';

const THROTTLE_COUNT = 20;

export abstract class QueuedBaseMessenger implements IMessenger {
  // TODO: Graceful shutdown 시 큐에 남아있는 알람을 처리할 수 있도록 구현해야 함
  //       이후 디스코드 - 유저 간 관계는 별도 모듈로 분리 후 추상화된 서비스로 접근할 수 있도록 수정할 예정
  private queue: PQueue;

  constructor(protected logger: LoggerService) {
    this.queue = new PQueue({
      interval: 1000,
      intervalCap: THROTTLE_COUNT,
      concurrency: THROTTLE_COUNT,
    });
  }

  send(params: MessengerSendParams): void {
    this.queue.add(() => {
      this.wrapPromise(this.sendImpl(params));
    });
  }

  sendToChannel(params: MessengerSendToChannelParams): void {
    this.queue.add(() => {
      this.wrapPromise(this.sendToChannelImpl(params));
    });
  }

  // 알람 전송을 완전히 비동기 상황인 큐 내에서 처리하기 때문에 에러 발생 시 서버가 완전히 죽습니다.
  // 이를 방지하기 위해 `catch`를 사용하여 핸들링할 수 있또록 하고, 에러 발생 시 로그를 남기게 합니다.
  private wrapPromise(sendFnPromise: Promise<void>) {
    sendFnPromise.catch((err) => {
      if (err instanceof Error) {
        this.logger.error(
          `Error occurred while send notification: ${err.message}`,
          err.stack,
        );
      } else {
        this.logger.error(
          `Unknown error occurred while send notification: ${err}`,
        );
      }
    });
  }

  protected abstract sendImpl(params: MessengerSendParams): Promise<void>;
  protected abstract sendToChannelImpl(
    params: MessengerSendToChannelParams,
  ): Promise<void>;
}
