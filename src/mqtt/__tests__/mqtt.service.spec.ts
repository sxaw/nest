import { Test, TestingModule } from '@nestjs/testing';
import { MqttService } from '../mqtt.service';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';

// Mock the mqtt module
jest.mock('mqtt');
const mockMqtt = mqtt as jest.Mocked<typeof mqtt>;

describe('MqttService', () => {
  let service: MqttService;
  let configService: ConfigService;
  let mockClient: jest.Mocked<mqtt.MqttClient>;

  beforeEach(async () => {
    // Create a mock MQTT client
    mockClient = {
      on: jest.fn(),
      publish: jest.fn(),
      connected: true,
      end: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
    } as any;

    // Mock mqtt.connect to return our mock client
    mockMqtt.connect.mockReturnValue(mockClient);

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        switch (key) {
          case 'MQTT_BROKER_URL':
            return 'mqtt://test-broker:1883';
          case 'MQTT_CLIENT_ID':
            return 'test-client';
          default:
            return defaultValue;
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MqttService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MqttService>(MqttService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect to MQTT broker on module init', async () => {
    // Mock successful connection
    let connectCallback: (() => void) | null = null;
    mockClient.on = jest.fn().mockImplementation((event: string, callback: any) => {
      if (event === 'connect') {
        connectCallback = callback;
      }
      return mockClient;
    });

    // Simulate module initialization
    const connectPromise = service.onModuleInit();

    // Simulate successful connection
    if (connectCallback) {
      connectCallback();
    }

    await connectPromise;

    expect(mockMqtt.connect).toHaveBeenCalledWith('mqtt://test-broker:1883', {
      clientId: 'test-client',
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
    });
  });

  it('should handle connection errors', async () => {
    let errorCallback: ((error: Error) => void) | null = null;
    mockClient.on = jest.fn().mockImplementation((event: string, callback: any) => {
      if (event === 'error') {
        errorCallback = callback;
      }
      return mockClient;
    });

    const connectPromise = service.onModuleInit();

    // Simulate connection error
    if (errorCallback) {
      const error = new Error('Connection failed');
      errorCallback(error);
    }

    await expect(connectPromise).rejects.toThrow('Connection failed');
  });

  it('should publish health data point to correct topic', async () => {
    // Mock successful connection first
    mockClient.on = jest.fn().mockImplementation((event: string, callback: any) => {
      if (event === 'connect') {
        callback();
      }
      return mockClient;
    });

    await service.onModuleInit();

    const userId = 'user-123';
    const metricType = 'HEART_RATE';
    const dataPoint = {
      id: 'test-id',
      metricType: 'HEART_RATE',
      value: 72,
    };

    await service.publishHealthDataPoint(userId, metricType, dataPoint);

    expect(mockClient.publish).toHaveBeenCalledWith(
      'health/user/user-123/heart_rate',
      JSON.stringify(dataPoint),
      { qos: 1, retain: false },
      expect.any(Function),
    );
  });

  it('should handle publish when client is not connected', async () => {
    mockClient.connected = false;

    // Mock successful connection
    mockClient.on = jest.fn().mockImplementation((event: string, callback: any) => {
      if (event === 'connect') {
        callback();
      }
      return mockClient;
    });

    await service.onModuleInit();

    await service.publish('test/topic', { data: 'test' });

    // Should not attempt to publish when not connected
    expect(mockClient.publish).not.toHaveBeenCalled();
  });

  it('should disconnect properly', async () => {
    // Mock successful connection
    let endCallback: (() => void) | null = null;
    mockClient.on = jest.fn().mockImplementation((event: string, callback: any) => {
      if (event === 'connect') {
        callback();
      }
      return mockClient;
    });
    mockClient.end = jest.fn().mockImplementation((force?: boolean, opts?: any, callback?: () => void) => {
      if (callback) callback();
      return mockClient;
    });

    await service.onModuleInit();

    const disconnectPromise = service.disconnect();
    await disconnectPromise;

    expect(mockClient.end).toHaveBeenCalled();
  });

  it('should handle publish errors gracefully', async () => {
    // Mock successful connection
    mockClient.on = jest.fn().mockImplementation((event: string, callback: any) => {
      if (event === 'connect') {
        callback();
      }
      return mockClient;
    });

    await service.onModuleInit();

    // Mock publish error
    let publishCallback: ((error: Error | null) => void) | null = null;
    mockClient.publish = jest.fn().mockImplementation((topic, message, options, callback) => {
      publishCallback = callback as (error: Error | null) => void;
      return mockClient;
    });

    await service.publish('test/topic', { data: 'test' });

    // Simulate publish error
    if (publishCallback) {
      const error = new Error('Publish failed');
      publishCallback(error);
    }

    // Should not throw, error should be logged
    expect(mockClient.publish).toHaveBeenCalled();
  });
});