import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeyService } from '../services/api-key.service';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKey } from '../entities/api-key.entity';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let apiKeyService: ApiKeyService;
  let reflector: Reflector;

  const mockApiKey: ApiKey = {
    id: 'test-uuid',
    keyHash: 'hashed-key',
    name: 'Test Key',
    isActive: true,
    expiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastUsedAt: null,
    usageCount: 0,
    permissions: [],
    metadata: {},
  };

  const mockApiKeyService = {
    validateApiKey: jest.fn(),
    updateUsage: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const createMockContext = (
    headers: Record<string, string> = {},
    query: Record<string, string> = {},
  ) => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
          query,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;
    return mockContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyGuard,
        {
          provide: ApiKeyService,
          useValue: mockApiKeyService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<ApiKeyGuard>(ApiKeyGuard);
    apiKeyService = module.get<ApiKeyService>(ApiKeyService);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should allow access for public endpoints', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);
      const context = createMockContext();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when no API key is provided', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      const context = createMockContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid API key', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockApiKeyService.validateApiKey.mockResolvedValue(null);
      const context = createMockContext({ 'x-api-key': 'invalid-key' });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired API key', async () => {
      const expiredKey = { ...mockApiKey, expiresAt: new Date('2020-01-01') };
      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockApiKeyService.validateApiKey.mockResolvedValue(expiredKey);
      const context = createMockContext({ 'x-api-key': 'expired-key' });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive API key', async () => {
      const inactiveKey = { ...mockApiKey, isActive: false };
      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockApiKeyService.validateApiKey.mockResolvedValue(inactiveKey);
      const context = createMockContext({ 'x-api-key': 'inactive-key' });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should allow access for valid API key from X-API-Key header', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockApiKeyService.validateApiKey.mockResolvedValue(mockApiKey);
      mockApiKeyService.updateUsage.mockResolvedValue(undefined);
      const context = createMockContext({ 'x-api-key': 'valid-key' });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockApiKeyService.validateApiKey).toHaveBeenCalledWith(
        'valid-key',
      );
      expect(mockApiKeyService.updateUsage).toHaveBeenCalledWith(mockApiKey.id);
    });

    it('should allow access for valid API key from Authorization Bearer header', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockApiKeyService.validateApiKey.mockResolvedValue(mockApiKey);
      mockApiKeyService.updateUsage.mockResolvedValue(undefined);
      const context = createMockContext({ authorization: 'Bearer valid-key' });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockApiKeyService.validateApiKey).toHaveBeenCalledWith(
        'valid-key',
      );
    });

    it('should allow access for valid API key from query parameter', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockApiKeyService.validateApiKey.mockResolvedValue(mockApiKey);
      mockApiKeyService.updateUsage.mockResolvedValue(undefined);
      const context = createMockContext({}, { api_key: 'valid-key' });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockApiKeyService.validateApiKey).toHaveBeenCalledWith(
        'valid-key',
      );
    });
  });
});
