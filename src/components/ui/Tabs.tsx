import React from 'react';
import { cn } from '../../lib/utils';

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex space-x-1 rounded-2xl bg-muted p-1 border border-border/50', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex flex-1 items-center justify-center space-x-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-all',
            activeTab === tab.id
              ? 'bg-card text-primary shadow-sm border border-border/50'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          )}
        >
          {tab.icon && <span className={cn("h-4 w-4", activeTab === tab.id ? "text-primary" : "text-muted-foreground")}>{tab.icon}</span>}
          <span className="uppercase tracking-wider text-[11px]">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
