'use client';

import React from 'react';
import { MoreVertical, Settings, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OptionsHeaderProps {
  className?: string;
}

export function OptionsHeader({ className }: OptionsHeaderProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-between px-3 py-2 border-b border-white/10 d shrink-0',
        className,
      )}
    >
      {/* <div className="absolute inset-0 bg-background/50 pointer-events-none" /> */}
      <div className="relative flex items-center gap-3 flex-1">
        <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-sm text-foreground">PLTR</span>
          <span className="text-green-500 font-medium">
            $136.93 ▲ $0.99 (0.73%)
          </span>
        </div>
      </div>
      <div className="relative flex bg-muted/50 rounded-md p-0.5 justify-center">
        <button className="px-4 py-1 bg-background shadow-sm rounded-sm text-xs font-medium text-foreground">
          Chain
        </button>
        <button className="px-4 py-1 text-muted-foreground text-xs hover:text-foreground transition-colors">
          Simulated Returns
        </button>
      </div>
      <div className="relative flex gap-1 text-muted-foreground flex-1 justify-end">
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
