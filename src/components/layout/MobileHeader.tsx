import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

interface MobileHeaderProps {
  title: string;
}

export function MobileHeader({ title }: MobileHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="lg:hidden h-16 flex items-center px-4 bg-card border-b border-border sticky top-0 z-20">
      <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-full mr-3"
        onClick={() => navigate('/')}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-lg font-bold text-foreground">{title}</h1>
    </header>
  );
}
