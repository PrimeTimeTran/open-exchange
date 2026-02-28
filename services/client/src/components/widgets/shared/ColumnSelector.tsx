'use client';

import React from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuSub,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from './SortableHeader';

interface ColumnSelectorProps {
  columns: ColumnDef[];
  allColumns: ColumnDef[];
  onDeleteWidget?: () => void;
  onToggleColumn: (id: string) => void;
  additionalMenuItems?: React.ReactNode;
}

export function ColumnSelector({
  columns,
  allColumns,
  onToggleColumn,
  onDeleteWidget,
  additionalMenuItems,
}: ColumnSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:text-foreground"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-background border-white/10 text-foreground z-9999"
      >
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="text-xs focus:bg-accent focus:text-foreground cursor-pointer">
            Customize columns
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56 bg-popover bg-background border-white/10 text-foreground z-9999">
            {allColumns.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={columns.some((c) => c.id === col.id)}
                onCheckedChange={() => onToggleColumn(col.id)}
                className="text-xs focus:bg-accent focus:text-foreground cursor-pointer"
              >
                {col.label || col.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={onDeleteWidget}
          // className="text-xs text-red-400 focus:bg-red-500/20 focus:text-red-400 cursor-pointer">
          className="text-xs text-red-400 focus:bg-red-500/20 focus:text-red-400 cursor-pointer"
        >
          Delete widget
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
