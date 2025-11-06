import { Wifi, Sun, Moon, Monitor } from 'lucide-react';
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
  const { theme, setTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 lg:px-8">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-accent-foreground transition-colors hover:text-accent-foreground/80">MQTT Explorer</span>

          <Tabs value={selectedTab} onValueChange={onTabChange}>
            <TabsList className="transition-colors" role="tablist" aria-label="View options">
              <TabsTrigger
                value="explorer"
                id="explorer-tab"
                className="transition-all duration-200 data-[state=active]:scale-105"
                aria-controls="explorer-panel"
                aria-selected={selectedTab === 'explorer'}
              >
                Explorer
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                id="analytics-tab"
                className="transition-all duration-200 data-[state=active]:scale-105"
                aria-controls="analytics-panel"
                aria-selected={selectedTab === 'analytics'}
              >
                Analytics
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="ml-auto flex items-center space-x-2">
          <div className="flex items-center gap-2 mr-4" role="status" aria-live="polite">
            <Wifi
              className={`h-4 w-4 transition-colors ${
                isConnected ? 'text-mqtt-connected' : 'text-mqtt-disconnected'
              }`}
              aria-hidden="true"
            />
            <span className={`text-sm font-medium transition-colors ${
              isConnected ? 'text-mqtt-connected' : 'text-mqtt-disconnected'
            }`}>
              {connectionStatus}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative transition-all duration-200 hover:scale-105 hover:bg-accent hover:border-accent-foreground/20"
              >
                <div className="transition-transform duration-200 group-hover:rotate-12">
                  {getThemeIcon()}
                </div>
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setTheme('light')}
                className="transition-all duration-200 hover:scale-105 hover:bg-accent/50"
              >
                <Sun className="mr-2 h-4 w-4 transition-colors" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme('dark')}
                className="transition-all duration-200 hover:scale-105 hover:bg-accent/50"
              >
                <Moon className="mr-2 h-4 w-4 transition-colors" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme('system')}
                className="transition-all duration-200 hover:scale-105 hover:bg-accent/50"
              >
                <Monitor className="mr-2 h-4 w-4 transition-colors" />
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
