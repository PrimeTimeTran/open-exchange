import { prisma } from '@/prisma';
import { InstrumentWithRelationships } from '@/features/instrument/instrumentSchemas';
import { matchingClient } from '@/services/MatchingClient';
import { GetOrderBookResponse } from '@/proto/matching/engine';
import { OrderTable } from './components/OrderTable';
import { InstrumentSelect } from './components/InstrumentSelect';
import { Button } from '@/components/ui/button';

async function getInstrumentWithAssets(instrumentId: string) {
  const isUuid =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      instrumentId,
    );

  let instrument: InstrumentWithRelationships | null = null;

  if (isUuid) {
    instrument = await prisma.instrument.findUnique({
      where: { id: instrumentId },
      include: {
        underlyingAsset: true,
        quoteAsset: true,
      },
    });
  } else {
    // Try by symbol
    instrument = await prisma.instrument.findFirst({
      where: { symbol: instrumentId },
      include: {
        underlyingAsset: true,
        quoteAsset: true,
      },
    });

    if (!instrument) {
      // Try with underscore
      const underscoreSymbol = instrumentId.replace(/-/g, '_');
      instrument = await prisma.instrument.findFirst({
        where: { symbol: underscoreSymbol },
        include: {
          underlyingAsset: true,
          quoteAsset: true,
        },
      });
    }
  }
  return instrument;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const instrumentIdParam = (searchParams.instrument_id as string) || 'BTC-USD';
  let orderBook: GetOrderBookResponse | null = null;
  let error: string | null = null;

  // 1. Fetch Instrument Details (with assets for decimals)
  const instrument = await getInstrumentWithAssets(instrumentIdParam);
  const targetInstrumentId = instrument?.id || instrumentIdParam;

  // Decimals
  const baseDecimals = instrument?.underlyingAsset?.decimals || 8; // Default to 8 (BTC) if unknown
  const quoteDecimals = instrument?.quoteAsset?.decimals || 2; // Default to 2 (USD) if unknown
  const priceDecimals = quoteDecimals - baseDecimals; // For price unscaling

  // Fetch all available instruments for the dropdown
  const instruments = await prisma.instrument.findMany({
    where: {
      archivedAt: null,
      status: 'active',
    },
    orderBy: {
      symbol: 'asc',
    },
  });

  try {
    // 2. Fetch Order Book
    orderBook = await matchingClient.getOrderBook({
      instrumentId: targetInstrumentId,
    });
  } catch (e: any) {
    console.error('Failed to fetch order book:', e);
    error = e.message || 'Failed to fetch order book';
  }

  return (
    <div className="p-8 bg-background min-h-screen text-foreground">
      <h1 className="text-2xl font-bold mb-6">Order Book</h1>
      <h2 className="text-2xl font-bold mb-6">
        InstrumentID: {instrument?.id || instrumentIdParam}
      </h2>
      <h2 className="text-2xl font-bold mb-6">
        InstrumentSYM: {instrument?.symbol || instrumentIdParam}
      </h2>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form className="mb-8 flex gap-4">
        <InstrumentSelect
          instruments={instruments.map((i) => ({
            id: i.id,
            symbol: i.symbol,
          }))}
          defaultValue={instrumentIdParam}
        />
        <noscript>
          <Button variant="primary">Load</Button>
        </noscript>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <OrderTable
          title="Bids (Buy)"
          orders={orderBook?.bids || []}
          baseDecimals={baseDecimals}
          quoteDecimals={quoteDecimals}
          priceClass="text-green-600"
        />
        <OrderTable
          title="Asks (Sell)"
          orders={orderBook?.asks || []}
          baseDecimals={baseDecimals}
          quoteDecimals={quoteDecimals}
          priceClass="text-destructive"
        />
      </div>
    </div>
  );
}
