import { createDecorator } from '@toss/nestjs-aop';

import { TRANSACTIONAL_DECORATOR } from '@sight/core/persistence/transaction/constant';

export const Transactional = () => createDecorator(TRANSACTIONAL_DECORATOR, {});
