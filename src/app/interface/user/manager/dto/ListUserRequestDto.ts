import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

import { StudentStatus } from '@khlug/app/domain/user/model/constant';

export class ListUserRequestDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  email: string | null = null;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone: string | null = null;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  name: string | null = null;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  @Matches(/^\d+$/)
  number: string | null = null;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  college: string | null = null;

  @Type(() => Number)
  @IsOptional()
  @Min(1)
  grade: number | null = null;

  @Type(() => Number)
  @IsOptional()
  @IsEnum(StudentStatus)
  studentStatus: StudentStatus | null = null;

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
