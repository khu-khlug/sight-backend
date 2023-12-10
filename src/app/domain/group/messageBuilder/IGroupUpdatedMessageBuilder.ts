import { GroupUpdatedItem } from '@sight/app/domain/group/event/GroupUpdated';

export const GroupUpdatedMessageBuilder = Symbol('GroupUpdatedMessageBuilder');

export interface IGroupUpdatedMessageBuilder {
  build: (updatedItem: GroupUpdatedItem) => string;
}
