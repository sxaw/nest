import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { CreateApiKeyDto } from '../dto/create-api-key.dto';
import {
  ApiKeyResponseDto,
  CreateApiKeyResponseDto,
} from '../dto/api-key-response.dto';
import * as crypto from 'crypto';
import { compare, hash } from 'bcrypt-ts';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async generateApiKey(
    createApiKeyDto: CreateApiKeyDto,
  ): Promise<CreateApiKeyResponseDto> {
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const apiKey = `whk_${randomBytes}`;

    const keyHash = await hash(apiKey, 12);

    const apiKeyEntity = this.apiKeyRepository.create({
      keyHash,
      name: createApiKeyDto.name,
      description: createApiKeyDto.description,
      permissions: createApiKeyDto.permissions || [],
      expiresAt: createApiKeyDto.expiresAt,
      metadata: createApiKeyDto.metadata || {},
    });

    const savedApiKey = await this.apiKeyRepository.save(apiKeyEntity);

    return {
      apiKey,
      apiKeyDetails: new ApiKeyResponseDto(savedApiKey),
    };
  }

  async validateApiKey(plainKey: string): Promise<ApiKey | null> {
    const activeKeys = await this.apiKeyRepository.find({
      where: { isActive: true },
    });

    for (const keyEntity of activeKeys) {
      const isValid = await compare(plainKey, keyEntity.keyHash);
      if (isValid) {
        if (keyEntity.expiresAt && keyEntity.expiresAt < new Date()) {
          return null;
        }
        return keyEntity;
      }
    }

    return null;
  }

  async updateUsage(apiKeyId: string): Promise<void> {
    await this.apiKeyRepository.update(apiKeyId, {
      lastUsedAt: new Date(),
      usageCount: () => 'usageCount + 1',
    });
  }

  async revokeApiKey(apiKeyId: string): Promise<void> {
    await this.apiKeyRepository.update(apiKeyId, { isActive: false });
  }

  async listApiKeys(): Promise<ApiKeyResponseDto[]> {
    const apiKeys = await this.apiKeyRepository.find({
      order: { createdAt: 'DESC' },
    });

    return apiKeys.map((key) => new ApiKeyResponseDto(key));
  }

  async getApiKeyById(apiKeyId: string): Promise<ApiKeyResponseDto | null> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id: apiKeyId },
    });

    return apiKey ? new ApiKeyResponseDto(apiKey) : null;
  }

  async updateApiKey(
    apiKeyId: string,
    updateData: Partial<CreateApiKeyDto>,
  ): Promise<ApiKeyResponseDto | null> {
    await this.apiKeyRepository.update(apiKeyId, {
      ...(updateData.name && { name: updateData.name }),
      ...(updateData.description !== undefined && {
        description: updateData.description,
      }),
      ...(updateData.permissions && { permissions: updateData.permissions }),
      ...(updateData.expiresAt !== undefined && {
        expiresAt: updateData.expiresAt,
      }),
      ...(updateData.metadata && { metadata: updateData.metadata }),
    });

    return this.getApiKeyById(apiKeyId);
  }
}
