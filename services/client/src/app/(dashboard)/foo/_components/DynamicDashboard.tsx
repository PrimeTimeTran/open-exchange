'use client';

// @ts-ignore
import 'react-grid-layout/css/styles.css';
// @ts-ignore
import 'react-resizable/css/styles.css';
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import _ from 'lodash';
import { Plus, LayoutGrid } from 'lucide-react';
import * as ReactGridLayoutNamespace from 'react-grid-layout';
import GridLayout, { Responsive as ResponsiveImport } from 'react-grid-layout';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WidgetContent } from './widget-content';
import { PriceUpdate } from 'src/proto/market/market';
import { ChartDataPoint } from '@/shared/hooks/useMarketChart';
import { DEFAULT_LAYOUTS, LayoutConfig, Widget } from './layouts';

interface DynamicDashboardProps {
  initialMarketData?: PriceUpdate;
  initialChartData?: ChartDataPoint[];
}

const RGL = ReactGridLayoutNamespace as any;

const Responsive =
  ResponsiveImport ||
  (GridLayout as any)?.Responsive ||
  RGL?.Responsive ||
  RGL?.default?.Responsive;

const ResponsiveGridLayout = Responsive;

export function DynamicDashboard({
  initialMarketData,
  initialChartData,
}: DynamicDashboardProps) {
  const [activeLayoutId, setActiveLayoutId] = useState<string>('options');
  const [layouts, setLayouts] = useState<LayoutConfig[]>(DEFAULT_LAYOUTS);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState(60);
  const [width, setWidth] = useState(1200);

  const TOTAL_ROWS = 12;
  const MARGIN = 10;

  const initialLayoutRef = useRef<Widget[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        const calculatedRowHeight =
          (height - MARGIN * (TOTAL_ROWS + 1)) / TOTAL_ROWS;
        setRowHeight(Math.max(10, calculatedRowHeight));

        const newWidth = containerRef.current.clientWidth;
        setWidth(newWidth);
      }
    };

    const timer = setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, [isMounted]);

  const activeLayout =
    layouts.find((l) => l.id === activeLayoutId) || layouts[0];

  const onDragStart = () => {
    initialLayoutRef.current = _.cloneDeep(activeLayout.widgets);
  };

  const onDragStop = (layout: any, oldItem: any, newItem: any) => {
    const widgets = _.cloneDeep(initialLayoutRef.current);
    const isLockedLayout = activeLayoutId === 'three-columns';

    const draggedWidgetIndex = widgets.findIndex((w) => w.i === newItem.i);
    if (draggedWidgetIndex !== -1) {
      widgets[draggedWidgetIndex].x = newItem.x;
      if (isLockedLayout) {
        widgets[draggedWidgetIndex].y = 0;
      } else {
        widgets[draggedWidgetIndex].y = newItem.y;
      }
    }

    const rows: { [key: number]: Widget[] } = {};
    widgets.forEach((w) => {
      let rowY = Math.round(w.y);
      if (isLockedLayout) {
        rowY = 0;
        w.y = 0;
      }
      if (!rows[rowY]) rows[rowY] = [];
      rows[rowY].push(w);
    });

    const repackedWidgets: Widget[] = [];
    Object.keys(rows)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach((yKey) => {
        const rowWidgets = rows[parseInt(yKey)];

        rowWidgets.sort((a, b) => {
          const getCenter = (w: Widget) => {
            if (w.i === newItem.i) {
              return newItem.x + w.w / 2;
            }
            return w.x + w.w / 2;
          };
          return getCenter(a) - getCenter(b);
        });

        let currentX = 0;
        rowWidgets.forEach((w) => {
          w.x = currentX;
          currentX += w.w;
          repackedWidgets.push(w);
        });
      });

    setLayouts((prev) =>
      prev.map((l) =>
        l.id === activeLayoutId ? { ...l, widgets: repackedWidgets } : l,
      ),
    );
  };

  const handleResize = (layout: any, oldItem: any, newItem: any) => {
    const isLockedLayout = activeLayoutId === 'three-columns';
    const MIN_WIDTH = 2; // Minimum column width

    setLayouts((prev) =>
      prev.map((l) => {
        if (l.id !== activeLayoutId) return l;

        let newWidgets = _.cloneDeep(l.widgets);

        const resizedIndex = newWidgets.findIndex((w) => w.i === newItem.i);
        if (resizedIndex === -1) return l;

        const oldStateItem = oldItem; // Item state before this resize session (or previous tick)
        // Actually, 'oldItem' passed by RGL is the state at start of resize?
        // No, it's the state before this specific update event.
        // We use it to calculate delta.

        // Calculate raw requested delta
        const rawWidthDiff = newItem.w - oldStateItem.w;
        const rawXDiff = newItem.x - oldStateItem.x;

        const isEastResize = rawWidthDiff !== 0 && rawXDiff === 0;
        const isWestResize = rawXDiff !== 0;

        let actualWidthDiff = rawWidthDiff;
        let actualXDiff = rawXDiff;

        // Force Y Lock
        if (isLockedLayout) {
          newWidgets.forEach((w) => (w.y = 0));
          newItem.y = 0;
        }

        // Logic to clamp and update neighbor
        if (rawWidthDiff !== 0) {
          if (isEastResize) {
            const neighborStartX = oldStateItem.x + oldStateItem.w;
            const neighborIndex = newWidgets.findIndex(
              (w) =>
                w.x === neighborStartX &&
                Math.round(w.y) === Math.round(newItem.y) &&
                w.i !== newItem.i,
            );

            if (neighborIndex !== -1) {
              const neighbor = newWidgets[neighborIndex];

              // Limit expansion: Neighbor cannot be smaller than MIN_WIDTH
              // Limit shrinking: I cannot be smaller than MIN_WIDTH

              if (rawWidthDiff > 0) {
                // Expanding East -> Neighbor Shrinks
                const maxExpand = neighbor.w - MIN_WIDTH;
                actualWidthDiff = Math.min(rawWidthDiff, maxExpand);
              } else {
                // Shrinking East -> Neighbor Grows
                // Limit by my own min width
                const maxShrink = oldStateItem.w - MIN_WIDTH;
                // rawWidthDiff is negative. abs(raw) <= maxShrink
                actualWidthDiff = Math.max(rawWidthDiff, -maxShrink);
              }

              // Apply to Neighbor
              newWidgets[neighborIndex] = {
                ...neighbor,
                x: neighbor.x + actualWidthDiff,
                w: neighbor.w - actualWidthDiff,
              };
            }
          } else if (isWestResize) {
            const neighborEndX = oldStateItem.x;
            const neighborIndex = newWidgets.findIndex(
              (w) =>
                w.x + w.w === neighborEndX &&
                Math.round(w.y) === Math.round(newItem.y) &&
                w.i !== newItem.i,
            );

            if (neighborIndex !== -1) {
              const neighbor = newWidgets[neighborIndex];

              // West Resize:
              // Expand Left (x -1, w +1) -> Neighbor Shrinks
              // Shrink Right (x +1, w -1) -> Neighbor Grows

              // If expanding left, rawWidthDiff is > 0.
              // Neighbor shrinks by rawWidthDiff.

              if (rawWidthDiff > 0) {
                // Expanding Left -> Neighbor Shrinks
                const maxExpand = neighbor.w - MIN_WIDTH;
                actualWidthDiff = Math.min(rawWidthDiff, maxExpand);
                actualXDiff = -actualWidthDiff; // x moves left by same amount
              } else {
                // Shrinking Right -> Neighbor Grows
                const maxShrink = oldStateItem.w - MIN_WIDTH;
                actualWidthDiff = Math.max(rawWidthDiff, -maxShrink);
                actualXDiff = -actualWidthDiff; // x moves right by same amount
              }

              // Apply to Neighbor
              newWidgets[neighborIndex] = {
                ...neighbor,
                w: neighbor.w - actualWidthDiff,
              };
            }
          }
        }

        // Apply Clamped Resize to Target
        newWidgets[resizedIndex] = {
          ...newWidgets[resizedIndex],
          x: oldStateItem.x + actualXDiff, // For West resize, x changes
          y: newItem.y,
          w: oldStateItem.w + actualWidthDiff,
          h: newItem.h,
        };

        // Vertical logic omitted for brevity as horizontal is the focus, but structure allows it.

        return { ...l, widgets: newWidgets };
      }),
    );
  };

  if (!isMounted) return null;

  const responsiveLayouts = {
    lg: activeLayout.widgets,
    md: activeLayout.widgets,
    sm: activeLayout.widgets,
    xs: activeLayout.widgets,
    xxs: activeLayout.widgets,
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col gap-2 p-2 overflow-x-hidden bg-zinc-950 overscroll-x-none">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex gap-2">
          {layouts.map((layout) => (
            <Button
              key={layout.id}
              variant={activeLayoutId === layout.id ? 'outline' : 'link'}
              onClick={() => setActiveLayoutId(layout.id)}
              className="h-8 text-xs"
            >
              <LayoutGrid className="mr-2 h-3 w-3" />
              {layout.name}
            </Button>
          ))}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">
          Locked Layout • {TOTAL_ROWS} Rows
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full" ref={containerRef}>
        <ResponsiveGridLayout
          // @ts-ignore
          isBounded
          isResizable
          isDraggable
          width={width}
          compactType={null}
          maxRows={TOTAL_ROWS}
          rowHeight={rowHeight}
          onDragStop={onDragStop}
          onResize={handleResize}
          onLayoutChange={() => {}}
          onDragStart={onDragStart}
          preventCollision={false}
          margin={[MARGIN, MARGIN]}
          containerPadding={[0, 0]}
          onResizeStop={handleResize}
          layouts={responsiveLayouts}
          className="layout h-full w-full"
          cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
          resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        >
          {activeLayout.widgets.map((widget) => (
            <div key={widget.i} className="relative group">
              <Card className="h-full w-full overflow-hidden flex flex-col shadow-sm border-none rounded-none">
                {/* Header
                <div className="drag-handle flex items-center justify-between bg-muted/30 px-2 py-1 cursor-move select-none">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                    {widget.title}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-4 w-4">
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div> */}
                <div className="flex-1 overflow-auto">
                  <WidgetContent
                    type={widget.type}
                    initialMarketData={initialMarketData}
                    initialChartData={initialChartData}
                  />
                </div>
              </Card>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
