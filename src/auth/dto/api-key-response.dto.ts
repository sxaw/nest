import { ApiKey } from '../entities/api-key.entity';
import { Exclude, Expose, Transform } from 'class-transformer';

export class ApiKeyResponseDto {
  constructor(partial: Partial<ApiKey>) {
    Object.assign(this, partial);
  }

  @Exclude()
  keyHash: string;

  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  expiresAt?: Date;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  lastUsedAt?: Date;

  @Expose()
  usageCount: number;

  @Expose()
  permissions: string[];

  @Expose()
  metadata?: Record<string, any>;
}

export class CreateApiKeyResponseDto {
  @Expose()
  apiKey: string;

  @Expose()
  @Transform(({ value }) => new ApiKeyResponseDto(value))
  apiKeyDetails: ApiKeyResponseDto;
}
