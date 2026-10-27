import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApplicationStatus } from '../../../generated/prisma/enums';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  appliedAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  interviewAt?: Date;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUrl()
  jobUrl?: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
