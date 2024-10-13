import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationFailedException extends BadRequestException {
  constructor(readonly errors: ValidationError[]) {
    super();
  }
}
