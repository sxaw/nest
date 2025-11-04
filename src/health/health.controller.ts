import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { HealthService } from './health.service';
import { CreateHealthDataDto } from './dto/create-health-data.dto';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly healthService: HealthService) {}

  @Post('android-data')
  @HttpCode(HttpStatus.OK)
  async processAndroidData(
    @Body(new ValidationPipe({ transform: true }))
    createHealthDataDto: CreateHealthDataDto,
  ) {
    this.logger.log(
      `Received ${createHealthDataDto.dataPoints.length} health data points from Android`,
    );

    const results =
      await this.healthService.processHealthData(createHealthDataDto);

    return {
      status: 'processed',
      total: createHealthDataDto.dataPoints.length,
      successful: results.success,
      failed: results.failed,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('data')
  async getHealthData(
    @Query('userId') userId?: string,
    @Query('metricType') metricType?: string,
    @Query('limit') limit: string = '100',
  ) {
    let limitNum = parseInt(limit, 10) || 100;
    limitNum = Math.min(limitNum, 1000); // Cap at 1000 for safety

    if (userId) {
      const data = await this.healthService.getHealthDataByUserId(
        userId,
        limitNum,
      );
      return {
        userId,
        count: data.length,
        data,
      };
    }

    if (metricType) {
      const data = await this.healthService.getHealthDataByMetricType(
        metricType,
        limitNum,
      );
      return {
        metricType,
        count: data.length,
        data,
      };
    }

    return {
      message: 'Please provide either userId or metricType query parameter',
    };
  }
}
