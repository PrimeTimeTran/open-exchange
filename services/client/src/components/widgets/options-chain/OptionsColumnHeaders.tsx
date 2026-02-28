'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface OptionsColumnHeadersProps {
  gridTemplate: string;
  sortDirection?: 'asc' | 'desc';
  onStrikeClick?: () => void;
}

export function OptionsColumnHeaders({
  gridTemplate,
  sortDirection,
  onStrikeClick,
}: OptionsColumnHeadersProps) {
  return (
    <div className="sticky top-0 z-30 bg-zinc-950 border-b border-white/10">
      <div className="absolute inset-0 bg-background/50 pointer-events-none" />
      {/* Super Header */}
      <div className="relative grid grid-cols-2 text-center text-xs font-medium text-muted-foreground py-1 border-b border-white/10">
        <div className="border-r border-white/10">Calls</div>
        <div>Puts</div>
      </div>

      {/* Column Headers */}
      <div
        className="relative grid gap-0 font-medium text-muted-foreground text-[11px]"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {/* Calls */}
        <div className="px-2 py-2 text-right">Last</div>
        <div className="px-2 py-2 text-right">Net chg</div>
        <div className="px-2 py-2 text-right border-r border-white/10">
          Volume
        </div>
        <div className="px-2 py-2 text-center text-foreground">Bid</div>
        <div className="px-2 py-2 text-center text-foreground">Ask</div>

        {/* Strike */}
        <div
          className="px-2 py-2 text-center border-x border-white/10 font-bold text-muted-foreground flex items-center justify-center gap-1 cursor-pointer hover:text-foreground hover:bg-white/5 transition-colors select-none"
          onClick={onStrikeClick}
        >
          Strike
          {sortDirection === 'asc' ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </div>

        {/* Puts */}
        <div className="px-2 py-2 text-center text-foreground">Bid</div>
        <div className="px-2 py-2 text-center text-foreground border-r border-white/10">
          Ask
        </div>
        <div className="px-2 py-2 text-right">Last</div>
        <div className="px-2 py-2 text-right">Net chg</div>
        <div className="px-2 py-2 text-right pr-4">Volume</div>
      </div>
    </div>
  );
}
