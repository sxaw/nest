import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsObject,
  IsString,
  IsDateString,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MetricType } from '../enums/metric-type.enum';

class DeviceInfo {
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  osVersion?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;
}

export class HealthDataPointDto {
  @IsEnum(MetricType)
  metricType: MetricType;

  @IsOptional()
  @IsNumber()
  valueNumeric?: number;

  @IsOptional()
  @IsObject()
  valueJson?: Record<string, any>;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsDateString()
  recordedAt: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceInfo)
  deviceInfo?: DeviceInfo;

  @IsOptional()
  @IsString()
  sourceApp?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateHealthDataDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => HealthDataPointDto)
  dataPoints: HealthDataPointDto[];
}