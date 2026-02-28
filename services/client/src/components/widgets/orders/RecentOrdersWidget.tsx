'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronRight,
  MoreVertical,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { OrdersFilterDialog } from './OrdersFilterDialog';
import { useRecentOrders } from '@/shared/hooks/useRecentOrders';
import { useGridColumns } from '@/components/widgets/shared/useGridColumns';
import { DraggableGridHeader } from '@/components/widgets/shared/DraggableGridHeader';
import { ColumnDef } from '@/components/widgets/shared/SortableHeader';
import { ColumnSelector } from '@/components/widgets/shared/ColumnSelector';

const ALL_COLUMNS_DEF: ColumnDef[] = [
  { id: 'status', label: 'Status', width: 80, align: 'left', defaultWidth: 80 },
  { id: 'limit', label: 'Limit', width: 80, align: 'right', defaultWidth: 80 },
  {
    id: 'exp',
    label: 'Exp date',
    width: 100,
    align: 'right',
    defaultWidth: 100,
  },
  { id: 'type', label: 'Type', width: 80, align: 'right', defaultWidth: 80 },
  { id: 'qty', label: 'Qty', width: 60, align: 'right', defaultWidth: 60 },
  { id: 'side', label: 'Side', width: 60, align: 'right', defaultWidth: 60 },
  {
    id: 'avgPrice',
    label: 'Average fill price',
    width: 120,
    align: 'right',
    defaultWidth: 120,
  },
  { id: 'bid', label: 'Bid', width: 80, align: 'right', defaultWidth: 80 },
  { id: 'ask', label: 'Ask', width: 80, align: 'right', defaultWidth: 80 },
  {
    id: 'amount',
    label: 'Amount',
    width: 80,
    align: 'right',
    defaultWidth: 80,
  },
  {
    id: 'submitted',
    label: 'Submitted',
    width: 100,
    align: 'right',
    defaultWidth: 100,
  },
  {
    id: 'updated',
    label: 'Updated',
    width: 100,
    align: 'right',
    defaultWidth: 100,
  },
];

const INITIAL_COLUMNS = ALL_COLUMNS_DEF.slice(0, 5); // Status, Limit, Exp, Type, Qty

export function RecentOrdersWidget() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { orders } = useRecentOrders();

  const {
    columns,
    sortConfig,
    handleSort,
    handleDragEnd,
    startResize,
    toggleColumnVisibility,
  } = useGridColumns(INITIAL_COLUMNS, ALL_COLUMNS_DEF, 'recent_orders');

  const gridTemplate = `20px minmax(180px, 1.5fr) ${columns.map((c) => `${c.width}px`).join(' ')}`;

  const sortedOrders = useMemo(() => {
    if (!sortConfig) return orders;

    const sorter = (a: any, b: any) => {
      const key = sortConfig.key;
      const aVal = a[key] ?? '';
      const bVal = b[key] ?? '';

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    };

    return [...orders].sort(sorter);
  }, [orders, sortConfig]);

  const renderCell = (row: any, colId: string) => {
    if (colId === 'status') {
      return (
        <span className="px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-400 text-[10px]">
          {row.status}
        </span>
      );
    }
    if (colId === 'limit') return `$${row.limit.toFixed(2)}`;
    return row[colId] || '--';
  };

  const renderFixedHeader = () => (
    <>
      <div className="relative px-2 py-2 border-b border-white/10 bg-zinc-950">
        <div className="absolute inset-0 bg-background/50 pointer-events-none" />
      </div>
      <div className="relative px-2 py-2 border-b border-white/10 bg-zinc-950">
        <div className="absolute inset-0 bg-background/50 pointer-events-none" />
        <span className="relative">Symbol</span>
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-full bg-background/50 text-foreground text-xs overflow-hidden font-sans relative">
      {/* Header */}
      <div className="relative flex items-center justify-between px-3 py-2 border-b border-white/10 bg-zinc-950 shrink-0">
        <div className="absolute inset-0 bg-background/50 pointer-events-none" />
        <div className="relative text-lg font-medium text-white">
          Recent orders
        </div>
        <div className="relative flex gap-1 text-muted-foreground items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:text-white"
          >
            <Search className="h-4 w-4" />
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7 hover:text-white',
                isFilterOpen && 'text-white bg-white/10',
              )}
              onClick={() => setIsFilterOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <div className="absolute top-0 right-0 bg-zinc-700 text-[9px] text-white px-1 rounded-full border border-[#1e1e1e]">
              2
            </div>
          </div>

          <ColumnSelector
            columns={columns}
            allColumns={ALL_COLUMNS_DEF}
            onToggleColumn={toggleColumnVisibility}
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
          {sortedOrders.map((row) => (
            <div
              key={row.id}
              className="grid gap-0 items-center h-10 text-[12px] font-medium border-b border-white/5 hover:bg-white/5 transition-colors group"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              <div className="px-2 flex justify-center text-muted-foreground">
                <ChevronRight className="h-3 w-3" />
              </div>
              <div className="px-2 font-bold text-white truncate">
                {row.symbol}
              </div>

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
          ))}
        </div>
      </div>

      <OrdersFilterDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={() => setIsFilterOpen(false)}
      />
    </div>
  );
}
