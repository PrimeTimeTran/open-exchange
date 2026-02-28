'use client';

import React from 'react';
import { useOptionsChain } from '@/shared/hooks/useOptionsChain';
import { OptionsHeader } from './OptionsHeader';
import { OptionsColumnHeaders } from './OptionsColumnHeaders';
import { ExpirationRow } from './ExpirationRow';

export function OptionsChainWidget() {
  const { chains, expandedId, toggleExpand, addLeg, legs } = useOptionsChain();
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(
    'asc',
  );

  const handleStrikeSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const gridTemplate =
    'minmax(50px, 1fr) minmax(50px, 1fr) minmax(50px, 1fr) minmax(60px, 1fr) minmax(60px, 1fr) 80px minmax(60px, 1fr) minmax(60px, 1fr) minmax(50px, 1fr) minmax(50px, 1fr) minmax(50px, 1fr)';

  return (
    <div className="flex flex-col h-full bg-background/50 text-foreground text-xs overflow-hidden font-sans relative">
      <OptionsHeader />

      <div className="flex-1 overflow-auto">
        <div className="min-w-200">
          <OptionsColumnHeaders
            gridTemplate={gridTemplate}
            sortDirection={sortDirection}
            onStrikeClick={handleStrikeSort}
          />

          {chains.map((exp) => (
            <ExpirationRow
              key={exp.id}
              {...exp}
              isExpanded={expandedId === exp.id}
              onToggle={() => toggleExpand(exp.id)}
              gridTemplate={gridTemplate}
              onAddLeg={addLeg}
              selectedLegs={legs}
              sortDirection={sortDirection}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
