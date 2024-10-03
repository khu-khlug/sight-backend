import { advanceTo, clear } from 'jest-date-mock';

import { MessageBuilder } from '@khlug/core/message/MessageBuilder';

describe('MessageBuilder', () => {
  beforeEach(() => advanceTo(new Date()));
  afterEach(() => clear());

  test('파라미터가 없는 메시지는 그대로 반환해야 한다', () => {
    const GIVEN_MESSAGE = 'Hello, World!';
    const expected = GIVEN_MESSAGE;

    const actual = MessageBuilder.build(GIVEN_MESSAGE, {});

    expect(actual).toEqual(expected);
  });

  test('파라미터 1개 있는 메시지는 파라미터를 포함하여 반환해야 한다', () => {
    const GIVEN_MESSAGE = 'Hello, :username:!';
    const expected = 'Hello, Lery!';

    const actual = MessageBuilder.build(GIVEN_MESSAGE, { username: 'Lery' });

    expect(actual).toEqual(expected);
  });

  test('파라미터 5개 있는 메시지는 파라미터를 포함하여 반환해야 한다', () => {
    const GIVEN_MESSAGE = ':some1: :some2: :some3: :some4: :some5:';
    const expected = `1 2 3 4 5`;

    const actual = MessageBuilder.build(GIVEN_MESSAGE, {
      some1: '1',
      some2: '2',
      some3: '3',
      some4: '4',
      some5: '5',
    });

    expect(actual).toEqual(expected);
  });

  test('동일한 파라미터가 있는 메시지는 동일한 값을 사용해야 한다', () => {
    const GIVEN_MESSAGE = ':some1: :some2: :some1: :some3: :some4:';
    const expected = `1 2 1 3 4`;

    const actual = MessageBuilder.build(GIVEN_MESSAGE, {
      some1: '1',
      some2: '2',
      some3: '3',
      some4: '4',
    });

    expect(actual).toEqual(expected);
  });
});
