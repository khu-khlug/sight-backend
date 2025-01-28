import { SlackMessageCategory } from '@khlug/app/domain/message/model/constant';

export type SlackSendParams = {
  sourceUserId?: number;
  targetUserId: number;
  message: string;
  category: SlackMessageCategory;
};

export type SlackSendToManagersParams = Omit<SlackSendParams, 'targetUserId'>;

export type SlackBroadcastParams = Omit<
  SlackSendParams,
  'sourceUserId' | 'targetUserId'
>;

export const SlackSender = Symbol('SlackSender');

// async sender
export interface ISlackSender {
  send: (params: SlackSendParams) => void;
  sendToManagers: (params: SlackSendToManagersParams) => void;
  broadcast: (params: SlackBroadcastParams) => void;
}
