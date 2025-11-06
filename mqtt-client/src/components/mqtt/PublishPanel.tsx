import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMQTT } from '@/hooks/use-mqtt';

const PublishPanel: React.FC = () => {
  const { publish, isConnected } = useMQTT();
  const [topic, setTopic] = useState('');
  const [payload, setPayload] = useState('');
  const [qos, setQos] = useState(0);
  const [retain, setRetain] = useState(false);

  const handlePublish = () => {
    if (topic && payload) {
      publish(topic, payload, qos, retain);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish Message</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="topic/example"
            disabled={!isConnected}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payload">Payload</Label>
          <Textarea
            id="payload"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder="Message content"
            rows={4}
            disabled={!isConnected}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qos">QoS</Label>
            <Select
              value={qos.toString()}
              onValueChange={(value) => setQos(Number(value))}
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

          <div className="flex items-center space-x-2">
            <Switch
              id="retain"
              checked={retain}
              onCheckedChange={setRetain}
              disabled={!isConnected}
            />
            <Label htmlFor="retain">Retain</Label>
          </div>
        </div>

        <Button
          className="w-full bg-accent hover:bg-accent-hover text-accent-foreground font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePublish}
          disabled={!isConnected || !topic || !payload}
        >
          Publish
        </Button>
      </CardContent>
    </Card>
  );
};

export default PublishPanel;
