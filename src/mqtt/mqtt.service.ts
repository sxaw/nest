import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { getMqttConfig } from '../config/mqtt.config';
import { IClientPublishOptions } from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient | null = null;
  private readonly logger = new Logger(MqttService.name);
  private readonly mqttConfig: ReturnType<typeof getMqttConfig>;

  constructor(private readonly configService: ConfigService) {
    this.mqttConfig = getMqttConfig(configService);
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.log(
        `Connecting to MQTT broker at ${this.mqttConfig.brokerUrl}`,
      );

      this.client = mqtt.connect(this.mqttConfig.brokerUrl, {
        clientId: this.mqttConfig.clientId,
        clean: this.mqttConfig.clean,
        reconnectPeriod: this.mqttConfig.reconnectPeriod,
        connectTimeout: this.mqttConfig.connectTimeout,
        keepalive: this.mqttConfig.keepalive,
      });

      this.client.on('connect', () => {
        this.logger.log('Successfully connected to MQTT broker');
        resolve();
      });

      this.client.on('error', (error) => {
        this.logger.error('MQTT connection error:', error);
        reject(error);
      });

      this.client.on('offline', () => {
        this.logger.warn('MQTT client is offline');
      });

      this.client.on('reconnect', () => {
        this.logger.log('MQTT client reconnecting...');
      });
    });
  }

  async disconnect(): Promise<void> {
    if (this.client && this.client.connected) {
      return new Promise((resolve) => {
        this.client!.end(false, {}, () => {
          this.logger.log('MQTT client disconnected');
          resolve();
        });
      });
    }
  }

  async publish(
    topic: string,
    payload: any,
    options?: mqtt.IClientPublishOptions,
  ): Promise<void> {
    if (!this.client || !this.client.connected) {
      this.logger.warn('MQTT client not connected, skipping publish');
      return;
    }

    try {
      const message = JSON.stringify(payload);
      const publishOptions: IClientPublishOptions = {
        qos: 1,
        retain: false,
        ...options,
      };

      this.client.publish(topic, message, publishOptions, (error) => {
        if (error) {
          this.logger.error(`Failed to publish to topic ${topic}:`, error);
        } else {
          this.logger.debug(`Successfully published to topic ${topic}`);
        }
      });
    } catch (error) {
      this.logger.error(`Error publishing to MQTT topic ${topic}:`, error);
      throw error;
    }
  }

  async publishHealthDataPoint(
    userId: string,
    metricType: string,
    dataPoint: any,
  ): Promise<void> {
    const topic = `health/user/${userId}/${metricType.toLowerCase()}`;
    await this.publish(topic, dataPoint);
  }
}
