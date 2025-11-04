import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeyService } from './api-key.service';
import { ApiKey } from '../entities/api-key.entity';
import { CreateApiKeyDto } from '../dto/create-api-key.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let repository: Repository<ApiKey>;

  const mockApiKey: ApiKey = {
    id: 'test-uuid',
    keyHash: 'hashed-key',
    name: 'Test Key',
    description: 'Test Description',
    isActive: true,
    expiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastUsedAt: null,
    usageCount: 0,
    permissions: ['webhook:read', 'webhook:write'],
    metadata: {},
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: getRepositoryToken(ApiKey),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
    repository = module.get<Repository<ApiKey>>(getRepositoryToken(ApiKey));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateApiKey', () => {
    it('should generate and save a new API key', async () => {
      const createApiKeyDto: CreateApiKeyDto = {
        name: 'Test Key',
        description: 'Test Description',
        permissions: ['webhook:read'],
      };

      mockRepository.create.mockReturnValue(mockApiKey);
      mockRepository.save.mockResolvedValue(mockApiKey);

      const result = await service.generateApiKey(createApiKeyDto);

      expect(result).toBeDefined();
      expect(result.apiKey).toMatch(/^whk_/);
      expect(result.apiKeyDetails).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalledWith({
        keyHash: expect.any(String),
        name: createApiKeyDto.name,
        description: createApiKeyDto.description,
        permissions: createApiKeyDto.permissions,
        expiresAt: undefined,
        metadata: {},
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockApiKey);
    });

    it('should generate API key with expiration', async () => {
      const createApiKeyDto: CreateApiKeyDto = {
        name: 'Test Key',
        expiresAt: new Date('2024-12-31'),
      };

      mockRepository.create.mockReturnValue(mockApiKey);
      mockRepository.save.mockResolvedValue(mockApiKey);

      const result = await service.generateApiKey(createApiKeyDto);

      expect(result).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: createApiKeyDto.expiresAt,
        }),
      );
    });
  });

  describe('validateApiKey', () => {
    it('should return null for non-existent key', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.validateApiKey('invalid-key');

      expect(result).toBeNull();
    });

    it('should return null for expired key', async () => {
      const expiredKey = { ...mockApiKey, expiresAt: new Date('2020-01-01') };
      mockRepository.find.mockResolvedValue([expiredKey]);

      const result = await service.validateApiKey('expired-key');

      expect(result).toBeNull();
    });
  });

  describe('updateUsage', () => {
    it('should update last used timestamp and usage count', async () => {
      mockRepository.update.mockResolvedValue(undefined);

      await service.updateUsage('test-uuid');

      expect(mockRepository.update).toHaveBeenCalledWith('test-uuid', {
        lastUsedAt: expect.any(Date),
        usageCount: expect.any(Function),
      });
    });
  });

  describe('revokeApiKey', () => {
    it('should set isActive to false', async () => {
      mockRepository.update.mockResolvedValue(undefined);

      await service.revokeApiKey('test-uuid');

      expect(mockRepository.update).toHaveBeenCalledWith('test-uuid', {
        isActive: false,
      });
    });
  });

  describe('listApiKeys', () => {
    it('should return list of API keys', async () => {
      const apiKeys = [mockApiKey];
      mockRepository.find.mockResolvedValue(apiKeys);

      const result = await service.listApiKeys();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe(mockApiKey.name);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getApiKeyById', () => {
    it('should return API key by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockApiKey);

      const result = await service.getApiKeyById('test-uuid');

      expect(result).toBeDefined();
      expect(result?.id).toBe(mockApiKey.id);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid' },
      });
    });

    it('should return null for non-existent key', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getApiKeyById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateApiKey', () => {
    it('should update API key details', async () => {
      const updateData = { name: 'Updated Name' };
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.findOne.mockResolvedValue(mockApiKey);

      const result = await service.updateApiKey('test-uuid', updateData);

      expect(result).toBeDefined();
      expect(mockRepository.update).toHaveBeenCalledWith('test-uuid', {
        name: updateData.name,
      });
    });
  });
});
