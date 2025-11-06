import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useMQTT } from '@/hooks/use-mqtt';

const ConnectionPanel: React.FC = () => {
  const { connect, disconnect, isConnected, isConnecting } = useMQTT();
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
    <Card aria-labelledby="connection-title">
      <CardHeader>
        <CardTitle id="connection-title">MQTT Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={(e) => { e.preventDefault(); handleConnect(); }} aria-label="MQTT connection settings" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="broker">Broker</Label>
              <Input
                id="broker"
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                placeholder="localhost"
                disabled={isConnected}
                required
                aria-describedby="broker-description"
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
                required
                pattern="[0-9]+"
                aria-describedby="port-description"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Switch
                id="auth"
                checked={useAuth}
                onCheckedChange={setUseAuth}
                disabled={isConnected}
              />
              <Label htmlFor="auth" className="cursor-pointer">Use Authentication</Label>
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                id="autosubscribe"
                checked={autoSubscribe}
                onCheckedChange={setAutoSubscribe}
                disabled={isConnected}
              />
              <Label htmlFor="autosubscribe" className="cursor-pointer">Auto-subscribe to all topics (#)</Label>
            </div>
          </div>

          {useAuth && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isConnected}
                  placeholder="Enter username"
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
                  placeholder="Enter password"
                />
              </div>
            </div>
          )}

          <Button
            className={`w-full font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
              isConnected
                ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                : 'bg-accent hover:bg-accent/90 text-accent-foreground'
            }`}
            onClick={isConnected ? handleDisconnect : handleConnect}
            disabled={isConnecting}
            variant={isConnected ? "destructive" : "default"}
            type="button"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : isConnected ? (
              'Disconnect'
            ) : (
              'Connect'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ConnectionPanel;