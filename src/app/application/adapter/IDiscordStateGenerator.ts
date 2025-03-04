export const DiscordStateGeneratorToken = Symbol('DiscordStateGenerator');

export interface IDiscordStateGenerator {
  generate: (userId: number) => string;
}
