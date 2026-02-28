'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PositionsFilterDialog } from './PositionsFilterDialog';
import { usePositions, Position } from '@/shared/hooks/usePositions';
import {
  DropdownMenu,
  DropdownMenuSub,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { useGridColumns } from '@/components/widgets/shared/useGridColumns';
import { DraggableGridHeader } from '@/components/widgets/shared/DraggableGridHeader';
import { ColumnDef } from '@/components/widgets/shared/SortableHeader';
import { ColumnSelector } from '@/components/widgets/shared/ColumnSelector';

const ALL_COLUMNS_DEF: ColumnDef[] = [
  { id: 'qty', label: 'Qty', width: 60, align: 'right', defaultWidth: 60 },
  { id: 'dte', label: 'DTE', width: 60, align: 'right', defaultWidth: 60 },
  {
    id: 'avgPrice',
    label: 'Avg price',
    width: 80,
    align: 'right',
    defaultWidth: 80,
  },
  {
    id: 'openPnlPct',
    label: 'Open P&L %',
    width: 100,
    align: 'right',
    defaultWidth: 100,
  },
  {
    id: 'openPnl',
    label: 'Open P&L',
    width: 80,
    align: 'right',
    defaultWidth: 80,
  },
  {
    id: 'dayPnlPct',
    label: '1D open P&L %',
    width: 100,
    align: 'right',
    defaultWidth: 100,
  },
  { id: 'last', label: 'Last', width: 80, align: 'right', defaultWidth: 80 },
  {
    id: 'dayPnl',
    label: '1D open P&L',
    width: 80,
    align: 'right',
    defaultWidth: 80,
  },
  {
    id: 'marketValue',
    label: 'Market value',
    width: 100,
    align: 'right',
    defaultWidth: 100,
  },
  { id: 'bid', label: 'Bid', width: 60, align: 'right', defaultWidth: 60 },
  { id: 'ask', label: 'Ask', width: 60, align: 'right', defaultWidth: 60 },
];

const INITIAL_COLUMNS = ALL_COLUMNS_DEF.slice(0, 5);

export function PositionsWidget() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { positions, toggleExpand } = usePositions();

  const {
    columns,
    sortConfig,
    handleSort,
    handleDragEnd,
    startResize,
    toggleColumnVisibility,
  } = useGridColumns(INITIAL_COLUMNS, ALL_COLUMNS_DEF, 'positions');

  const gridTemplate = `minmax(180px, 1.5fr) ${columns.map((c) => `${c.width}px`).join(' ')}`;

  const sortedPositions = useMemo(() => {
    if (!sortConfig) return positions;

    const sorter = (a: Position, b: Position) => {
      const key = sortConfig.key as keyof Position;
      const aVal = a[key] ?? 0;
      const bVal = b[key] ?? 0;

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    };

    return [...positions].sort(sorter);
  }, [positions, sortConfig]);

  const renderCell = (row: Position, colId: string) => {
    const val = row[colId as keyof Position];

    if (colId === 'openPnlPct') {
      const num = typeof val === 'number' ? val : 0;
      return (
        <span className={num >= 0 ? 'text-green-500' : 'text-red-500'}>
          {num >= 0 ? '▲' : '▼'} {Math.abs(num).toFixed(2)}%
        </span>
      );
    }
    if (colId === 'openPnl') {
      const num = typeof val === 'number' ? val : 0;
      return (
        <span className={num >= 0 ? 'text-green-500' : 'text-red-500'}>
          {num >= 0 ? '▲' : '▼'} ${Math.abs(num).toFixed(2)}
        </span>
      );
    }
    if (colId === 'avgPrice') {
      return typeof val === 'number' ? `$${val.toFixed(2)}` : (val as string);
    }

    if (typeof val === 'string' || typeof val === 'number') {
      return val;
    }

    return '--';
  };

  const renderFixedHeader = () => (
    <div className="relative px-2 py-2 border-b border-white/10 bg-zinc-950 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/50 pointer-events-none" />
      <span className="relative">Symbol</span>
    </div>
  );

  const renderRow = (row: Position, depth = 0) => {
    return (
      <React.Fragment key={row.id}>
        <div
          className="grid gap-0 items-center h-10 text-[12px] font-medium border-b border-white/5 hover:bg-white/5 transition-colors group"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {/* Fixed Symbol Column */}
          <div className="px-2 font-bold text-white flex items-center h-full">
            <div style={{ width: depth * 16 }} />
            {row.children && row.children.length > 0 ? (
              <div
                className="mr-2 cursor-pointer text-muted-foreground hover:text-white"
                onClick={() => toggleExpand(row.id)}
              >
                {row.isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </div>
            ) : (
              <div className="w-5" />
            )}
            <span className="truncate">{row.symbol}</span>
          </div>

          {/* Dynamic Columns */}
          {columns.map((col) => (
            <div
              key={col.id}
              className={cn(
                'px-2 h-full flex items-center overflow-hidden',
                col.align === 'right' ? 'justify-end' : 'justify-start',
              )}
            >
              {renderCell(row, col.id)}
            </div>
          ))}
        </div>
        {/* Nested Rows */}
        {row.isExpanded &&
          row.children?.map((child) => renderRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background/50 text-foreground text-xs overflow-hidden font-sans relative">
      {/* Header */}
      <div className="relative flex items-center justify-between px-3 py-2 border-b border-white/10 bg-zinc-950 shrink-0">
        <div className="absolute inset-0 bg-background/50 pointer-events-none" />
        <div className="relative text-lg font-medium text-white">Positions</div>
        <div className="relative flex gap-1 text-muted-foreground items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:text-white"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-7 w-7 hover:text-white',
              isFilterOpen && 'text-white bg-white/10',
            )}
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="h-4 w-4" />
          </Button>

          <ColumnSelector
            columns={columns}
            allColumns={ALL_COLUMNS_DEF}
            onToggleColumn={toggleColumnVisibility}
            additionalMenuItems={
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  Group by
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
              </>
            }
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-background/50">
        <div className="w-fit min-w-full">
          <DraggableGridHeader
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleSort}
            onResize={startResize}
            onDragEnd={handleDragEnd}
            gridTemplate={gridTemplate}
            renderFixedStart={renderFixedHeader}
          />

          {/* List */}
          {sortedPositions.map((row) => renderRow(row))}
        </div>
      </div>

      <PositionsFilterDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={() => setIsFilterOpen(false)}
      />
    </div>
  );
}
