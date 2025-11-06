import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  TrendingUp,
  Clock,
  Activity,
  Search,
  X,
} from 'lucide-react';
import { useMQTT } from '@/hooks/use-mqtt';

const AnalyticsPanel: React.FC = () => {
  const { messages, isConnected } = useMQTT();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const analytics = useMemo(() => {
    const filtered = messages.filter((msg) => {
      const matchesSearch =
        !searchTerm ||
        msg.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.payload.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTopic =
        selectedTopic === 'all' || msg.topic === selectedTopic;

      return matchesSearch && matchesTopic;
    });

    const totalMessages = filtered.length;
    const uniqueTopics = new Set(filtered.map((msg) => msg.topic)).size;
    const avgPayloadSize =
      totalMessages > 0
        ? Math.round(
            filtered.reduce((sum, msg) => sum + msg.payload.length, 0) /
              totalMessages,
          )
        : 0;

    const recentMessages = filtered.filter(
      (msg) => Date.now() - msg.timestamp < 60000, // Last minute
    ).length;

    const topicDistribution = Array.from(
      new Set(filtered.map((msg) => msg.topic)),
    )
      .map((topic) => ({
        topic,
        count: filtered.filter((msg) => msg.topic === topic).length,
        avgSize: Math.round(
          filtered
            .filter((msg) => msg.topic === topic)
            .reduce((sum, msg) => sum + msg.payload.length, 0) /
            filtered.filter((msg) => msg.topic === topic).length,
        ),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalMessages,
      uniqueTopics,
      avgPayloadSize,
      recentMessages,
      topicDistribution: topicDistribution.slice(0, 10),
    };
  }, [messages, searchTerm, selectedTopic]);

  const uniqueTopics = useMemo(() => {
    return Array.from(new Set(messages.map((msg) => msg.topic)));
  }, [messages]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Dashboard</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="absolute right-1 top-1 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {uniqueTopics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 border-info/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-info/10 rounded-full">
                  <MessageSquare className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Messages
                  </p>
                  <p className="text-3xl font-bold text-info">
                    {analytics.totalMessages.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-success/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Topics
                  </p>
                  <p className="text-3xl font-bold text-success">
                    {analytics.uniqueTopics}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-warning/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-full">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Recent (1 min)
                  </p>
                  <p className="text-3xl font-bold text-warning">
                    {analytics.recentMessages}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-full">
                  <Activity className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Connection
                  </p>
                  <p
                    className={`text-3xl font-bold ${
                      isConnected
                        ? 'text-success'
                        : 'text-destructive'
                    }`}
                  >
                    {isConnected ? 'Active' : 'Offline'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Topic Distribution</h3>
          <div className="space-y-2">
            {analytics.topicDistribution.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {isConnected
                  ? 'No messages received yet'
                  : 'Connect to a broker to see analytics'}
              </div>
            ) : (
              analytics.topicDistribution.map(({ topic, count, avgSize }) => (
                <div
                  key={topic}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-mono text-sm">{topic}</div>
                    <div className="text-xs text-muted-foreground">
                      Avg size: {avgSize} bytes
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{count} messages</Badge>
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(count / analytics.totalMessages) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsPanel;
