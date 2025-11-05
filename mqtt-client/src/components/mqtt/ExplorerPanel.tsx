import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Trash2, Copy } from 'lucide-react';
import { useMQTT } from '@/hooks/use-mqtt';

const ExplorerPanel: React.FC = () => {
  const { messages, clearMessages, isConnected } = useMQTT();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 50;

  const filteredMessages = useMemo(() => {
    if (!searchTerm) return messages;

    const searchLower = searchTerm.toLowerCase();
    return messages.filter(
      (msg) =>
        msg.topic.toLowerCase().includes(searchLower) ||
        msg.payload.toLowerCase().includes(searchLower),
    );
  }, [messages, searchTerm]);

  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * messagesPerPage;
    return filteredMessages.slice(startIndex, startIndex + messagesPerPage);
  }, [filteredMessages, currentPage]);

  const handleCopyPayload = (payload: string) => {
    const prettified = prettifyPayload(payload);
    navigator.clipboard.writeText(prettified);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const prettifyPayload = (payload: string) => {
    try {
      const parsed = JSON.parse(payload);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return payload;
    }
  };

  const getQosColor = (qos: number) => {
    switch (qos) {
      case 0:
        return 'bg-muted text-muted-foreground border border-border';
      case 1:
        return 'bg-accent/20 text-accent border border-accent/30 font-medium';
      case 2:
        return 'bg-accent/30 text-accent-dark border border-accent/50 font-medium';
      default:
        return 'bg-muted text-muted-foreground border border-border';
    }
  };

  const uniqueTopics = useMemo(() => {
    return Array.from(new Set(messages.map((msg) => msg.topic)));
  }, [messages]);

  const topicStats = useMemo(() => {
    const stats = new Map<string, number>();
    messages.forEach((msg) => {
      stats.set(msg.topic, (stats.get(msg.topic) || 0) + 1);
    });
    return Array.from(stats.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }, [messages]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Message Explorer</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={clearMessages}
            className="gap-2 border-accent/30 text-accent hover:bg-accent/10 hover:border-accent"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search topics or payloads..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-24">Time</TableHead>
                      <TableHead className="w-48">Topic</TableHead>
                      <TableHead>Payload</TableHead>
                      <TableHead className="text-center w-16">QoS</TableHead>
                      <TableHead className="text-center w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMessages.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {isConnected
                            ? 'No messages received yet'
                            : 'Connect to a broker to see messages'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedMessages.map((message, index) => (
                        <TableRow key={index} className="align-top">
                          <TableCell className="font-mono text-xs py-3">
                            {formatTimestamp(message.timestamp)}
                          </TableCell>
                          <TableCell className="font-mono text-sm py-3">
                            <div className="break-all">
                              {message.topic}
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <pre className="font-mono text-xs bg-muted p-2 rounded-md whitespace-pre-wrap break-all">
                              {prettifyPayload(message.payload)}
                            </pre>
                          </TableCell>
                          <TableCell className="text-center py-3">
                            <Badge
                              variant="secondary"
                              className={getQosColor(message.qos)}
                            >
                              {message.qos}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyPayload(message.payload)}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * messagesPerPage + 1} to{' '}
                  {Math.min(
                    currentPage * messagesPerPage,
                    filteredMessages.length,
                  )}{' '}
                  of {filteredMessages.length} messages
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="topics" className="space-y-4">
            <div className="grid gap-2">
              {uniqueTopics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {isConnected
                    ? 'No topics discovered yet'
                    : 'Connect to a broker to see topics'}
                </div>
              ) : (
                uniqueTopics.map((topic) => (
                  <div
                    key={topic}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="font-mono text-sm">{topic}</span>
                    <Badge variant="secondary">
                      {messages.filter((msg) => msg.topic === topic).length}{' '}
                      messages
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{messages.length}</div>
                <div className="text-sm text-muted-foreground">
                  Total Messages
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{uniqueTopics.length}</div>
                <div className="text-sm text-muted-foreground">
                  Unique Topics
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Top Topics</h4>
                {topicStats.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No topic data available
                  </div>
                ) : (
                  topicStats.map(([topic, count]) => (
                    <div
                      key={topic}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="font-mono text-sm truncate">
                        {topic}
                      </span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExplorerPanel;
