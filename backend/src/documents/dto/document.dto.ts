import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { DocumentKind } from '../../../generated/prisma/enums';

// Multipart fields arrive as strings; treat "" as "not set".
const emptyToNull = ({ value }: { value: unknown }) =>
  value === '' ? null : value;

export class UploadDocumentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsEnum(DocumentKind)
  kind?: DocumentKind;

  @IsOptional()
  @Transform(emptyToNull)
  @IsUUID()
  applicationId?: string | null;
}

export class UpdateDocumentDto extends PartialType(UploadDocumentDto) {}
