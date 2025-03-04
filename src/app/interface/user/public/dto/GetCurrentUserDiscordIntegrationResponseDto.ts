import { ApiProperty } from '@nestjs/swagger';

import { DtoBuilder } from '@khlug/app/interface/util/DtoBuilder';

import { GetDiscordIntegrationQueryResult } from '@khlug/app/application/user/query/getDiscordIntegration/GetDiscordIntegrationQueryResult';

export class GetCurrentUserDiscordIntegrationResponseDto {
  @ApiProperty({ description: '디스코드 연동 정보 ID' })
  id!: string;

  @ApiProperty({ description: '디스코드 유저 ID' })
  discordUserId!: string;

  @ApiProperty({ description: '디스코드 연동일시' })
  createdAt!: Date;

  static buildFromQueryResult({
    view,
  }: GetDiscordIntegrationQueryResult): GetCurrentUserDiscordIntegrationResponseDto {
    return DtoBuilder.build(GetCurrentUserDiscordIntegrationResponseDto, {
      id: view.id,
      discordUserId: view.discordUserId,
      createdAt: view.createdAt,
    });
  }
}
