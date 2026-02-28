'use client';

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

export interface ColumnDef {
  id: string;
  label: string;
  width: number;
  align?: string;
  sortable?: boolean;
  defaultWidth?: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface SortableHeaderProps {
  column: ColumnDef;
  onResize: (id: string, e: React.MouseEvent) => void;
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
}

export const SortableHeader = ({
  column,
  onResize,
  sortConfig,
  onSort,
}: SortableHeaderProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${column.width}px`,
  };

  const isSorted = sortConfig?.key === column.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'relative py-2 flex items-center bg-card border-b border-white/10 select-none cursor-pointer hover:bg-accent group/header',
        column.align === 'right' ? 'justify-end pr-2' : 'pl-2',
      )}
      onClick={() => onSort(column.id)}
    >
      {column.label}
      {isSorted &&
        (sortConfig!.direction === 'asc' ? (
          <ArrowUp className="h-3 w-3 ml-1" />
        ) : (
          <ArrowDown className="h-3 w-3 ml-1" />
        ))}

      {/* Resize Handle */}
      <div
        className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 z-20 group/handle"
        onMouseDown={(e) => onResize(column.id, e)}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="absolute right-0 top-0 bottom-0 w-px bg-border group-hover/handle:bg-primary group-hover/header:bg-primary h-full" />
      </div>
    </div>
  );
};
