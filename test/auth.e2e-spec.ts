import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../src/auth/entities/api-key.entity';
import * as bcrypt from 'bcrypt-ts';

describe('API Key Authentication (e2e)', () => {
  let app: INestApplication;
  let apiKeyRepository: Repository<ApiKey>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    apiKeyRepository = moduleFixture.get<Repository<ApiKey>>(
      getRepositoryToken(ApiKey),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await apiKeyRepository.clear();
  });

  describe('API Key Management', () => {
    it('should create a new API key', () => {
      const createApiKeyDto = {
        name: 'Test Webhook Key',
        description: 'Key for Android webhook testing',
        permissions: ['webhook:read', 'webhook:write'],
      };

      return request(app.getHttpServer())
        .post('/api-keys')
        .send(createApiKeyDto)
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('apiKey');
          expect(response.body.apiKey).toMatch(/^whk_/);
          expect(response.body).toHaveProperty('apiKeyDetails');
          expect(response.body.apiKeyDetails.name).toBe(createApiKeyDto.name);
          expect(response.body.apiKeyDetails.permissions).toEqual(
            createApiKeyDto.permissions,
          );
        });
    });

    it('should list all API keys', async () => {
      // First create an API key
      const createResponse = await request(app.getHttpServer())
        .post('/api-keys')
        .send({ name: 'Test Key' });

      // Then list all keys
      return request(app.getHttpServer())
        .get('/api-keys')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body).toHaveLength(1);
          expect(response.body[0].name).toBe('Test Key');
          expect(response.body[0]).not.toHaveProperty('keyHash');
        });
    });
  });

  describe('Webhook Endpoints', () => {
    let validApiKey: string;

    beforeEach(async () => {
      // Create a test API key for webhook tests
      const response = await request(app.getHttpServer())
        .post('/api-keys')
        .send({ name: 'Webhook Test Key' });

      validApiKey = response.body.apiKey;
    });

    it('should allow webhook access with valid API key in X-API-Key header', () => {
      const webhookData = {
        id: 'test-data-123',
        timestamp: new Date().toISOString(),
        payload: { test: 'data' },
      };

      return request(app.getHttpServer())
        .post('/webhooks/android-data')
        .set('X-API-Key', validApiKey)
        .send(webhookData)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('status', 'success');
          expect(response.body).toHaveProperty(
            'message',
            'Data received successfully',
          );
        });
    });

    it('should allow webhook access with valid API key in Authorization Bearer header', () => {
      const webhookData = {
        id: 'test-data-456',
        timestamp: new Date().toISOString(),
        payload: { test: 'data' },
      };

      return request(app.getHttpServer())
        .post('/webhooks/android-data')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send(webhookData)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('status', 'success');
        });
    });

    it('should allow webhook access with valid API key in query parameter', () => {
      const webhookData = {
        id: 'test-data-789',
        timestamp: new Date().toISOString(),
        payload: { test: 'data' },
      };

      return request(app.getHttpServer())
        .post('/webhooks/android-data')
        .query({ api_key: validApiKey })
        .send(webhookData)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('status', 'success');
        });
    });

    it('should reject webhook access without API key', () => {
      const webhookData = {
        id: 'test-data-no-key',
        timestamp: new Date().toISOString(),
        payload: { test: 'data' },
      };

      return request(app.getHttpServer())
        .post('/webhooks/android-data')
        .send(webhookData)
        .expect(401);
    });

    it('should reject webhook access with invalid API key', () => {
      const webhookData = {
        id: 'test-data-invalid-key',
        timestamp: new Date().toISOString(),
        payload: { test: 'data' },
      };

      return request(app.getHttpServer())
        .post('/webhooks/android-data')
        .set('X-API-Key', 'invalid-key')
        .send(webhookData)
        .expect(401);
    });

    it('should allow access to public status endpoint without API key', () => {
      return request(app.getHttpServer())
        .get('/webhooks/status')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('status', 'healthy');
          expect(response.body).toHaveProperty('service', 'webhook-api');
        });
    });

    it('should handle batch webhook data', () => {
      const batchData = [
        { id: 'batch-1', data: 'test1' },
        { id: 'batch-2', data: 'test2' },
        { id: 'batch-3', data: 'test3' },
      ];

      return request(app.getHttpServer())
        .post('/webhooks/batch-data')
        .set('X-API-Key', validApiKey)
        .send(batchData)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('status', 'success');
          expect(response.body).toHaveProperty('message', 'Processed 3 items');
          expect(response.body).toHaveProperty('processedCount', 3);
        });
    });
  });

  describe('API Key Expiration', () => {
    it('should create API key with expiration', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days from now

      const createApiKeyDto = {
        name: 'Expiring Test Key',
        expiresAt: futureDate.toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/api-keys')
        .send(createApiKeyDto)
        .expect(201);

      expect(response.body.apiKeyDetails.expiresAt).toBe(
        futureDate.toISOString(),
      );
    });

    it('should create persistent API key without expiration', async () => {
      const createApiKeyDto = {
        name: 'Persistent Test Key',
      };

      const response = await request(app.getHttpServer())
        .post('/api-keys')
        .send(createApiKeyDto)
        .expect(201);

      expect(response.body.apiKeyDetails.expiresAt).toBeUndefined();
    });
  });
});
