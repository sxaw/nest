import React, { useCallback, useEffect, useState } from 'react';
import mqtt from 'mqtt';
import { MQTTContext, type MQTTContextType } from './mqtt-context';

export interface MQTTMessage {
  topic: string;
  payload: string;
  timestamp: number;
  qos: number;
  retain: boolean;
}

interface MQTTProviderProps {
  children: React.ReactNode;
}

export const MQTTProvider = ({ children }: MQTTProviderProps) => {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MQTTMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [autoSubscribed, setAutoSubscribed] = useState(false);

  const connect = useCallback(
    (broker: string, port: string, username?: string, password?: string, autoSubscribe: boolean = false) => {
      if (client) {
        client.end();
        setClient(null);
      }

      const brokerUrl =
        broker.startsWith('ws://') || broker.startsWith('wss://')
          ? broker
          : `ws://${broker}:${port}`;

      console.log('Attempting to connect to MQTT broker:', brokerUrl);

      const options: mqtt.IClientOptions = {
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
        username: username || undefined,
        password: password || undefined,
        clientId: `mqtt-explorer-${Math.random().toString(16).substr(2, 8)}`,
      };

      try {
        const mqttClient = mqtt.connect(brokerUrl, options);

        mqttClient.on('connect', () => {
          console.log('MQTT client connected successfully');
          setIsConnected(true);
          setConnectionStatus('Connected');
          setClient(mqttClient);

          // Auto-subscribe to all topics if enabled
          if (autoSubscribe) {
            console.log('Auto-subscribing to all topics (#)');
            mqttClient.subscribe('#', { qos: 1 }, (error, granted) => {
              if (error) {
                console.error('Failed to auto-subscribe to all topics:', error);
              } else {
                console.log('Successfully auto-subscribed to all topics:', granted);
                setAutoSubscribed(true);
              }
            });
          }
        });

        mqttClient.on('error', (err) => {
          console.error('MQTT connection error:', err);
          setIsConnected(false);
          setConnectionStatus(`Error: ${err.message}`);
          setClient(null);
        });

        mqttClient.on('close', () => {
          console.log('MQTT client connection closed');
          setIsConnected(false);
          setConnectionStatus('Disconnected');
          setClient(null);
          setAutoSubscribed(false);
        });

        mqttClient.on('offline', () => {
          console.log('MQTT client went offline');
          setIsConnected(false);
          setConnectionStatus('Offline');
        });

        mqttClient.on('reconnect', () => {
          console.log('MQTT client reconnecting...');
          setConnectionStatus('Reconnecting...');
        });

        mqttClient.on('message', (topic, payload, packet) => {
          const message: MQTTMessage = {
            topic,
            payload: payload.toString(),
            timestamp: Date.now(),
            qos: packet.qos || 0,
            retain: packet.retain || false,
          };

          setMessages((prev) => [message, ...prev].slice(0, 1000)); // Keep last 1000 messages
        });

        setConnectionStatus('Connecting...');
      } catch (error) {
        console.error('Failed to create MQTT client:', error);
        setConnectionStatus(`Failed to create client: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    [client],
  );

  const disconnect = useCallback(() => {
    if (client) {
      console.log('Disconnecting MQTT client...');
      client.end();
      setClient(null);
      setIsConnected(false);
      setConnectionStatus('Disconnected');
      setAutoSubscribed(false);
    }
  }, [client]);

  const publish = useCallback(
    (
      topic: string,
      payload: string,
      qos: number = 0,
      retain: boolean = false,
    ) => {
      if (client && isConnected) {
        console.log('Publishing to topic:', topic, 'payload:', payload);
        client.publish(topic, payload, { qos, retain }, (error) => {
          if (error) {
            console.error('Publish error:', error);
          } else {
            console.log('Published successfully to:', topic);
          }
        });
      } else {
        console.warn('Cannot publish - MQTT client not connected');
      }
    },
    [client, isConnected],
  );

  const subscribe = useCallback(
    (topic: string, qos: number = 0) => {
      if (client && isConnected) {
        console.log('Subscribing to topic:', topic);
        client.subscribe(topic, { qos }, (error, granted) => {
          if (error) {
            console.error('Subscription error:', error);
          } else {
            console.log('Subscribed successfully to:', topic, granted);
          }
        });
      } else {
        console.warn('Cannot subscribe - MQTT client not connected');
      }
    },
    [client, isConnected],
  );

  const unsubscribe = useCallback(
    (topic: string) => {
      if (client && isConnected) {
        client.unsubscribe(topic);
      }
    },
    [client, isConnected],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    return () => {
      if (client) {
        client.end();
      }
    };
  }, [client]);

  const value: MQTTContextType = {
    client,
    isConnected,
    messages,
    connectionStatus,
    autoSubscribed,
    connect,
    disconnect,
    publish,
    subscribe,
    unsubscribe,
    clearMessages,
  };

  return <MQTTContext.Provider value={value}>{children}</MQTTContext.Provider>;
};
