import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { AtsProvider } from '../../../generated/prisma/enums';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateCompanyDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(255)
  website?: string | null;

  @IsOptional()
  @IsEnum(AtsProvider)
  atsProvider?: AtsProvider | null;

  @IsOptional()
  @Transform(trim)
  @Matches(/^[A-Za-z0-9._-]+$/, {
    message: 'Board slug may only contain letters, numbers, ".", "_" and "-"',
  })
  atsSlug?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}

export class OpeningsQueryDto {
  @IsOptional()
  @IsBooleanString()
  refresh?: string;
}
