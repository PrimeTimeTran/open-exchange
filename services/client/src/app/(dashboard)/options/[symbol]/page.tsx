'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui';

// Mock Data for Options Chain
const EXPIRATIONS = [
  'Jan 19, 2024',
  'Jan 26, 2024',
  'Feb 02, 2024',
  'Feb 09, 2024',
  'Feb 16, 2024',
];

const STRIKES = [470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480];

const generateOptionData = (strike: number, type: 'call' | 'put') => {
  const isCall = type === 'call';
  // Mock pricing relative to a fake spot of 475
  const spot = 475;
  const dist = isCall ? spot - strike : strike - spot;
  const intrinsic = Math.max(0, dist);
  const timeValue = Math.random() * 2;
  const price = intrinsic + timeValue;

  return {
    last: price.toFixed(2),
    change: (Math.random() * 2 - 1).toFixed(2),
    bid: (price - 0.05).toFixed(2),
    ask: (price + 0.05).toFixed(2),
    vol: Math.floor(Math.random() * 5000),
    oi: Math.floor(Math.random() * 10000),
    itm: intrinsic > 0,
  };
};

const OPTIONS_CHAIN = STRIKES.map((strike) => ({
  strike,
  call: generateOptionData(strike, 'call'),
  put: generateOptionData(strike, 'put'),
}));

export default function OptionsPage({
  params,
}: {
  params: { symbol: string };
}) {
  const [selectedExpiration, setSelectedExpiration] = useState(EXPIRATIONS[0]);
  const symbol = params.symbol.toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/home"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              {symbol} Options
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Underlying: ${475.23}</span>
              <span className="text-green-500 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +1.2%
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Analyze</Button>
            <Button>Trade</Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-4">
          {EXPIRATIONS.map((exp) => (
            <button
              key={exp}
              onClick={() => setSelectedExpiration(exp)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedExpiration === exp
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {exp}
            </button>
          ))}
        </div>

        {/* Options Chain Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th
                    colSpan={6}
                    className="text-center py-3 border-r border-border"
                  >
                    Calls
                  </th>
                  <th className="text-center py-3 w-24 bg-muted/80">Strike</th>
                  <th
                    colSpan={6}
                    className="text-center py-3 border-l border-border"
                  >
                    Puts
                  </th>
                </tr>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-right">Last</th>
                  <th className="px-4 py-2 text-right">Chg</th>
                  <th className="px-4 py-2 text-right">Bid</th>
                  <th className="px-4 py-2 text-right">Ask</th>
                  <th className="px-4 py-2 text-right">Vol</th>
                  <th className="px-4 py-2 text-right border-r border-border">
                    OI
                  </th>

                  <th className="px-4 py-2 text-center bg-muted/80"></th>

                  <th className="px-4 py-2 text-right border-l border-border">
                    Last
                  </th>
                  <th className="px-4 py-2 text-right">Chg</th>
                  <th className="px-4 py-2 text-right">Bid</th>
                  <th className="px-4 py-2 text-right">Ask</th>
                  <th className="px-4 py-2 text-right">Vol</th>
                  <th className="px-4 py-2 text-right">OI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {OPTIONS_CHAIN.map((row) => (
                  <tr
                    key={row.strike}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Calls */}
                    <td
                      className={`px-4 py-3 text-right font-medium ${
                        row.call.itm ? 'bg-primary/5' : ''
                      }`}
                    >
                      {row.call.last}
                    </td>
                    <td
                      className={`px-4 py-3 text-right ${
                        parseFloat(row.call.change) >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      } ${row.call.itm ? 'bg-primary/5' : ''}`}
                    >
                      {parseFloat(row.call.change) > 0 ? '+' : ''}
                      {row.call.change}
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-muted-foreground ${
                        row.call.itm ? 'bg-primary/5' : ''
                      }`}
                    >
                      {row.call.bid}
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-muted-foreground ${
                        row.call.itm ? 'bg-primary/5' : ''
                      }`}
                    >
                      {row.call.ask}
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-muted-foreground ${
                        row.call.itm ? 'bg-primary/5' : ''
                      }`}
                    >
                      {row.call.vol}
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-muted-foreground border-r border-border ${
                        row.call.itm ? 'bg-primary/5' : ''
                      }`}
                    >
                      {row.call.oi}
                    </td>

                    {/* Strike */}
                    <td className="px-4 py-3 text-center font-bold bg-muted/30">
                      {row.strike.toFixed(1)}
                    </td>

                    {/* Puts */}
                    <td
                      className={`px-4 py-3 text-right font-medium border-l border-border ${
                        row.put.itm ? 'bg-primary/5' : ''
                      }`}
                    >
                      {row.put.last}
                    </td>
                    <td
                      className={`px-4 py-3 text-right ${
                        parseFloat(row.put.change) >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      } ${row.put.itm ? 'bg-primary/5' : ''}`}
                    >
                      {parseFloat(row.put.change) > 0 ? '+' : ''}
                      {row.put.change}
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-muted-foreground ${
                        row.put.itm ? 'bg-primary/5' : ''
                      }`}
                    >
                      {row.put.bid}
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-muted-foreground ${
                        row.put.itm ? 'bg-primary/5' : ''
                      }`}
                    >
                      {row.put.ask}
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-muted-foreground ${
                        row.put.itm ? 'bg-primary/5' : ''
                      }`}
                    >
                      {row.put.vol}
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-muted-foreground ${
                        row.put.itm ? 'bg-primary/5' : ''
                      }`}
                    >
                      {row.put.oi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
