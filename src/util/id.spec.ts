import { InternalServerErrorException } from '@nestjs/common';
import { advanceTo, clear } from 'jest-date-mock';

import { createId } from '@khlug/util/id';

describe('id', () => {
  afterEach(() => {
    clear();
  });

  describe('createId', () => {
    test('현재 시간이 기준 시점보다 과거라면 예외를 발생시켜야 한다', () => {
      advanceTo(new Date('2024-01-01T00:00:00.000Z'));

      expect(() => createId()).toThrow(InternalServerErrorException);
    });

    test('현재 시점과 랜덤한 값을 합쳐 아이디를 생성해야 한다', () => {
      // 기준일보다 0.1s 뒤이므로 현재 시간 부분은 `1`
      advanceTo(new Date('2025-01-01T00:00:00.100Z'));

      // 랜덤 값은 0.1234이므로 랜덤 부분은 `1234`
      jest.spyOn(Math, 'random').mockReturnValue(0.1234);

      const id = createId();
      const expected = 11234;

      expect(id).toEqual(expected);
    });

    test('숫자 아이디를 생성해야 한다', () => {
      advanceTo(new Date('2025-01-01T00:00:00.000Z'));

      const id = createId();

      expect(typeof id).toEqual('number');
    });
  });
});
