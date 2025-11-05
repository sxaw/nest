import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMQTT } from '@/hooks/use-mqtt';

const StatisticsPanel: React.FC = () => {
  const { messages, isConnected } = useMQTT();

  const totalMessages = messages.length;
  const uniqueTopics = new Set(messages.map((msg) => msg.topic)).size;
  const avgPayloadSize =
    totalMessages > 0
      ? Math.round(
          messages.reduce((sum, msg) => sum + msg.payload.length, 0) /
            totalMessages,
        )
      : 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg border border-transparent hover:border-accent/20 transition-colors">
            <div className={`text-2xl font-bold ${
              isConnected ? 'text-mqtt-connected' : 'text-mqtt-disconnected'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <div className="text-sm text-muted-foreground">Status</div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg border border-transparent hover:border-accent/20 transition-colors">
            <div className="text-2xl font-bold text-accent">
              {totalMessages.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Messages</div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg border border-transparent hover:border-accent/20 transition-colors">
            <div className="text-2xl font-bold text-accent">
              {uniqueTopics}
            </div>
            <div className="text-sm text-muted-foreground">Unique Topics</div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg border border-transparent hover:border-accent/20 transition-colors">
            <div className="text-2xl font-bold text-accent">
              {avgPayloadSize} bytes
            </div>
            <div className="text-sm text-muted-foreground">
              Avg Payload Size
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsPanel;
