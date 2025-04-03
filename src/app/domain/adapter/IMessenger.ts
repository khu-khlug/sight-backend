export type MessengerSendParams = {
  targetUserId: number;
  message: string;
};

export type MessengerSendToChannelParams = {
  channelId: string;
  message: string;
};

export const MessengerToken = Symbol('Messenger');

export interface IMessenger {
  send: (params: MessengerSendParams) => void;
  sendToChannel: (params: MessengerSendToChannelParams) => void;
}
