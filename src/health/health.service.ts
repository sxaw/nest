import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthDataPoint } from './entities/health-data-point.entity';
import { CreateHealthDataDto, HealthDataPointDto } from './dto/create-health-data.dto';
import { MqttService } from '../mqtt/mqtt.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectRepository(HealthDataPoint)
    private readonly healthDataPointRepository: Repository<HealthDataPoint>,
    private readonly mqttService: MqttService,
  ) {}

  async processHealthData(createHealthDataDto: CreateHealthDataDto): Promise<{ success: number; failed: number }> {
    const results = { success: 0, failed: 0 };

    for (const dataPointDto of createHealthDataDto.dataPoints) {
      try {
        const healthDataPoint = this.createHealthDataPointEntity(dataPointDto);
        const savedDataPoint = await this.healthDataPointRepository.save(healthDataPoint);

        // Publish to MQTT
        await this.publishToMqtt(savedDataPoint);

        results.success++;
        this.logger.debug(`Successfully processed health data point: ${savedDataPoint.id}`);
      } catch (error) {
        results.failed++;
        this.logger.error(
          `Failed to process health data point for metric ${dataPointDto.metricType}:`,
          error,
        );
      }
    }

    this.logger.log(`Health data processing complete: ${results.success} successful, ${results.failed} failed`);
    return results;
  }

  private createHealthDataPointEntity(dto: HealthDataPointDto): HealthDataPoint {
    const healthDataPoint = new HealthDataPoint();
    healthDataPoint.metricType = dto.metricType;
    healthDataPoint.valueNumeric = dto.valueNumeric;
    healthDataPoint.valueJson = dto.valueJson;
    healthDataPoint.unit = dto.unit;
    healthDataPoint.recordedAt = new Date(dto.recordedAt);
    healthDataPoint.receivedAt = new Date();
    healthDataPoint.deviceInfo = dto.deviceInfo;
    healthDataPoint.sourceApp = dto.sourceApp;
    healthDataPoint.userId = dto.userId;
    healthDataPoint.metadata = dto.metadata;

    return healthDataPoint;
  }

  private async publishToMqtt(dataPoint: HealthDataPoint): Promise<void> {
    try {
      const userId = dataPoint.userId || 'anonymous';
      await this.mqttService.publishHealthDataPoint(
        userId,
        dataPoint.metricType,
        {
          id: dataPoint.id,
          metricType: dataPoint.metricType,
          valueNumeric: dataPoint.valueNumeric,
          valueJson: dataPoint.valueJson,
          unit: dataPoint.unit,
          recordedAt: dataPoint.recordedAt,
          receivedAt: dataPoint.receivedAt,
          deviceInfo: dataPoint.deviceInfo,
          sourceApp: dataPoint.sourceApp,
          metadata: dataPoint.metadata,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to publish health data point ${dataPoint.id} to MQTT:`, error);
      // Don't throw here - MQTT failure shouldn't break the whole operation
    }
  }

  async getHealthDataByUserId(userId: string, limit: number = 100): Promise<HealthDataPoint[]> {
    return this.healthDataPointRepository.find({
      where: { userId },
      order: { recordedAt: 'DESC' },
      take: limit,
    });
  }

  async getHealthDataByMetricType(metricType: string, limit: number = 100): Promise<HealthDataPoint[]> {
    return this.healthDataPointRepository.find({
      where: { metricType: metricType as any },
      order: { recordedAt: 'DESC' },
      take: limit,
    });
  }
}