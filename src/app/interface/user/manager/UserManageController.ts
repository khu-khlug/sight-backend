import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Auth } from '@khlug/core/auth/Auth';
import { UserRole } from '@khlug/core/auth/UserRole';

import { ListUserRequestDto } from '@khlug/app/interface/user/manager/dto/ListUserRequestDto';
import { ListUserResponseDto } from '@khlug/app/interface/user/manager/dto/ListUserResponseDto';

import { ListUserQuery } from '@khlug/app/application/user/query/listUser/ListUserQuery';

@Controller()
export class UserManageController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/manager/users')
  // @Auth([UserRole.MANAGER])
  @ApiOperation({ summary: '회원 목록 조회' })
  @ApiResponse({ status: HttpStatus.OK, type: ListUserResponseDto })
  async listUser(
    @Query() dto: ListUserRequestDto,
  ): Promise<ListUserResponseDto> {
    const query = new ListUserQuery({
      email: dto.email,
      name: dto.name,
      college: dto.college,
      grade: dto.grade,
      state: dto.state,
      limit: dto.limit,
      offset: dto.offset,
    });
    const result = await this.queryBus.execute(query);
    return ListUserResponseDto.buildFromQueryResult(result);
  }
}
