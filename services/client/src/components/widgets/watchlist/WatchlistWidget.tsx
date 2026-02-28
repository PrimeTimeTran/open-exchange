'use client';

import React, { useMemo } from 'react';
import {
  MoreVertical,
  Plus,
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWatchlist, WatchlistItem } from '@/shared/hooks/useWatchlist';
import { CreateListDialog } from './CreateListDialog';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGridColumns } from '@/components/widgets/shared/useGridColumns';
import { DraggableGridHeader } from '@/components/widgets/shared/DraggableGridHeader';
import { ColumnDef } from '@/components/widgets/shared/SortableHeader';
import { ColumnSelector } from '@/components/widgets/shared/ColumnSelector';

const INITIAL_COLUMNS: ColumnDef[] = [
  { id: 'rank', label: '', width: 40, align: 'center' },
  { id: 'symbol', label: 'Symbol', width: 100, align: 'left', sortable: true },
  { id: 'last', label: 'Last', width: 80, align: 'right', sortable: true },
  { id: 'net', label: 'Net chg', width: 80, align: 'right', sortable: true },
  { id: 'pct', label: 'Chg %', width: 80, align: 'right', sortable: true },
  {
    id: 'volumeRaw',
    label: 'Volume',
    width: 100,
    align: 'right',
    sortable: true,
  },
];

export function WatchlistWidget() {
  const {
    items,
    activeList,
    watchlists,
    createList,
    setActiveListId,
    isCreateDialogOpen,
    setCreateDialogOpen,
  } = useWatchlist();

  const {
    columns,
    sortConfig,
    handleSort,
    handleDragEnd,
    startResize,
    toggleColumnVisibility,
  } = useGridColumns(INITIAL_COLUMNS, INITIAL_COLUMNS, 'watchlist');

  const sortedItems = useMemo(() => {
    const data = [...items];
    if (sortConfig) {
      data.sort((a: any, b: any) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      data.sort((a, b) => a.rank - b.rank);
    }
    return data;
  }, [items, sortConfig]);

  const gridTemplate = columns.map((c) => `${c.width}px`).join(' ');

  const renderCell = (row: WatchlistItem, colId: string) => {
    switch (colId) {
      case 'rank':
        return (
          <div className="text-center text-muted-foreground font-normal">
            {row.rank}
          </div>
        );
      case 'symbol':
        return (
          <div className="font-bold text-foreground flex items-center gap-2 truncate">
            {row.symbol}
            {row.check && (
              <div className="h-3 w-3 rounded-full border border-muted-foreground/50 flex items-center justify-center shrink-0">
                <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
              </div>
            )}
          </div>
        );
      case 'last':
        return (
          <div className="text-right text-foreground font-mono">
            ${row.last.toFixed(2)}
          </div>
        );
      case 'net':
        return (
          <div
            className={cn(
              'text-right font-mono flex items-center justify-end gap-0.5',
              row.net >= 0 ? 'text-green-500' : 'text-red-500',
            )}
          >
            {row.net >= 0 ? (
              <ArrowUp className="h-2.5 w-2.5" />
            ) : (
              <ArrowDown className="h-2.5 w-2.5" />
            )}
            ${Math.abs(row.net).toFixed(2)}
          </div>
        );
      case 'pct':
        return (
          <div
            className={cn(
              'text-right font-mono flex items-center justify-end gap-0.5',
              row.pct >= 0 ? 'text-green-500' : 'text-red-500',
            )}
          >
            {row.pct >= 0 ? (
              <ArrowUp className="h-2.5 w-2.5" />
            ) : (
              <ArrowDown className="h-2.5 w-2.5" />
            )}
            {Math.abs(row.pct).toFixed(2)}%
          </div>
        );
      case 'volumeRaw':
        return (
          <div className="text-right text-muted-foreground pr-4 font-mono">
            {row.volume}
          </div>
        );
      default:
        return null;
    }
  };

  const sharedSortConfig = sortConfig
    ? { key: sortConfig.key, direction: sortConfig.direction }
    : null;

  return (
    <div className="flex flex-col h-full bg-background/50 text-foreground text-xs overflow-hidden font-sans relative">
      {/* Header */}
      <div className="relative flex items-center justify-between px-3 py-2 border-b border-white/10 bg-zinc-950 shrink-0">
        <div className="absolute inset-0 bg-background/50 pointer-events-none" />
        <div className="relative z-10 contents">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-lg font-medium hover:text-foreground transition-colors outline-none">
                <span className="w-3 h-3 bg-primary rounded-sm mr-1"></span>
                {activeList.name}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 text-foreground">
              {watchlists.map((list) => (
                <DropdownMenuItem
                  key={list.id}
                  onClick={() => setActiveListId(list.id)}
                  className="cursor-pointer focus:bg-accent focus:text-foreground"
                >
                  {list.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-1 text-muted-foreground">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:text-foreground"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>

            <ColumnSelector
              columns={columns}
              allColumns={INITIAL_COLUMNS}
              onToggleColumn={toggleColumnVisibility}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-background/50">
        <div className="w-fit min-w-full">
          <DraggableGridHeader
            columns={columns}
            sortConfig={sharedSortConfig}
            onSort={(key) => handleSort(key as any)}
            onResize={startResize}
            onDragEnd={handleDragEnd}
            gridTemplate={gridTemplate}
          />

          {/* Data Rows */}
          {sortedItems.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground italic">
              No symbols in this list
            </div>
          ) : (
            sortedItems.map((row) => (
              <div
                key={row.symbol}
                className={cn(
                  'grid gap-0 items-center h-9 text-[12px] font-medium border-b border-white/10 cursor-pointer transition-colors group',
                  row.selected ? 'bg-accent' : 'hover:bg-muted/50',
                )}
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {columns.map((col) => (
                  <div
                    key={col.id}
                    className={cn(
                      'px-2 h-full flex items-center overflow-hidden',
                      col.align === 'right'
                        ? 'justify-end'
                        : col.align === 'center'
                          ? 'justify-center'
                          : 'justify-start',
                    )}
                  >
                    {renderCell(row, col.id)}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      <CreateListDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={createList}
      />
    </div>
  );
}
