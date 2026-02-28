'use client';

import React from 'react';
import {
  useSensor,
  useSensors,
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableHeader, ColumnDef, SortConfig } from './SortableHeader';

interface DraggableGridHeaderProps {
  columns: ColumnDef[];
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  onResize: (id: string, e: React.MouseEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  renderFixedStart?: () => React.ReactNode;
  gridTemplate: string;
}

export function DraggableGridHeader({
  columns,
  sortConfig,
  onSort,
  onResize,
  onDragEnd,
  renderFixedStart,
  gridTemplate,
}: DraggableGridHeaderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <div
        className="grid gap-0 font-medium text-muted-foreground text-[11px] sticky top-0 z-10 w-fit bg-zinc-950"
        style={{ gridTemplateColumns: gridTemplate }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-background/50 pointer-events-none" />
        <div className="relative z-10 contents">
          {renderFixedStart && renderFixedStart()}

          <SortableContext
            items={columns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((col) => (
              <SortableHeader
                key={col.id}
                column={col}
                sortConfig={sortConfig}
                onSort={onSort}
                onResize={onResize}
              />
            ))}
          </SortableContext>
        </div>
      </div>
    </DndContext>
  );
}
