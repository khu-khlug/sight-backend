import { ApiProperty } from '@nestjs/swagger';

import { DtoBuilder } from '@khlug/app/interface/util/DtoBuilder';

import { GetDoorLockPasswordQueryResult } from '@khlug/app/application/infraBlue/query/getDoorLockPassword/GetDoorLockPasswordQueryResult';

export class GetDoorLockPasswordResponseDto {
  @ApiProperty({ description: '마스터 비밀번호' })
  master!: string;

  @ApiProperty({ description: '중동연용 비밀번호' })
  forJajudy!: string;

  @ApiProperty({ description: '시설팀용 비밀번호' })
  forFacilityTeam!: string;

  static buildFromQueryResult(
    queryResult: GetDoorLockPasswordQueryResult,
  ): GetDoorLockPasswordResponseDto {
    return DtoBuilder.build(GetDoorLockPasswordResponseDto, {
      master: queryResult.master,
      forJajudy: queryResult.forJajudy,
      forFacilityTeam: queryResult.forFacilityTeam,
    });
  }
}
