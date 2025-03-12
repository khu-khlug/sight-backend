import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpRedirectResponse,
  HttpStatus,
  Post,
  Query,
  Redirect,
  Res,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';

import { Auth } from '@khlug/core/auth/Auth';
import { IRequester } from '@khlug/core/auth/IRequester';
import { Requester } from '@khlug/core/auth/Requester';
import { UserRole } from '@khlug/core/auth/UserRole';

import { CallbackDiscordIntegrationRequestDto } from '@khlug/app/interface/user/public/dto/CallbackDiscordIntegrationRequestDto';
import { GetCurrentUserDiscordIntegrationResponseDto } from '@khlug/app/interface/user/public/dto/GetCurrentUserDiscordIntegrationResponseDto';
import { IssueDiscordIntegrationUrlResponseDto } from '@khlug/app/interface/user/public/dto/IssueDiscordIntegrationUrlResponseDto';

import { CreateDiscordIntegrationCommand } from '@khlug/app/application/user/command/createDiscordIntegration/CreateDiscordIntegrationCommand';
import { CreateDiscordOAuth2UrlCommand } from '@khlug/app/application/user/command/createDiscordOAuth2Url/CreateDiscordOAuth2UrlCommand';
import { CreateDiscordOAuth2UrlCommandResult } from '@khlug/app/application/user/command/createDiscordOAuth2Url/CreateDiscordOauth2UrlCommandResult';
import { DeleteUserCommand } from '@khlug/app/application/user/command/deleteUser/DeleteUserCommand';
import { GraduateUserCommand } from '@khlug/app/application/user/command/graduateUser/GraduateUserCommand';
import { RemoveDiscordIntegrationCommand } from '@khlug/app/application/user/command/removeDiscordIntegration/RemoveDiscordIntegrationCommand';
import { GetDiscordIntegrationQuery } from '@khlug/app/application/user/query/getDiscordIntegration/GetDiscordIntegrationQuery';
import { GetDiscordIntegrationQueryResult } from '@khlug/app/application/user/query/getDiscordIntegration/GetDiscordIntegrationQueryResult';

@Controller()
export class UserController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('/users/@me/graduate')
  @Redirect()
  @Auth([UserRole.USER, UserRole.MANAGER])
  @ApiOperation({ summary: '졸업 신고' })
  async graduateCurrentUser(
    @Requester() requester: IRequester,
  ): Promise<HttpRedirectResponse> {
    const command = new GraduateUserCommand(requester.userId);
    await this.commandBus.execute(command);

    // TODO: 추후 클라이언트에서 처리하도록 수정
    return {
      statusCode: HttpStatus.FOUND,
      url: 'https://khlug.org/my',
    };
  }

  @Delete('/users/@me')
  @Auth([UserRole.USER, UserRole.MANAGER])
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async deleteCurrentUser(
    @Requester() requester: IRequester,
    @Res() res: Response,
  ): Promise<void> {
    const command = new DeleteUserCommand(requester.userId);
    await this.commandBus.execute(command);

    res
      .clearCookie('khlug_session', { path: '/' })
      .redirect('https://khlug.org/');
  }

  @Get('/users/@me/discord-integration')
  @Auth([UserRole.USER, UserRole.MANAGER])
  @ApiOperation({ summary: '요청자의 디스코드 연동 정보 조회' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetCurrentUserDiscordIntegrationResponseDto,
  })
  async getCurrentUserDiscordIntegration(
    @Requester() requester: IRequester,
  ): Promise<GetCurrentUserDiscordIntegrationResponseDto> {
    const query = new GetDiscordIntegrationQuery(requester.userId);
    const result: GetDiscordIntegrationQueryResult =
      await this.queryBus.execute(query);

    return GetCurrentUserDiscordIntegrationResponseDto.buildFromQueryResult(
      result,
    );
  }

  @Get('/users/@me/discord-integration/callback')
  @Redirect()
  @Auth([UserRole.USER, UserRole.MANAGER])
  @ApiOperation({ summary: '디스코드 OAuth2 인증 콜백' })
  @ApiResponse({ status: HttpStatus.FOUND })
  async callbackDiscordIntegration(
    @Requester() requester: IRequester,
    @Query() dto: CallbackDiscordIntegrationRequestDto,
  ): Promise<HttpRedirectResponse> {
    const command = new CreateDiscordIntegrationCommand({
      userId: requester.userId,
      code: dto.code,
      state: dto.state,
    });
    await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.FOUND,
      url: 'https://app.khlug.org/member/integrate-discord',
    };
  }

  @Post('/users/@me/discord-integration/issue-url')
  @Auth([UserRole.USER, UserRole.MANAGER])
  @ApiOperation({ summary: '디스코드 OAuth2 인증 URL 발급' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: IssueDiscordIntegrationUrlResponseDto,
  })
  async issueDiscordIntegrationUrl(
    @Requester() requester: IRequester,
  ): Promise<IssueDiscordIntegrationUrlResponseDto> {
    const command = new CreateDiscordOAuth2UrlCommand(requester.userId);
    const result: CreateDiscordOAuth2UrlCommandResult =
      await this.commandBus.execute(command);

    return new IssueDiscordIntegrationUrlResponseDto(result.url);
  }

  @Delete('/users/@me/discord-integration')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth([UserRole.USER, UserRole.MANAGER])
  @ApiOperation({ summary: '디스코드 연동 해제' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async deleteCurrentUserDiscordIntegration(
    @Requester() requester: IRequester,
  ): Promise<void> {
    const command = new RemoveDiscordIntegrationCommand(requester.userId);
    await this.commandBus.execute(command);
  }
}
