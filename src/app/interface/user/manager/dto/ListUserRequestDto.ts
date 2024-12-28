import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

import { UserState } from '@khlug/app/domain/user/model/constant';

export class ListUserRequestDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  email: string | null = null;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  name: string | null = null;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  college: string | null = null;

  @Type(() => Number)
  @IsOptional()
  @Min(1)
  grade: number | null = null;

  @IsOptional()
  @IsEnum(UserState)
  state: UserState | null = null;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset!: number;
}
