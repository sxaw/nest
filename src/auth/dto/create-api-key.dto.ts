import {
  IsString,
  IsOptional,
  IsArray,
  IsString as IsStringType,
  Length,
  IsISO8601,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateApiKeyDto {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsStringType({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsISO8601()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  expiresAt?: Date;

  @IsOptional()
  metadata?: Record<string, any>;
}
