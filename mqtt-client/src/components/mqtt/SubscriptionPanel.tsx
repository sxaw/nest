import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { useMQTT } from '@/hooks/use-mqtt';

const SubscriptionPanel: React.FC = () => {
  const { subscribe, unsubscribe, isConnected, autoSubscribed } = useMQTT();
  const [topic, setTopic] = useState('');
  const [qos, setQos] = useState(0);
  const [subscriptions, setSubscriptions] = useState<Array<{ topic: string; qos: number }>>([]);

  const handleSubscribe = () => {
    if (topic && isConnected) {
      subscribe(topic, qos);
      setSubscriptions(prev => [...prev, { topic, qos }]);
      setTopic('');
    }
  };

  const handleUnsubscribe = (topicToRemove: string) => {
    unsubscribe(topicToRemove);
    setSubscriptions(prev => prev.filter(sub => sub.topic !== topicToRemove));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Topic Subscriptions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sub-topic">Topic</Label>
          <Input
            id="sub-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="test/# or sensor/temperature"
            disabled={!isConnected}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sub-qos">QoS</Label>
          <Select
            value={qos.toString()}
            onValueChange={(value) => setQos(Number(value))}
            disabled={!isConnected}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select QoS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 - At most once</SelectItem>
              <SelectItem value="1">1 - At least once</SelectItem>
              <SelectItem value="2">2 - Exactly once</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full bg-accent hover:bg-accent-hover text-accent-foreground font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubscribe}
          disabled={!isConnected || !topic}
        >
          <Plus className="h-4 w-4 mr-2" />
          Subscribe
        </Button>

        {(subscriptions.length > 0 || autoSubscribed) && (
          <div className="space-y-2">
            <Label>Active Subscriptions</Label>
            <div className="space-y-2">
              {autoSubscribed && (
                <div className="flex items-center justify-between p-2 border rounded-lg bg-accent/10 border-accent/30">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-accent">#</span>
                    <Badge variant="secondary" className="text-xs bg-accent/20 text-accent border-accent/30 font-medium">
                      QoS 1 (Auto)
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="h-6 w-6 p-0"
                    title="Auto-subscribed wildcard topic"
                  >
                    <X className="h-3 w-3 opacity-0" />
                  </Button>
                </div>
              )}
              {subscriptions.map((sub, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{sub.topic}</span>
                    <Badge variant="secondary" className="text-xs">
                      QoS {sub.qos}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnsubscribe(sub.topic)}
                    disabled={!isConnected}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p className="mb-1">Common subscription patterns:</p>
          <ul className="space-y-1">
            <li><code className="bg-muted px-1 rounded">test/#</code> - All topics under test</li>
            <li><code className="bg-muted px-1 rounded">+/+</code> - Any two-level topic</li>
            <li><code className="bg-muted px-1 rounded">health/#</code> - Health data topics</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPanel;