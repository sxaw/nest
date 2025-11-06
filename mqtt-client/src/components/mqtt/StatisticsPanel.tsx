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
          <div className="group text-center p-4 bg-muted/50 rounded-lg border border-transparent hover:border-accent/30 hover:bg-muted/70 hover:shadow-sm transition-all duration-200 cursor-default">
            <div className={`text-2xl font-bold transition-all duration-200 group-hover:scale-105 ${
              isConnected ? 'text-mqtt-connected' : 'text-mqtt-disconnected'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <div className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">Status</div>
          </div>

          <div className="group text-center p-4 bg-muted/50 rounded-lg border border-transparent hover:border-accent/30 hover:bg-muted/70 hover:shadow-sm transition-all duration-200 cursor-default">
            <div className="text-2xl font-bold text-foreground transition-all duration-200 group-hover:scale-105">
              {totalMessages.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">Total Messages</div>
          </div>

          <div className="group text-center p-4 bg-muted/50 rounded-lg border border-transparent hover:border-accent/30 hover:bg-muted/70 hover:shadow-sm transition-all duration-200 cursor-default">
            <div className="text-2xl font-bold text-foreground transition-all duration-200 group-hover:scale-105">
              {uniqueTopics}
            </div>
            <div className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">Unique Topics</div>
          </div>

          <div className="group text-center p-4 bg-muted/50 rounded-lg border border-transparent hover:border-accent/30 hover:bg-muted/70 hover:shadow-sm transition-all duration-200 cursor-default">
            <div className="text-2xl font-bold text-foreground transition-all duration-200 group-hover:scale-105">
              {avgPayloadSize} bytes
            </div>
            <div className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
              Avg Payload Size
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsPanel;
