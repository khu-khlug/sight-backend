import { IsString } from 'class-validator';
import { advanceTo, clear } from 'jest-date-mock';

import { ClassValidator } from '@khlug/util/validator/ClassValidator';

class MockClass {
  @IsString()
  value!: any;
}

describe('ClassValidator', () => {
  beforeEach(async () => {
    advanceTo(new Date());
  });

  afterEach(() => clear());

  describe('validate', () => {
    test('유효성 에러가 존재하면 예외를 발생시켜야 한다', async () => {
      const mock = new MockClass();
      mock.value = 1;

      expect(() => ClassValidator.validate(mock)).toThrow();
    });

    test('유효성 에러가 존재하지 않으면 예외 없이 종료해야 한다', async () => {
      const mock = new MockClass();
      mock.value = 'string';

      expect(() => ClassValidator.validate(mock)).not.toThrow();
    });
  });
});
