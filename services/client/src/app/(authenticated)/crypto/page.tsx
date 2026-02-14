import React from 'react';
import { cookies } from 'next/headers';
import { appContextForReact } from 'src/shared/controller/appContext';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function CryptoPage() {
  const context = await appContextForReact(cookies());

  if (!context.currentTenant) {
    return null;
  }

  const prisma = prismaDangerouslyBypassAuth(context);

  const assets = await prisma.asset.findMany({
    where: {
      tenantId: context.currentTenant.id,
      klass: 'crypto',
    },
    orderBy: {
      symbol: 'asc',
    },
  });

  return (
    <div className="container mx-auto max-w-5xl py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">
          Crypto Market
        </h1>
        <p className="text-on-surface-variant">
          Explore and trade cryptocurrencies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="rounded-xl border border-outline-variant bg-surface p-6 shadow-sm hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container">
                  {asset.symbol[0]}
                </div>
                <div>
                  <div className="font-semibold text-on-surface">
                    {asset.name}
                  </div>
                  <div className="text-sm text-on-surface-variant">
                    {asset.symbol}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
                 <Link href={`/trade/${asset.symbol}_USD`}>
                    <Button variant="secondary" size="sm">Trade</Button>
                 </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
