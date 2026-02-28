import React from 'react';
import {
  List,
  Pencil,
  Magnet,
  Settings,
  Maximize2,
  LayoutGrid,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChartHeaderProps {
  price: string;
  change: string;
  percentChange: string;
  isPositive: boolean;
  symbol?: string;
}

export function ChartHeader({
  price,
  change,
  percentChange,
  isPositive,
  symbol = 'PLTR',
}: ChartHeaderProps) {
  return (
    <div className="relative flex items-center justify-between px-3 py-2 border-border shrink-0 border-b border-white/10 bg-zinc-950">
      <div className="absolute inset-0 bg-background/50 pointer-events-none" />
      {/* Left Group */}
      <div className="relative flex items-center gap-4">
        <div className="text-lg font-medium text-foreground">{symbol}</div>
        <div className="flex flex-col">
          <span
            className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}
          >
            {price}
          </span>
          <span
            className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}
          >
            {isPositive ? '+' : '-'}
            {change} ({percentChange})
          </span>
        </div>
      </div>

      {/* Center Group - Icon Buttons */}
      <div className="relative flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Right Group - 4 icons */}
      <div className="relative flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Magnet className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
