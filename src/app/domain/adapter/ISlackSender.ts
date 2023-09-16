import { SlackMessageCategory } from '@sight/app/domain/message/model/constant';

export type SlackSendParams = {
  sourceUserId: string | null;
  targetUserId: string;
  message: string;
  category: SlackMessageCategory;
};

export type SlackSendToManagersParams = Omit<SlackSendParams, 'targetUserId'>;

export type SlackBroadcastParams = Omit<
  SlackSendParams,
  'sourceUserId' | 'targetUserId'
>;

export interface ISlackSender {
  send: (params: SlackSendParams) => Promise<void>;
  sendToManagers: (params: SlackSendToManagersParams) => Promise<void>;
  broadcast: (params: SlackBroadcastParams) => Promise<void>;
}
