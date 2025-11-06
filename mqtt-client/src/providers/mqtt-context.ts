import { createContext } from 'react';
import mqtt from 'mqtt';
import type { MQTTMessage } from './MqttProvider';

export interface MQTTContextType {
  client: mqtt.MqttClient | null;
  isConnected: boolean;
  isConnecting: boolean;
  messages: MQTTMessage[];
  connectionStatus: string;
  autoSubscribed: boolean;
  connect: (
    broker: string,
    port: string,
    username?: string,
    password?: string,
    autoSubscribe?: boolean,
  ) => void;
  disconnect: () => void;
  publish: (
    topic: string,
    payload: string,
    qos?: number,
    retain?: boolean,
  ) => void;
  subscribe: (topic: string, qos?: number) => void;
  unsubscribe: (topic: string) => void;
  clearMessages: () => void;
}

export const MQTTContext = createContext<MQTTContextType | undefined>(
  undefined,
);
