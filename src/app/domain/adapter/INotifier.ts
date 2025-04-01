import { NotificationCategory } from '@khlug/constant/notification';

export type NotifierSendParams = {
  sourceUserId?: number;
  targetUserId: number;
  message: string;
  category: NotificationCategory;
};

export type NotifierSendToManagersParams = Omit<
  NotifierSendParams,
  'targetUserId'
>;

export type NotifierBroadcastParams = Omit<
  NotifierSendParams,
  'sourceUserId' | 'targetUserId'
>;

export const NotifierToken = Symbol('Notifier');

export interface INotifier {
  send: (params: NotifierSendParams) => void;
  sendToManagers: (params: NotifierSendToManagersParams) => void;
  broadcast: (params: NotifierBroadcastParams) => void;
}
