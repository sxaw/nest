import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useMQTT } from '@/hooks/use-mqtt';

const ConnectionPanel: React.FC = () => {
  const { connect, disconnect, isConnected } = useMQTT();
  const [broker, setBroker] = useState('localhost');
  const [port, setPort] = useState('9001');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [useAuth, setUseAuth] = useState(false);
  const [autoSubscribe, setAutoSubscribe] = useState(true);

  const handleConnect = () => {
    connect(broker, port, useAuth ? username : undefined, useAuth ? password : undefined, autoSubscribe);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="broker">Broker</Label>
          <Input
            id="broker"
            value={broker}
            onChange={(e) => setBroker(e.target.value)}
            placeholder="localhost"
            disabled={isConnected}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="9001"
            disabled={isConnected}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="auth"
            checked={useAuth}
            onCheckedChange={setUseAuth}
            disabled={isConnected}
          />
          <Label htmlFor="auth">Use Authentication</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="autosubscribe"
            checked={autoSubscribe}
            onCheckedChange={setAutoSubscribe}
            disabled={isConnected}
          />
          <Label htmlFor="autosubscribe">Auto-subscribe to all topics (#)</Label>
        </div>

        {useAuth && (
          <>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isConnected}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isConnected}
              />
            </div>
          </>
        )}

        <Button
          className={`w-full font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
            isConnected
              ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
              : ''
          }`}
          style={{
            backgroundColor: isConnected ? undefined : 'hsl(var(--accent))',
            color: isConnected ? undefined : 'hsl(var(--accent-foreground))'
          }}
          onMouseEnter={(e) => {
            if (!isConnected) {
              e.currentTarget.style.backgroundColor = 'hsl(var(--accent-hover))';
            }
          }}
          onMouseLeave={(e) => {
            if (!isConnected) {
              e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
            }
          }}
          onClick={isConnected ? handleDisconnect : handleConnect}
          variant={isConnected ? "destructive" : "default"}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConnectionPanel;