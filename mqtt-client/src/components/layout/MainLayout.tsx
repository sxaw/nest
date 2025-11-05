import React from 'react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout = ({ children, className }: MainLayoutProps) => {
  return (
    <main className={cn('flex-1 space-y-6 overflow-auto', className)}>
      {children}
    </main>
  );
};

export default MainLayout;
