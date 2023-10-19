import { EntityManager } from '@mikro-orm/core';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

import { TRANSACTIONAL_ENTITY_MANAGER } from '@sight/core/persistence/transaction/constant';

@Injectable()
export class TransactionMiddleware implements NestMiddleware {
  constructor(
    private readonly cls: ClsService,
    private readonly em: EntityManager,
  ) {}

  use(request: Request, response: Response, next: NextFunction) {
    this.cls.set(TRANSACTIONAL_ENTITY_MANAGER, this.em);
    next();
  }
}
