'use client';

import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { createPortal } from 'react-dom';
import {
  X,
  Plus,
  Minus,
  ChevronDown,
  GripVertical,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useOrderCalculations } from '@/shared/hooks/useOrderCalculations';

export interface OptionLeg {
  id: string;
  price: number;
  expiry: string;
  strike: number;
  quantity: number;
  type: 'call' | 'put';
  side: 'buy' | 'sell';
}

interface OrderPanelProps {
  isOpen: boolean;
  legs: OptionLeg[];
  onClose: () => void;
  onRemoveLeg: (id: string) => void;
  onUpdateLeg: (id: string, updates: Partial<OptionLeg>) => void;
}

export function OrderPanel({
  legs,
  isOpen,
  onClose,
  onRemoveLeg,
}: OrderPanelProps) {
  const [mounted, setMounted] = useState(false);

  const { quantity, setQuantity, limitPrice, setLimitPrice, calculations } =
    useOrderCalculations(legs);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const symbol = 'PLTR';

  const { isCredit, maxProfit, maxLoss, strategyName } = calculations;

  const panelWidth = 320;
  const initialX =
    typeof window !== 'undefined' && window.innerWidth > 600
      ? window.innerWidth - panelWidth - 200
      : 20;

  return createPortal(
    <Draggable
      handle=".ticket-drag-handle"
      bounds="body"
      defaultPosition={{ x: initialX, y: 300 }}
    >
      <div
        className="fixed top-0 left-0 w-80 bg-background border border-white/10 shadow-2xl rounded-lg flex flex-col overflow-hidden font-sans text-foreground text-xs"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ margin: 0 }}
      >
        {/* Header */}
        <div className="ticket-drag-handle px-3 py-2 flex items-center justify-between cursor-move bg-card">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-sm">
                {symbol} {strategyName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center text-[10px] text-muted-foreground hover:text-foreground">
              1:1 ratio <ChevronDown className="h-3 w-3 ml-1" />
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Legs List */}
        <div className="flex flex-col px-3 pb-2 bg-card">
          {legs.length === 0 && (
            <div className="text-center text-muted-foreground py-3 border border-dashed border-white/10 rounded">
              Select options to build your strategy
            </div>
          )}

          {legs.map((leg) => {
            // Parse date "Fri Mar 6" -> "3/6" for display
            const parts = leg.expiry.split(' ');
            const shortDate = parts.length >= 3 ? `3/${parts[2]}` : leg.expiry; // Hacky parser for demo

            return (
              <div
                key={leg.id}
                className="flex items-center justify-between py-1.5 border-b border-white/10 last:border-0"
              >
                <div>
                  <div className="text-xs font-medium">
                    {shortDate} ${leg.strike}{' '}
                    {leg.type === 'call' ? 'Call' : 'Put'}
                  </div>
                  <div
                    className={cn(
                      'text-[10px] font-medium',
                      leg.side === 'sell'
                        ? 'text-orange-500'
                        : 'text-green-500',
                    )}
                  >
                    {leg.side === 'sell' ? 'Sell to open' : 'Buy to open'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs">
                    ${leg.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => onRemoveLeg(leg.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="px-3 py-2 space-y-2 bg-card">
          {/* Quantity */}
          <div className="flex items-center justify-between">
            <span className="text-xs">Quantity</span>
            <div className="flex items-center bg-muted rounded w-28 h-7">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="bg-transparent border-none text-foreground text-xs w-full px-2 focus:outline-none"
              />
              <div className="flex flex-col border-l border-white/10 h-full">
                <button
                  className="px-1 hover:bg-muted-foreground/20 h-3.5 flex items-center justify-center"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus className="h-2 w-2" />
                </button>
                <button
                  className="px-1 hover:bg-muted-foreground/20 h-3.5 flex items-center justify-center border-t border-white/10"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-2 w-2" />
                </button>
              </div>
            </div>
          </div>

          {/* Limit Price */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs">
                Limit price ({isCredit ? 'credit' : 'debit'})
              </span>
              <span className="text-[9px] text-muted-foreground">
                Bid $5.67 • Mark $9.95
              </span>
            </div>
            <div className="flex items-center bg-muted rounded w-28 h-7">
              <span className="pl-2 text-xs text-muted-foreground">$</span>
              <input
                type="number"
                value={limitPrice}
                onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                className="bg-transparent border-none text-foreground text-xs w-full pr-1 focus:outline-none"
              />
              <div className="flex flex-col border-l border-white/10 h-full">
                <button
                  className="px-1 hover:bg-muted-foreground/20 h-3.5 flex items-center justify-center"
                  onClick={() =>
                    setLimitPrice((p) => parseFloat((p + 0.05).toFixed(2)))
                  }
                >
                  <Plus className="h-2 w-2" />
                </button>
                <button
                  className="px-1 hover:bg-muted-foreground/20 h-3.5 flex items-center justify-center border-t border-white/10"
                  onClick={() =>
                    setLimitPrice((p) => parseFloat((p - 0.05).toFixed(2)))
                  }
                >
                  <Minus className="h-2 w-2" />
                </button>
              </div>
            </div>
          </div>

          {/* Time in Force */}
          <div className="flex items-center justify-between">
            <span className="text-xs">Time in force</span>
            <div className="flex items-center justify-between bg-muted rounded w-28 px-2 py-1 cursor-pointer hover:bg-muted-foreground/20 h-7">
              <span className="text-xs">Good for day</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Risk Profile */}
        <div className="px-3 py-2 bg-card">
          <div className="bg-muted/50 rounded-md p-2 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[10px] text-muted-foreground mb-0.5">
                Max profit
              </div>
              <div className="font-medium text-xs">
                $
                {typeof maxProfit === 'number'
                  ? maxProfit.toFixed(2)
                  : maxProfit}
              </div>
            </div>
            <div className="border-l border-white/10">
              <div className="text-[10px] text-muted-foreground mb-0.5">
                Max loss
              </div>
              <div className="font-medium text-xs">
                -$
                {typeof maxLoss === 'number'
                  ? Math.abs(maxLoss).toFixed(2)
                  : '5.00'}
              </div>
            </div>
            <div className="border-l border-white/10">
              <div className="text-[10px] text-muted-foreground mb-0.5">
                Breakeven
              </div>
              <div className="font-medium text-xs">
                ${calculations.breakeven.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="px-3 pb-3 space-y-1 bg-card">
          <div className="flex justify-between items-center text-xs font-medium">
            <span>Collateral required</span>
            <span>${calculations.collateral.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-1">
            <span className="font-bold text-xs">
              Estimated {isCredit ? 'credit' : 'debit'}
            </span>
            <span className="text-sm font-bold">
              ${Math.abs(calculations.totalCost).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>
              ${calculations.buyingPower.toLocaleString()} buying power
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>
              ${calculations.regulatoryFee.toFixed(2)} est regulatory fee
            </span>
          </div>
          <div className="pt-1">
            <a
              href="#"
              className="text-[10px] text-muted-foreground underline flex items-center gap-1 hover:text-foreground"
            >
              Max profit & loss disclosures <ArrowUpRight className="h-2 w-2" />
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 pt-0 grid grid-cols-[1fr_2fr] gap-2 bg-card">
          <Button
            variant="secondary"
            className="bg-muted text-foreground hover:bg-muted/80 border-none h-7 text-xs"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button className="bg-[#ff5500] hover:bg-[#e04d00] text-white border-none font-bold h-7 text-xs">
            Submit
          </Button>
        </div>
      </div>
    </Draggable>,
    document.body,
  );
}
