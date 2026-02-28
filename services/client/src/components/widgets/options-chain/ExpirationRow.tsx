'use client';

import React from 'react';
import { OptionLeg } from './OrderPanel';
import { ChevronDown } from 'lucide-react';
import { OptionStrike } from '@/shared/hooks/useOptionsChain';
import { cn } from '@/lib/utils';

interface ExpirationRowProps {
  id: string;
  date: string;
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
  gridTemplate: string;
  selectedLegs: OptionLeg[];
  sortDirection?: 'asc' | 'desc';
  strikes: OptionStrike[];
  onAddLeg: (
    side: 'buy' | 'sell',
    type: 'call' | 'put',
    strike: number,
    price: number,
    expiry: string,
  ) => void;
}

export function ExpirationRow({
  id,
  date,
  label,
  onToggle,
  onAddLeg,
  isExpanded,
  selectedLegs,
  gridTemplate,
  sortDirection = 'asc',
  strikes,
}: ExpirationRowProps) {
  const isLegSelected = (
    side: 'buy' | 'sell',
    type: 'call' | 'put',
    strike: number,
  ) => {
    return selectedLegs.some(
      (l) =>
        l.side === side &&
        l.type === type &&
        l.strike === strike &&
        l.expiry === date,
    );
  };

  const sortedStrikes = React.useMemo(() => {
    return [...strikes].sort((a, b) => {
      return sortDirection === 'asc'
        ? a.strike - b.strike
        : b.strike - a.strike;
    });
  }, [sortDirection]);

  return (
    <div className="border-b border-white/10 last:border-0">
      <div
        className="flex items-center gap-3 px-3 py-1.5 cursor-pointer select-none sticky top-14 z-20 border-b border-white/10 transition-colors group"
        onClick={onToggle}
      >
        <div className="absolute inset-0 group-hover:bg-background/70 transition-colors pointer-events-none" />
        <div
          className={`transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
        >
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="relative flex items-baseline gap-2">
          <span className="bg-muted text-foreground px-1.5 rounded text-[10px] font-bold py-0.5">
            {label}
          </span>
          <span className="text-foreground text-xs font-medium">
            {date.split(' ').slice(0, 1)}
          </span>
          <span className="text-muted-foreground text-xs">
            {date.split(' ').slice(1).join(' ')}
          </span>
        </div>
      </div>

      {/* Strikes Table */}
      {isExpanded && (
        <div>
          {sortedStrikes.map((row, i) => {
            if (row.isCurrent) {
              return (
                <div
                  key={i}
                  className="flex justify-center items-center py-1 bg-muted/20 border-y border-white/10 relative "
                >
                  <div className="absolute left-0 right-0 border-t border-dashed border-white/10 top-1/2"></div>
                  <span className="bg-stone-600 px-3 py-0.5 rounded-full text-foreground font-bold text-xs border border-white/10 z-10 relative">
                    ${row.strike}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={i}
                className="grid gap-0 hover:bg-muted/10 group text-[11px] items-center h-9 border-b border-white/10"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {/* Calls Data */}
                <div className="px-2 text-right text-foreground font-mono">
                  {row.call?.last ? (
                    `$${row.call.last.toFixed(2)}`
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </div>
                <div className="px-2 text-right text-foreground font-mono">
                  {row.call?.change ? (
                    `$${row.call.change.toFixed(2)}`
                  ) : (
                    <span className="text-muted-foreground">$0.00</span>
                  )}
                </div>
                <div className="px-2 text-right text-muted-foreground border-r border-white/10 h-full flex items-center justify-end">
                  --
                </div>

                <div className="px-1 text-center">
                  <div
                    className={cn(
                      'bg-red-950/40 text-red-500 rounded py-0.5 font-medium border border-transparent group-hover:border-red-500/30 transition-colors cursor-pointer hover:bg-red-900/60',
                      isLegSelected('sell', 'call', row.strike) &&
                        'bg-red-900 border-red-500 text-white',
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      row.call &&
                        onAddLeg(
                          'sell',
                          'call',
                          row.strike,
                          row.call.bid,
                          date,
                        );
                    }}
                  >
                    ${row.call?.bid.toFixed(2)}
                  </div>
                </div>
                <div className="px-1 text-center">
                  <div
                    className={cn(
                      'bg-green-950/40 text-green-500 rounded py-0.5 font-medium border border-transparent group-hover:border-green-500/30 transition-colors cursor-pointer hover:bg-green-900/60',
                      isLegSelected('buy', 'call', row.strike) &&
                        'bg-green-900 border-green-500 text-white',
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      row.call &&
                        onAddLeg('buy', 'call', row.strike, row.call.ask, date);
                    }}
                  >
                    ${row.call?.ask.toFixed(2)}
                  </div>
                </div>

                {/* Strike */}
                <div className="flex items-center justify-center font-bold text-foreground h-full bg-muted/10">
                  ${row.strike}
                </div>

                {/* Puts Data */}
                <div className="px-1 text-center">
                  <div
                    className={cn(
                      'bg-red-950/40 text-red-500 rounded py-0.5 font-medium border border-transparent group-hover:border-red-500/30 transition-colors cursor-pointer hover:bg-red-900/60',
                      isLegSelected('sell', 'put', row.strike) &&
                        'bg-red-900 border-red-500 text-white',
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      row.put &&
                        onAddLeg('sell', 'put', row.strike, row.put.bid, date);
                    }}
                  >
                    ${row.put?.bid.toFixed(2)}
                  </div>
                </div>
                <div className="px-1 text-center border-r border-white/10 h-full flex items-center justify-center">
                  <div
                    className={cn(
                      'bg-green-950/40 text-green-500 rounded py-0.5 font-medium border border-transparent group-hover:border-green-500/30 transition-colors w-full cursor-pointer hover:bg-green-900/60',
                      isLegSelected('buy', 'put', row.strike) &&
                        'bg-green-900 border-green-500 text-white',
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      row.put &&
                        onAddLeg('buy', 'put', row.strike, row.put.ask, date);
                    }}
                  >
                    ${row.put?.ask.toFixed(2)}
                  </div>
                </div>

                <div className="px-2 text-right text-foreground font-mono">
                  {row.put?.last ? (
                    `$${row.put.last.toFixed(2)}`
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </div>
                <div className="px-2 text-right text-foreground font-mono">
                  {row.put?.change ? (
                    `${row.put.change > 0 ? '' : '-'}$${Math.abs(row.put.change).toFixed(2)}`
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </div>
                <div className="px-2 text-right text-muted-foreground pr-4">
                  --
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
