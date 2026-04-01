import React from 'react';
import { Sidebar } from '../chat/Sidebar';
import { MobileNav } from './MobileNav';
import { NewChatModal } from '../chat/NewChatModal';
import { ToastContainer } from '../ui/Toast';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { cn } from '../../lib/utils';
import { useLocation, Outlet } from 'react-router-dom';

export function Layout() {
  const location = useLocation();
  const { theme, activeModal } = useSelector((state: RootState) => state.ui);
  const { selectedChatId } = useSelector((state: RootState) => state.chat);

  const isHome = location.pathname === '/';
  const showSidebarOnMobile = isHome && !selectedChatId;

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground uppercase-none">
      {/* Desktop Sidebar / Mobile Home Sidebar */}
      <div className={cn(
        "lg:flex h-full border-r border-border",
        showSidebarOnMobile ? "flex w-full" : "hidden"
      )}>
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 flex flex-col h-full relative overflow-hidden",
        showSidebarOnMobile ? "hidden lg:flex" : "flex pb-[72px] lg:pb-0"
      )}>
        <Outlet />
      </main>

      {/* Modals */}
      {activeModal === 'new-chat' && <NewChatModal />}
      
      <MobileNav />
      <ToastContainer />
    </div>
  );
}
