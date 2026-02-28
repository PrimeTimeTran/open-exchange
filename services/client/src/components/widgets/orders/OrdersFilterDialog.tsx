'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface OrdersFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

const ASSET_TYPES = ['All', 'Equities', 'Futures', 'Options', 'Crypto'];
const ORDER_TYPES = [
  'All',
  'Market',
  'Limit',
  'Stop market',
  'Stop limit',
  'Trailing stop',
];
const ORDER_STATUSES = ['Working', 'Filled', 'Canceled', 'Queued', 'Other'];

export function OrdersFilterDialog({
  isOpen,
  onClose,
  onApply,
}: OrdersFilterDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [assetType, setAssetType] = useState('Options');
  const [orderType, setOrderType] = useState('All');
  const [statuses, setStatuses] = useState<string[]>([
    'Working',
    'Filled',
    'Other',
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const toggleStatus = (status: string) => {
    setStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-10000 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-background/50 border border-zinc-700 rounded-lg shadow-xl w-80 font-sans text-white overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-sm font-bold">Filter</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-100 overflow-y-auto">
          {/* Asset Type */}
          <div>
            <h3 className="text-xs font-bold mb-2">Asset type</h3>
            <div className="flex flex-wrap gap-2">
              {ASSET_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setAssetType(type)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                    assetType === type
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500',
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Order Type */}
          <div>
            <h3 className="text-xs font-bold mb-2">Order type</h3>
            <div className="flex flex-wrap gap-2">
              {ORDER_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                    orderType === type
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500',
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Order Status */}
          <div>
            <h3 className="text-xs font-bold mb-2">Order status</h3>
            <div className="grid grid-cols-2 gap-2">
              {ORDER_STATUSES.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <div
                    className={cn(
                      'h-4 w-4 rounded border flex items-center justify-center cursor-pointer',
                      statuses.includes(status)
                        ? 'bg-white border-white text-black'
                        : 'bg-transparent border-zinc-500 text-transparent',
                    )}
                    onClick={() => toggleStatus(status)}
                  >
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm text-zinc-300">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 flex justify-between items-center bg-background/50">
          <button
            className="text-sm font-bold text-white hover:text-zinc-300"
            onClick={() => {
              setAssetType('All');
              setOrderType('All');
              setStatuses([]);
            }}
          >
            Reset
          </button>
          <Button
            size="sm"
            className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
