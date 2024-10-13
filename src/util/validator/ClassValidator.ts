import { validateSync } from 'class-validator';

import { ValidationFailedException } from '@khlug/util/validator/ValidationFailedException';

export class ClassValidator {
  static validate(obj: object): void {
    const err = validateSync(obj);
    if (err.length > 0) {
      throw new ValidationFailedException(err);
    }
  }
}
