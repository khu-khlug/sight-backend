import { NotificationCategory } from '@khlug/constant/notification';

export type NotifierSendParams = {
  sourceUserId?: number;
  targetUserId: number;
  message: string;
  category: NotificationCategory;
};

export type NotifierSendToChannelParams = {
  sourceUserId?: number;
  channelId: string;
  message: string;
  category: NotificationCategory;
};

export const NotifierToken = Symbol('Notifier');

export interface INotifier {
  send: (params: NotifierSendParams) => void;
  sendToChannel: (params: NotifierSendToChannelParams) => void;
}
