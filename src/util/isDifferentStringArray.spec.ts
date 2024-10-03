import { isDifferentStringArray } from '@khlug/util/isDifferentStringArray';

describe('isDifferentStringArray', () => {
  test('같은 항목, 같은 순서를 갖는 두 배열에 대해 false를 반환해야 한다', () => {
    const a = ['a', 'b', 'c'];
    const b = ['a', 'b', 'c'];

    expect(isDifferentStringArray(a, b)).toEqual(false);
  });

  test('같은 항목, 다른 순서를 갖는 두 배열에 대해 false를 반환해야 한다', () => {
    const a = ['a', 'b', 'c'];
    const b = ['a', 'c', 'b'];

    expect(isDifferentStringArray(a, b)).toEqual(false);
  });

  test('중복 항목, 같은 순서를 갖는 두 배열에 대해 false를 반환해야 한다', () => {
    const a = ['a', 'b', 'a', 'c'];
    const b = ['a', 'b', 'a', 'c'];

    expect(isDifferentStringArray(a, b)).toEqual(false);
  });

  test('중복 항목, 다른 순서를 갖는 두 배열에 대해 false를 반환해야 한다', () => {
    const a = ['a', 'b', 'a', 'c'];
    const b = ['c', 'a', 'a', 'b'];

    expect(isDifferentStringArray(a, b)).toEqual(false);
  });

  test('서로 다른 길이의 두 배열에 대해 true를 반환해야 한다', () => {
    const a = ['a', 'b', 'c'];
    const b = ['a', 'b', 'c', 'd'];

    expect(isDifferentStringArray(a, b)).toEqual(true);
  });

  test('다른 항목의 두 배열에 대해 true를 반환해야 한다', () => {
    const a = ['a', 'b', 'c', 'e'];
    const b = ['a', 'b', 'c', 'd'];

    expect(isDifferentStringArray(a, b)).toEqual(true);
  });
});
