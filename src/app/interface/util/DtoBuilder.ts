import { Type } from '@nestjs/common';

export class DtoBuilder {
  static build<T extends object>(ctor: Type<T>, params: T): T {
    return Object.assign(new ctor(), params);
  }
}
