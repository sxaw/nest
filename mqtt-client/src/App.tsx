import { useState } from 'react';
import { MQTTProvider } from '@/providers/MqttProvider';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MainLayout from '@/components/layout/MainLayout';
import ConnectionPanel from '@/components/mqtt/ConnectionPanel';
import SubscriptionPanel from '@/components/mqtt/SubscriptionPanel';
import PublishPanel from '@/components/mqtt/PublishPanel';
import StatisticsPanel from '@/components/mqtt/StatisticsPanel';
import ExplorerPanel from '@/components/mqtt/ExplorerPanel';
import AnalyticsPanel from '@/components/mqtt/AnalyticsPanel';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';

const AppContent = () => {
  const [selectedTab, setSelectedTab] = useState('explorer');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header selectedTab={selectedTab} onTabChange={setSelectedTab} />

      {/* Mobile Menu */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="fixed top-4 left-4 z-40 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0">
          <div className="p-6 space-y-6">
            <ConnectionPanel />
            <SubscriptionPanel />
            <PublishPanel />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="container mx-auto flex-1 items-start px-4 py-6 md:grid md:grid-cols-[280px_1fr] md:gap-8 lg:px-8 lg:py-8 lg:grid-cols-[320px_1fr] lg:gap-10">
        {/* Sidebar - Desktop Only */}
        <Sidebar>
          <div className="space-y-6">
            <ConnectionPanel />
            <SubscriptionPanel />
            <PublishPanel />
          </div>
        </Sidebar>

        {/* Main Content Area */}
        <MainLayout>
          {selectedTab === 'explorer' && (
            <div className="space-y-6">
              <StatisticsPanel />
              <ExplorerPanel />
            </div>
          )}

          {selectedTab === 'analytics' && <AnalyticsPanel />}
        </MainLayout>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mqtt-explorer-theme">
      <MQTTProvider>
        <AppContent />
      </MQTTProvider>
    </ThemeProvider>
  );
};

export default App;
