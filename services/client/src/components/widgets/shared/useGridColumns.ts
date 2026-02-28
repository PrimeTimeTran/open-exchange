'use client';

import { useState, useRef, useEffect } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ColumnDef, SortConfig } from './SortableHeader';

export function useGridColumns(
  initialColumns: ColumnDef[],
  allColumnDefs: ColumnDef[],
  widgetId?: string,
) {
  const [columns, setColumns] = useState<ColumnDef[]>(initialColumns);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const resizingRef = useRef<{
    id: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  // --- Persistence Hydration ---
  useEffect(() => {
    if (!widgetId) {
      setIsHydrated(true);
      return;
    }

    const saved = localStorage.getItem(`grid_state_${widgetId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        // Restore Columns
        if (parsed.columns && Array.isArray(parsed.columns)) {
          const hydratedCols = parsed.columns
            .map((savedCol: any) => {
              const def = allColumnDefs.find((c) => c.id === savedCol.id);
              if (!def) return null; // Skip removed columns
              return { ...def, width: savedCol.width }; // Merge latest def with saved width
            })
            .filter(Boolean) as ColumnDef[];

          if (hydratedCols.length > 0) {
            setColumns(hydratedCols);
          }
        }

        // Restore Sort
        if (parsed.sortConfig) {
          setSortConfig(parsed.sortConfig);
        }
      } catch (e) {
        console.error('Failed to hydrate grid state', e);
      }
    }
    setIsHydrated(true);
  }, [widgetId]); // Intentionally exclude allColumnDefs to run once

  // --- Persistence Save ---
  useEffect(() => {
    if (!widgetId || !isHydrated) return; // Don't save before hydration or if no ID

    const state = {
      columns: columns.map((c) => ({ id: c.id, width: c.width })), // Save only ID and Width
      sortConfig,
    };
    localStorage.setItem(`grid_state_${widgetId}`, JSON.stringify(state));
  }, [columns, sortConfig, widgetId, isHydrated]);

  // --- Sorting ---
  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  // --- Resizing ---
  const startResize = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const col = columns.find((c) => c.id === id);
    if (!col) return;

    resizingRef.current = {
      id,
      startX: e.clientX,
      startWidth: col.width,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizingRef.current) return;
    const { id, startX, startWidth } = resizingRef.current;
    const diff = e.clientX - startX;
    setColumns((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, width: Math.max(40, startWidth + diff) } : c,
      ),
    );
  };

  const handleMouseUp = () => {
    resizingRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // --- Drag & Drop ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // --- Visibility ---
  const toggleColumnVisibility = (colId: string) => {
    setColumns((prev) => {
      const exists = prev.find((c) => c.id === colId);
      if (exists) {
        return prev.filter((c) => c.id !== colId);
      } else {
        const def = allColumnDefs.find((c) => c.id === colId);
        // Append new column
        return [
          ...prev,
          { ...(def || { id: colId, label: colId, width: 80 }) },
        ];
      }
    });
  };

  return {
    columns,
    sortConfig,
    isHydrated,
    handleSort,
    handleDragEnd,
    startResize,
    toggleColumnVisibility,
  };
}
