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
});
