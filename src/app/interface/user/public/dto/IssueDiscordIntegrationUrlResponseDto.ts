import { ApiProperty } from '@nestjs/swagger';

export class IssueDiscordIntegrationUrlResponseDto {
  @ApiProperty({ description: '디스코드 OAuth2 인증 URL' })
  url: string;

  constructor(url: string) {
    this.url = url;
  }
}
