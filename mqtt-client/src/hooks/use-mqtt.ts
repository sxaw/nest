import { MQTTContext } from '@/providers/mqtt-context';
import { useContext } from 'react';

export const useMQTT = () => {
  const context = useContext(MQTTContext);
  if (!context) {
    throw new Error('useMQTT must be used within an MQTTProvider');
  }
  return context;
};
