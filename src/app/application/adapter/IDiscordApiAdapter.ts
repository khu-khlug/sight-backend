export const DiscordRole = {
  MEMBER: 'MEMBER',
  GRADUATED_MEMBER: 'GRADUATED_MEMBER',
  MANAGER: 'MANAGER',
} as const;
export type DiscordRole = (typeof DiscordRole)[keyof typeof DiscordRole];

export type DiscordApiModifyMemberParams = {
  discordUserId: string;
  nickname?: string;
  roles?: DiscordRole[];
};

export const DiscordApiAdapterToken = Symbol('DiscordApiAdapter');

export interface IDiscordApiAdapter {
  hasMember: (discordUserId: string) => Promise<boolean>;
  modifyMember: (params: DiscordApiModifyMemberParams) => Promise<void>;
}
