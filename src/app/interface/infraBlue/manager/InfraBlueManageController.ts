import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Auth } from '@khlug/core/auth/Auth';
import { UserRole } from '@khlug/core/auth/UserRole';

import { GetDoorLockPasswordResponseDto } from '@khlug/app/interface/infraBlue/manager/dto/GetDoorLockPasswordResponseDto';
import { UpdateDoorLockPasswordRequestDto } from '@khlug/app/interface/infraBlue/manager/dto/UpdateDoorLockPasswordRequestDto';

import { UpdateDoorLockPasswordCommand } from '@khlug/app/application/infraBlue/command/updateDoorLockPassword/UpdateDoorLockPasswordCommand';
import { GetDoorLockPasswordQuery } from '@khlug/app/application/infraBlue/query/getDoorLockPassword/GetDoorLockPasswordQuery';
import { GetDoorLockPasswordQueryResult } from '@khlug/app/application/infraBlue/query/getDoorLockPassword/GetDoorLockPasswordQueryResult';

@Controller()
export class InfraBlueManageController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('/manager/door-lock-password')
  @Auth([UserRole.MANAGER])
  @ApiOperation({ summary: '도어락 비밀번호 정보 조회' })
  @ApiResponse({ status: HttpStatus.OK, type: GetDoorLockPasswordResponseDto })
  async getDoorLockPassword(): Promise<GetDoorLockPasswordResponseDto> {
    const query = new GetDoorLockPasswordQuery();
    const queryResult: GetDoorLockPasswordQueryResult =
      await this.queryBus.execute(query);
    return GetDoorLockPasswordResponseDto.buildFromQueryResult(queryResult);
  }

  @Put('/manager/door-lock-password')
  @Auth([UserRole.MANAGER])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '도어락 비밀번호 정보 변경' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async updateDoorLockPassword(
    @Body() dto: UpdateDoorLockPasswordRequestDto,
  ): Promise<void> {
    const { master, forJajudy, forFacilityTeam } = dto;

    const command = new UpdateDoorLockPasswordCommand({
      master,
      forJajudy,
      forFacilityTeam,
    });
    await this.commandBus.execute(command);
  }
}
