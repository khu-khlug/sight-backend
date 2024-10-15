import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDoorLockPasswordRequestDto {
  @ApiProperty({ description: '마스터 비밀번호' })
  @IsString()
  @IsNotEmpty()
  master!: string;

  @ApiProperty({ description: '중동연용 비밀번호' })
  @IsString()
  @IsNotEmpty()
  forJajudy!: string;

  @ApiProperty({ description: '시설팀용 비밀번호' })
  @IsString()
  @IsNotEmpty()
  forFacilityTeam!: string;
}
