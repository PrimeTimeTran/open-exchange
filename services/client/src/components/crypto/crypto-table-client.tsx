'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/shared/components/ui/table';
import { Sparkline } from '@/components/charts/sparkline';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { PriceUpdate } from 'src/proto/market/market';

export interface CryptoAssetData {
  symbol: string;
  priceData: PriceUpdate | null;
  history7d: number[];
  history1h: number[];
  meta: any;
}

interface CryptoTableClientProps {
  initialData: CryptoAssetData[];
}

type SortKey =
  | 'name'
  | 'price'
  | 'change1h'
  | 'change24h'
  | 'change7d'
  | 'marketCap'
  | 'volume'
  | 'supply';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

function formatCurrency(value: number | string | undefined, digits = 2) {
  if (value === undefined || value === null) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);
}

function formatPercentage(value: number | undefined) {
  if (value === undefined || value === null) return '-';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function formatCompact(value: number | undefined) {
  if (value === undefined || value === null) return '-';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export function CryptoTableClient({ initialData }: CryptoTableClientProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'marketCap',
    direction: 'desc',
  });

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'desc' }; // Default to desc for new sort
    });
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  const sortedData = [...initialData].sort((a, b) => {
    const aPrice = parseFloat(a.priceData?.price || '0');
    const bPrice = parseFloat(b.priceData?.price || '0');

    const aChange24h = a.priceData?.change24h || 0;
    const bChange24h = b.priceData?.change24h || 0;

    const aChange7d =
      a.history7d.length > 0
        ? ((a.history7d[a.history7d.length - 1] - a.history7d[0]) /
            a.history7d[0]) *
          100
        : 0;
    const bChange7d =
      b.history7d.length > 0
        ? ((b.history7d[b.history7d.length - 1] - b.history7d[0]) /
            b.history7d[0]) *
          100
        : 0;

    const aChange1h = (() => {
      if (a.history1h.length > 0) {
        const startPrice = a.history1h[0];
        const currentPrice = a.history1h[a.history1h.length - 1];
        if (startPrice !== 0) {
          return ((currentPrice - startPrice) / startPrice) * 100;
        }
      }
      return 0;
    })();

    const bChange1h = (() => {
      if (b.history1h.length > 0) {
        const startPrice = b.history1h[0];
        const currentPrice = b.history1h[b.history1h.length - 1];
        if (startPrice !== 0) {
          return ((currentPrice - startPrice) / startPrice) * 100;
        }
      }
      return 0;
    })();

    const aCirculatingSupply = a.meta?.circulatingSupply || 0;
    const bCirculatingSupply = b.meta?.circulatingSupply || 0;

    const aMarketCap = aPrice * aCirculatingSupply;
    const bMarketCap = bPrice * bCirculatingSupply;

    const aVolume = a.priceData?.volume24h || 0;
    const bVolume = b.priceData?.volume24h || 0;

    let comparison = 0;

    switch (sortConfig.key) {
      case 'name':
        comparison = (a.meta?.name || a.symbol).localeCompare(
          b.meta?.name || b.symbol,
        );
        break;
      case 'price':
        comparison = aPrice - bPrice;
        break;
      case 'change1h':
        comparison = aChange1h - bChange1h;
        break;
      case 'change24h':
        comparison = aChange24h - bChange24h;
        break;
      case 'change7d':
        comparison = aChange7d - bChange7d;
        break;
      case 'marketCap':
        comparison = aMarketCap - bMarketCap;
        break;
      case 'volume':
        comparison = aVolume - bVolume;
        break;
      case 'supply':
        comparison = aCirculatingSupply - bCirculatingSupply;
        break;
      default:
        comparison = 0;
    }

    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="rounded-xl border border-outline-variant bg-surface overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12.5">#</TableHead>
            <TableHead
              className="w-50 cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Name {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50 min-w-30"
              onClick={() => handleSort('price')}
            >
              <div className="flex items-center justify-end">
                Price {getSortIcon('price')}
              </div>
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50 min-w-25"
              onClick={() => handleSort('change1h')}
            >
              <div className="flex items-center justify-end">
                1h % {getSortIcon('change1h')}
              </div>
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50 min-w-25"
              onClick={() => handleSort('change24h')}
            >
              <div className="flex items-center justify-end">
                24h % {getSortIcon('change24h')}
              </div>
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50 min-w-25"
              onClick={() => handleSort('change7d')}
            >
              <div className="flex items-center justify-end">
                7d % {getSortIcon('change7d')}
              </div>
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('marketCap')}
            >
              <div className="flex items-center justify-end">
                Market Cap {getSortIcon('marketCap')}
              </div>
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('volume')}
            >
              <div className="flex items-center justify-end">
                Volume (24h) {getSortIcon('volume')}
              </div>
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('supply')}
            >
              <div className="flex items-center justify-end">
                Circulating Supply {getSortIcon('supply')}
              </div>
            </TableHead>
            <TableHead className="w-37.5">Last 7 Days</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => {
            const price = parseFloat(row.priceData?.price || '0');
            const change24h = row.priceData?.change24h;

            const change7d =
              row.history7d.length > 0
                ? ((row.history7d[row.history7d.length - 1] -
                    row.history7d[0]) /
                    row.history7d[0]) *
                  100
                : 0;

            let change1h = 0;
            if (row.history1h.length > 0) {
              const startPrice = row.history1h[0];
              const currentPrice = row.history1h[row.history1h.length - 1];
              if (startPrice !== 0) {
                change1h = ((currentPrice - startPrice) / startPrice) * 100;
              }
            }

            const circulatingSupply = row.meta?.circulatingSupply || 0;

            const marketCap = price * circulatingSupply;
            const volume = row.priceData?.volume24h;

            return (
              <TableRow
                key={row.symbol}
                className="group hover:bg-surface-variant/30"
              >
                <TableCell className="font-medium text-on-surface-variant">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                      {row.symbol[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface line-clamp-1">
                        {row.meta?.name || row.symbol}
                      </span>
                      <span className="text-xs text-on-surface-variant font-medium">
                        {row.symbol}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium text-on-surface">
                  {formatCurrency(price)}
                </TableCell>
                <TableCell
                  className={`text-right text-sm ${
                    change1h >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {formatPercentage(change1h)}
                </TableCell>
                <TableCell
                  className={`text-right text-sm ${
                    change24h && change24h >= 0
                      ? 'text-emerald-500'
                      : 'text-rose-500'
                  }`}
                >
                  {formatPercentage(change24h)}
                </TableCell>
                <TableCell
                  className={`text-right text-sm ${
                    change7d >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {formatPercentage(change7d)}
                </TableCell>
                <TableCell className="text-right text-on-surface font-medium">
                  {formatCompact(marketCap)}
                </TableCell>
                <TableCell className="text-right text-on-surface-variant">
                  {formatCompact(volume)}
                </TableCell>
                <TableCell className="text-right text-on-surface-variant text-sm">
                  {formatCompact(circulatingSupply)?.replace('$', '')}{' '}
                  {/* {row.symbol} */}
                </TableCell>
                <TableCell>
                  <div className="h-10 w-35">
                    <Sparkline
                      data={row.history7d}
                      width={140}
                      height={40}
                      color={change7d >= 0 ? '#10b981' : '#f43f5e'}
                      fill
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`assets/${row.symbol}_USD`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                    >
                      Trade
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
          {sortedData.length === 0 && (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center">
                No assets found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
