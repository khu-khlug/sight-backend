import { UnivTerm } from '@khlug/util/univTerm';

describe('UnivTerm', () => {
  describe('next', () => {
    test('1학기라면 동일 년도 2학기가 되어야 한다', () => {
      const univTerm = new UnivTerm(2025, 1);

      expect(univTerm.next()).toEqual(new UnivTerm(2025, 2));
    });

    test('2학기라면 다음 년도 1학기가 되어야 한다', () => {
      const univTerm = new UnivTerm(2025, 2);

      expect(univTerm.next()).toEqual(new UnivTerm(2026, 1));
    });

    test('기존 객체는 변경되지 않아야 한다', () => {
      const univTerm = new UnivTerm(2025, 1);

      univTerm.next();

      expect(univTerm).toEqual(new UnivTerm(2025, 1));
    });
  });

  describe('isAfter', () => {
    test('동일 년도 동일 학기라면 `false`를 반환해야 한다', () => {
      const thisTerm = new UnivTerm(2025, 1);
      const otherTerm = new UnivTerm(2025, 1);

      expect(thisTerm.isAfter(otherTerm)).toBe(false);
    });

    test('동일 년도이고 본 객체의 학기가 크다면 `true`를 반환해야 한다', () => {
      const thisTerm = new UnivTerm(2025, 2);
      const otherTerm = new UnivTerm(2025, 1);

      expect(thisTerm.isAfter(otherTerm)).toBe(true);
    });

    test('동일 년도이고 본 객체의 학기가 작다면 `false`를 반환해야 한다', () => {
      const thisTerm = new UnivTerm(2025, 1);
      const otherTerm = new UnivTerm(2025, 2);

      expect(thisTerm.isAfter(otherTerm)).toBe(false);
    });

    test('본 객체의 년도가 크다면 `true`를 반환해야 한다', () => {
      const thisTerm = new UnivTerm(2026, 1);
      const otherTerm = new UnivTerm(2025, 2);

      expect(thisTerm.isAfter(otherTerm)).toBe(true);
    });

    test('본 객체의 년도가 작다면 `false`를 반환해야 한다', () => {
      const thisTerm = new UnivTerm(2025, 2);
      const otherTerm = new UnivTerm(2026, 1);

      expect(thisTerm.isAfter(otherTerm)).toBe(false);
    });
  });

  describe('isSame', () => {
    test('년도와 학기가 같다면 `true`를 반환해야 한다', () => {
      const thisTerm = new UnivTerm(2025, 1);
      const otherTerm = new UnivTerm(2025, 1);

      expect(thisTerm.isSame(otherTerm)).toBe(true);
    });

    test('년도가 다르고 학기가 같다면 `false`를 반환해야 한다', () => {
      const thisTerm = new UnivTerm(2025, 1);
      const otherTerm = new UnivTerm(2026, 1);

      expect(thisTerm.isSame(otherTerm)).toBe(false);
    });

    test('년도가 같고 학기가 다르다면 `false`를 반환해야 한다', () => {
      const thisTerm = new UnivTerm(2025, 1);
      const otherTerm = new UnivTerm(2025, 2);

      expect(thisTerm.isSame(otherTerm)).toBe(false);
    });

    test('년도와 학기가 모두 다르다면 `false`를 반환해야 한다', () => {
      const thisTerm = new UnivTerm(2025, 1);
      const otherTerm = new UnivTerm(2026, 2);

      expect(thisTerm.isSame(otherTerm)).toBe(false);
    });
  });
});
