import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Users, User as UserIcon, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    
    // Don't hide if we're at the very top of the page
    if (window.scrollY < 50) {
      setIsVisible(true);
      return;
    }

    inactivityTimer.current = setTimeout(() => {
      // Only auto-hide if not at the top and not focused on an input
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
      
      if (window.scrollY > 100 && !isInputFocused) {
        setIsVisible(false);
      }
    }, 2500); // 2.5 seconds of inactivity
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show on scroll up, hide on scroll down
      if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      lastScrollY.current = currentScrollY;
      resetInactivityTimer();
    };

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // If clicking outside nav and not an input, show the nav
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      const isNav = navRef.current?.contains(target);
      
      if (!isNav && !isInput) {
        setIsVisible(true);
        resetInactivityTimer();
      }
    };

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setIsVisible(false);
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      }
    };
    
    const handleBlur = () => {
      setIsVisible(true);
      resetInactivityTimer();
    };

    const handleInteraction = () => {
      if (!isVisible) setIsVisible(true);
      resetInactivityTimer();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousedown', handleGlobalClick);
    window.addEventListener('focusin', handleFocus);
    window.addEventListener('focusout', handleBlur);
    window.addEventListener('touchstart', handleInteraction, { passive: true });
    
    resetInactivityTimer();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousedown', handleGlobalClick);
      window.removeEventListener('focusin', handleFocus);
      window.removeEventListener('focusout', handleBlur);
      window.removeEventListener('touchstart', handleInteraction);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [isVisible]);

  const navItems = [
    { icon: <MessageSquare className="h-5 w-5" />, path: '/', label: 'Chats' },
    { icon: <Users className="h-5 w-5" />, path: '/explore', label: 'Explore' },
    { icon: <UserIcon className="h-5 w-5" />, path: '/profile', label: 'Profile' },
    { icon: <Settings className="h-5 w-5" />, path: '/settings', label: 'Settings' },
  ];

  return (
    <div 
      ref={navRef}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
    >
      <motion.nav 
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : '100%' }}
        transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
        className="w-full bg-card border-t border-border flex items-center justify-around py-2 px-2 pointer-events-auto"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="icon"
              onClick={() => navigate(item.path)}
              className={cn(
                "rounded-xl h-12 w-full transition-all duration-300 flex flex-col items-center justify-center gap-1",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Button>
          );
        })}
      </motion.nav>
    </div>
  );
}
