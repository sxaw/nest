import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { MetricType } from '../enums/metric-type.enum';

@Entity('health_data_points')
@Index(['metricType', 'recordedAt'])
@Index(['userId', 'recordedAt'])
export class HealthDataPoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MetricType,
    name: 'metric_type',
  })
  metricType: MetricType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    name: 'value_numeric',
  })
  valueNumeric?: number;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'value_json',
  })
  valueJson?: Record<string, any>;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'unit',
  })
  unit?: string;

  @Column({
    type: 'timestamp with time zone',
    name: 'recorded_at',
  })
  recordedAt: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'received_at',
  })
  receivedAt: Date;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'device_info',
  })
  deviceInfo?: {
    manufacturer?: string;
    model?: string;
    platform?: string;
    osVersion?: string;
    appVersion?: string;
  };

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'source_app',
  })
  sourceApp?: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'user_id',
  })
  userId?: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'metadata',
  })
  metadata?: Record<string, any>;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt: Date;
}