import { MessageCategory } from '@khlug/constant/message';

export type SlackSendParams = {
  sourceUserId?: number;
  targetUserId: number;
  message: string;
  category: MessageCategory;
};

export type SlackSendToManagersParams = Omit<SlackSendParams, 'targetUserId'>;

export type SlackBroadcastParams = Omit<
  SlackSendParams,
  'sourceUserId' | 'targetUserId'
>;

export const SlackSender = Symbol('SlackSender');

export interface IMessageSender {
  send: (params: SlackSendParams) => void;
  sendToManagers: (params: SlackSendToManagersParams) => void;
  broadcast: (params: SlackBroadcastParams) => void;
}
