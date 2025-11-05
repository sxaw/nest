import { Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMQTT } from '@/hooks/use-mqtt';
import { useTheme } from '@/hooks/use-theme';

interface HeaderProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

const Header = ({ selectedTab, onTabChange }: HeaderProps) => {
  const { isConnected, connectionStatus } = useMQTT();
  const { setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 lg:px-8">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-accent">MQTT Explorer</span>

          <Tabs value={selectedTab} onValueChange={onTabChange}>
            <TabsList>
              <TabsTrigger value="explorer">Explorer</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="ml-auto flex items-center space-x-2">
          <div className="flex items-center gap-2 mr-4">
            <Wifi
              className="h-4 w-4"
              style={{
                color: isConnected ? 'hsl(var(--mqtt-connected))' : 'hsl(var(--mqtt-disconnected))'
              }}
            />
            <span
              className="text-sm font-medium"
              style={{
                color: isConnected ? 'hsl(var(--mqtt-connected))' : 'hsl(var(--mqtt-disconnected))'
              }}
            >
              {connectionStatus}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <span className="text-lg">🌙</span>
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
