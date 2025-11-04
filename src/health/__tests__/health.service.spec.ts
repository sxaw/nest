import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthService } from '../health.service';
import { HealthDataPoint } from '../entities/health-data-point.entity';
import { MqttService } from '../../mqtt/mqtt.service';
import { MetricType } from '../enums/metric-type.enum';
import { CreateHealthDataDto } from '../dto/create-health-data.dto';

describe('HealthService', () => {
  let service: HealthService;
  let repository: Repository<HealthDataPoint>;
  let mqttService: MqttService;

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

  const mockMqttService = {
    publishHealthDataPoint: jest.fn(),
  };

  const mockRepository = {
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: getRepositoryToken(HealthDataPoint),
          useValue: mockRepository,
        },
        {
          provide: MqttService,
          useValue: mockMqttService,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    repository = module.get<Repository<HealthDataPoint>>(getRepositoryToken(HealthDataPoint));
    mqttService = module.get<MqttService>(MqttService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processHealthData', () => {
    it('should successfully process health data points', async () => {
      const createHealthDataDto: CreateHealthDataDto = {
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

      mockRepository.save.mockResolvedValue(mockHealthDataPoint);
      mockMqttService.publishHealthDataPoint.mockResolvedValue(undefined);

      const result = await service.processHealthData(createHealthDataDto);

      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(mqttService.publishHealthDataPoint).toHaveBeenCalledWith(
        'user-123',
        'HEART_RATE',
        expect.objectContaining({
          metricType: MetricType.HEART_RATE,
          valueNumeric: 72,
        }),
      );
    });

    it('should handle processing errors gracefully', async () => {
      const createHealthDataDto: CreateHealthDataDto = {
        dataPoints: [
          {
            metricType: MetricType.HEART_RATE,
            valueNumeric: 72,
            unit: 'bpm',
            recordedAt: '2025-01-01T10:00:00Z',
            userId: 'user-123',
          },
        ],
      };

      mockRepository.save.mockRejectedValue(new Error('Database error'));

      const result = await service.processHealthData(createHealthDataDto);

      expect(result.success).toBe(0);
      expect(result.failed).toBe(1);
    });

    it('should process multiple data points', async () => {
      const createHealthDataDto: CreateHealthDataDto = {
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

      mockRepository.save.mockResolvedValue(mockHealthDataPoint);
      mockMqttService.publishHealthDataPoint.mockResolvedValue(undefined);

      const result = await service.processHealthData(createHealthDataDto);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(repository.save).toHaveBeenCalledTimes(2);
      expect(mqttService.publishHealthDataPoint).toHaveBeenCalledTimes(2);
    });
  });

  describe('getHealthDataByUserId', () => {
    it('should return health data for a specific user', async () => {
      const userId = 'user-123';
      const expectedData = [mockHealthDataPoint];

      mockRepository.find.mockResolvedValue(expectedData);

      const result = await service.getHealthDataByUserId(userId);

      expect(result).toEqual(expectedData);
      expect(repository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { recordedAt: 'DESC' },
        take: 100,
      });
    });
  });

  describe('getHealthDataByMetricType', () => {
    it('should return health data for a specific metric type', async () => {
      const metricType = 'HEART_RATE';
      const expectedData = [mockHealthDataPoint];

      mockRepository.find.mockResolvedValue(expectedData);

      const result = await service.getHealthDataByMetricType(metricType);

      expect(result).toEqual(expectedData);
      expect(repository.find).toHaveBeenCalledWith({
        where: { metricType: MetricType.HEART_RATE },
        order: { recordedAt: 'DESC' },
        take: 100,
      });
    });
  });
});