export const TRANSACTIONAL_ENTITY_MANAGER = Symbol(
  'TRANSACTIONAL_ENTITY_MANAGER',
);
export const TRANSACTIONAL_DECORATOR = Symbol('TRANSACTIONAL_DECORATOR');

// ref: https://github.com/nestjs/cqrs/blob/10.2.6/src/decorators/constants.ts
export const COMMAND_HANDLER_METADATA = '__commandHandler__';
export const EVENTS_HANDLER_METADATA = '__eventsHandler__';
