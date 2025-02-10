import { Type } from '@mikro-orm/core';

const LEGACY_NON_STANDARD_DATE = '0000-00-00 00:00:00';

// 레거시 데이터가 `0000-00-00 00:00:00`와 같은 non-standard 데이터를 갖고 있어,
// 이를 적절하게 변환하기 위한 컨버터입니다.
// 사이트 시스템 마이그레이션이 완료된 뒤에는 제거해야 합니다.
export class LegacyDateConverter extends Type<Date | null, string> {
  convertToDatabaseValue(value: Date | null): string {
    if (value === null) {
      return LEGACY_NON_STANDARD_DATE;
    } else {
      // 밀리초 제거 후 `T`를 공백으로 대체하여 반환합니다.
      // ex) `2025-02-10T17:11:56.977Z` -> `2025-02-10 17:11:56`
      return value.toISOString().slice(0, 19).replace('T', ' ');
    }
  }

  convertToJSValue(value: string): Date | null {
    if (value === LEGACY_NON_STANDARD_DATE) {
      return null;
    } else {
      return new Date(value);
    }
  }
}
