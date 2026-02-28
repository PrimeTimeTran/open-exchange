'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PositionsFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

const ASSET_TYPES = ['All', 'Equities', 'Options', 'Crypto', 'Futures'];
const DTE_RANGES = ['All', '≤ 1D', '≤ 7D', '≤ 10D', '≤ 30D'];

export function PositionsFilterDialog({
  isOpen,
  onClose,
  onApply,
}: PositionsFilterDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [assetType, setAssetType] = useState('All');
  const [dteRange, setDteRange] = useState('All');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

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

        <div className="p-4 space-y-4">
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

          {/* Days to expiration */}
          <div>
            <h3 className="text-xs font-bold mb-2">Days to expiration</h3>
            <div className="flex flex-wrap gap-2">
              {DTE_RANGES.map((range) => (
                <button
                  key={range}
                  onClick={() => setDteRange(range)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                    dteRange === range
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500',
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 flex justify-between items-center bg-background/50">
          <button
            className="text-sm font-bold text-white hover:text-zinc-300"
            onClick={() => {
              setAssetType('All');
              setDteRange('All');
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
