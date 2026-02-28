'use client';

import React from 'react';
import {
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts';

interface PriceChartProps {
  data: any[];
  color: string;
  timeRange: string;
  onHover?: (data: any | null) => void;
}

const CandlestickShape = (props: any) => {
  // Deprecated: using native Bar implementation
  return null;
};

export function PriceChart({
  data,
  color,
  timeRange,
  onHover,
}: PriceChartProps) {
  const [tooltipPos, setTooltipPos] = React.useState<
    { x: number; y: number } | undefined
  >(undefined);

  // Zoom state
  const [zoomState, setZoomState] = React.useState<{
    startIndex: number;
    endIndex: number;
    yMin: number;
    yMax: number;
  } | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const zoomStateRef = React.useRef(zoomState);
  const dataRef = React.useRef(data);

  React.useEffect(() => {
    zoomStateRef.current = zoomState;
  }, [zoomState]);

  React.useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Initialize or reset zoom when data changes significantly
  React.useEffect(() => {
    if (!data || data.length === 0) return;

    // Calculate Y domain from full data
    const allValues = data.flatMap((d) =>
      [d.low, d.high].filter((v) => v !== undefined),
    );
    if (allValues.length === 0) return;

    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const padding = (maxVal - minVal) * 0.1; // 10% padding

    // Reset zoom state to show full range
    setZoomState({
      startIndex: 0,
      endIndex: data.length - 1,
      yMin: minVal - padding,
      yMax: maxVal + padding,
    });
  }, [data.length, timeRange]); // Reset on length change or timeRange change

  // Attach non-passive wheel listener to prevent page scroll
  React.useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault(); // Stop page scroll

      const currentZoom = zoomStateRef.current;
      const currentData = dataRef.current;

      if (!currentZoom || !currentData.length) return;

      const { left, width } = element.getBoundingClientRect();
      const isRightSide = e.clientX > left + width - 60; // 50px Y-axis width + margin

      if (isRightSide) {
        // Zoom Y Axis (Price)
        const delta = e.deltaY;
        const range = currentZoom.yMax - currentZoom.yMin;
        const zoomFactor = 0.1;
        const change = range * zoomFactor * (delta > 0 ? 1 : -1);

        const mid = (currentZoom.yMax + currentZoom.yMin) / 2;
        const newRange = Math.max(range + change, range * 0.01);

        setZoomState({
          ...currentZoom,
          yMin: mid - newRange / 2,
          yMax: mid + newRange / 2,
        });
      } else {
        // Zoom X Axis (Time)
        const delta = e.deltaY;
        const currentCount = currentZoom.endIndex - currentZoom.startIndex + 1;
        const zoomFactor = 0.1;

        const change =
          Math.max(1, Math.floor(currentCount * zoomFactor)) *
          (delta > 0 ? 1 : -1);

        let newStart = currentZoom.startIndex - change;

        if (newStart < 0) newStart = 0;
        if (newStart > currentZoom.endIndex - 5)
          newStart = currentZoom.endIndex - 5;

        setZoomState({
          ...currentZoom,
          startIndex: newStart,
        });
      }
    };

    element.addEventListener('wheel', handleWheelNative, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheelNative);
    };
  }, []); // Only bind once

  const visibleData = React.useMemo(() => {
    if (!zoomState || !data.length) return data;
    return data.slice(zoomState.startIndex, zoomState.endIndex + 1);
  }, [data, zoomState]);

  const yDomain = React.useMemo(() => {
    if (zoomState) return [zoomState.yMin, zoomState.yMax];
    // Fallback
    const allValues = data.flatMap((d) =>
      [d.low, d.high].filter((v) => v !== undefined),
    );
    if (!allValues.length) return ['auto', 'auto'];
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [zoomState, data]);

  const formatLabel = (label: string | number) => {
    if (typeof label === 'number') {
      const date = new Date(label);
      if (timeRange === '1D') {
        return date.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        });
      }
      if (timeRange === '1W') {
        return date.toLocaleString([], { weekday: 'short', hour: 'numeric' });
      }
      if (timeRange === '1Y') {
        return date.toLocaleDateString([], {
          month: '2-digit',
          year: '2-digit',
        });
      }
      if (timeRange === 'ALL') {
        return date.toLocaleDateString([], {
          year: 'numeric',
        });
      }
      return date.toLocaleDateString();
    }
    return label;
  };

  const [hoveredDate, setHoveredDate] = React.useState<number | null>(null);

  return (
    <div
      ref={containerRef}
      className="h-full w-full -ml-2 select-none relative group"
    >
      {hoveredDate && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-zinc-900 text-zinc-300 text-[10px] px-2 py-1 rounded z-20 pointer-events-none border border-zinc-800 shadow-md font-mono tracking-tight">
          {new Date(hoveredDate).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: '2-digit',
          })}
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={visibleData}
          barGap={-3.5}
          onMouseMove={(state) => {
            if (state.activeCoordinate) {
              setTooltipPos({ x: state.activeCoordinate.x, y: -20 });
            }
            if (state.activePayload && state.activePayload.length > 0) {
              const payload = state.activePayload[0].payload;
              if (onHover) onHover(payload);
              setHoveredDate(payload.time);
            }
          }}
          onMouseLeave={() => {
            setTooltipPos(undefined);
            if (onHover) onHover(null);
            setHoveredDate(null);
          }}
        >
          <XAxis
            dataKey="time"
            tickFormatter={formatLabel}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            minTickGap={30}
          />
          <YAxis
            orientation="right"
            domain={yDomain}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            width={50}
            type="number"
            allowDataOverflow={true} // Crucial for custom zoom domain
          />
          <Tooltip
            content={() => null}
            cursor={{
              strokeDasharray: '3 3',
              stroke: 'hsl(var(--muted-foreground))',
            }}
          />

          {/* Wick Bar - thinner */}
          <Bar
            dataKey={(d) => [d.low, d.high]}
            barSize={1}
            isAnimationActive={false}
          >
            {visibleData.map((entry, index) => (
              <Cell
                key={`wick-${index}`}
                fill={entry.close > entry.open ? '#22c55e' : '#ef4444'}
              />
            ))}
          </Bar>

          {/* Body Bar - thicker */}
          <Bar
            dataKey={(d) => [d.open, d.close]}
            barSize={6}
            isAnimationActive={false}
            minPointSize={1}
          >
            {visibleData.map((entry, index) => (
              <Cell
                key={`body-${index}`}
                fill={entry.close > entry.open ? '#22c55e' : '#ef4444'}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
