import { ConfigService } from '@nestjs/config';

export interface MqttConfig {
  brokerUrl: string;
  clientId: string;
  reconnectPeriod: number;
  connectTimeout: number;
  keepalive: number;
  clean: boolean;
}

export const getMqttConfig = (configService: ConfigService): MqttConfig => {
  const mqttConfig = {
    brokerUrl: configService.get<string>('MQTT_BROKER_URL') ?? '',
    clientId: configService.get<string>('MQTT_CLIENT_ID') ?? '',
  };

  return {
    brokerUrl: mqttConfig.brokerUrl,
    clientId: mqttConfig.clientId,
    reconnectPeriod: 5000, // 5 seconds
    connectTimeout: 30000, // 30 seconds
    keepalive: 60, // 60 seconds
    clean: true,
  };
};
