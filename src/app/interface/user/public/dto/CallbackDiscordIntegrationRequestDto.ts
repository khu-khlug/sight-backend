import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CallbackDiscordIntegrationRequestDto {
  @ApiProperty({ description: '디스코드에서 넘겨주는 인증 토큰' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: '유저 인증 용 상태값' })
  @IsString()
  @IsNotEmpty()
  state!: string;
}
