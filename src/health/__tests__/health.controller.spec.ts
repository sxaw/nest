import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../health.controller';
import { HealthService } from '../health.service';
import { MetricType } from '../enums/metric-type.enum';
import { HealthDataPoint } from '../entities/health-data-point.entity';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  const mockHealthDataPoint: HealthDataPoint = {
    id: 'test-id',
    metricType: MetricType.HEART_RATE,
    valueNumeric: 72,
    unit: 'bpm',
    recordedAt: new Date('2025-01-01T10:00:00Z'),
    receivedAt: new Date(),
    userId: 'user-123',
    deviceInfo: { manufacturer: 'Google', model: 'Pixel 7' },
    sourceApp: 'HealthConnect',
    metadata: null,
    createdAt: new Date(),
  };

  const mockHealthService = {
    processHealthData: jest.fn(),
    getHealthDataByUserId: jest.fn(),
    getHealthDataByMetricType: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('processAndroidData', () => {
    it('should process Android health data successfully', async () => {
      const createHealthDataDto = {
        dataPoints: [
          {
            metricType: MetricType.HEART_RATE,
            valueNumeric: 72,
            unit: 'bpm',
            recordedAt: '2025-01-01T10:00:00Z',
            userId: 'user-123',
            deviceInfo: { manufacturer: 'Google', model: 'Pixel 7' },
            sourceApp: 'HealthConnect',
          },
        ],
      };

      mockHealthService.processHealthData.mockResolvedValue({ success: 1, failed: 0 });

      const result = await controller.processAndroidData(createHealthDataDto);

      expect(result).toEqual({
        status: 'processed',
        total: 1,
        successful: 1,
        failed: 0,
        timestamp: expect.any(String),
      });
      expect(service.processHealthData).toHaveBeenCalledWith(createHealthDataDto);
    });

    it('should handle processing with mixed success and failure', async () => {
      const createHealthDataDto = {
        dataPoints: [
          {
            metricType: MetricType.HEART_RATE,
            valueNumeric: 72,
            unit: 'bpm',
            recordedAt: '2025-01-01T10:00:00Z',
            userId: 'user-123',
          },
          {
            metricType: MetricType.STEPS,
            valueNumeric: 1000,
            unit: 'steps',
            recordedAt: '2025-01-01T10:05:00Z',
            userId: 'user-123',
          },
        ],
      };

      mockHealthService.processHealthData.mockResolvedValue({ success: 1, failed: 1 });

      const result = await controller.processAndroidData(createHealthDataDto);

      expect(result).toEqual({
        status: 'processed',
        total: 2,
        successful: 1,
        failed: 1,
        timestamp: expect.any(String),
      });
    });
  });

  describe('getHealthData', () => {
    it('should return health data by userId', async () => {
      const userId = 'user-123';
      const expectedData = [mockHealthDataPoint];

      mockHealthService.getHealthDataByUserId.mockResolvedValue(expectedData);

      const result = await controller.getHealthData('user-123');

      expect(result).toEqual({
        userId,
        count: 1,
        data: expectedData,
      });
      expect(service.getHealthDataByUserId).toHaveBeenCalledWith(userId, 100);
    });

    it('should return health data by metricType', async () => {
      const metricType = 'HEART_RATE';
      const expectedData = [mockHealthDataPoint];

      mockHealthService.getHealthDataByMetricType.mockResolvedValue(expectedData);

      const result = await controller.getHealthData(undefined, metricType);

      expect(result).toEqual({
        metricType,
        count: 1,
        data: expectedData,
      });
      expect(service.getHealthDataByMetricType).toHaveBeenCalledWith(metricType, 100);
    });

    it('should return message when no query parameters provided', async () => {
      const result = await controller.getHealthData();

      expect(result).toEqual({
        message: 'Please provide either userId or metricType query parameter',
      });
    });

    it('should use custom limit parameter', async () => {
      const userId = 'user-123';
      const limit = '50';

      mockHealthService.getHealthDataByUserId.mockResolvedValue([]);

      await controller.getHealthData(userId, undefined, limit);

      expect(service.getHealthDataByUserId).toHaveBeenCalledWith(userId, 50);
    });

    it('should cap limit at 1000 for safety', async () => {
      const userId = 'user-123';
      const limit = '2000';

      mockHealthService.getHealthDataByUserId.mockResolvedValue([]);

      await controller.getHealthData(userId, undefined, limit);

      expect(service.getHealthDataByUserId).toHaveBeenCalledWith(userId, 1000);
    });
  });
});