import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApplicationStatus } from '../../../generated/prisma/enums';

export const APPLICATION_SORTS = [
  'appliedAt',
  '-appliedAt',
  'company',
  '-company',
  'dueAt',
  '-dueAt',
  'updatedAt',
  '-updatedAt',
] as const;
export type ApplicationSort = (typeof APPLICATION_SORTS)[number];

export class QueryApplicationsDto {
  /** Matches company, role or location. */
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  /** Exact company name (case-insensitive). */
  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsIn(APPLICATION_SORTS)
  sort?: ApplicationSort;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class CalendarQueryDto {
  @Type(() => Date)
  @IsDate()
  from: Date;

  @Type(() => Date)
  @IsDate()
  to: Date;
}
