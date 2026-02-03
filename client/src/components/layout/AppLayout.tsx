import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

export function AppLayout({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-glow fixed inset-0 pointer-events-none" />
      <main className={`relative ${hideNav ? '' : 'pb-20'}`}>{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
}