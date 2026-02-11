import { prisma } from '@/prisma';
import { matchingClient } from '@/services/MatchingClient';
import { GetOrderBookResponse } from '@/proto/matching/engine';
import { OrderTable } from './components/OrderTable';
import { Button } from '@/components/ui/button';

async function getInstrumentWithAssets(instrumentId: string) {
  const isUuid =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      instrumentId,
    );

  let instrument = null;

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

function formatAtomic(
  value: string | undefined | null,
  decimals: number,
): string {
  if (!value) return '0';
  const floatVal = parseFloat(value);
  if (isNaN(floatVal)) return value;
  return (floatVal / Math.pow(10, decimals)).toString();
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
      <h1 className="text-2xl font-bold mb-6">
        Order Book: {instrument?.symbol || instrumentIdParam}
      </h1>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form className="mb-8 flex gap-4">
        <select
          name="instrument_id"
          defaultValue={instrumentIdParam}
          className="border border-input bg-background p-2 rounded w-64 text-foreground"
        >
          {instruments.length > 0 ? (
            instruments.map((i) => (
              <option key={i.id} value={i.symbol}>
                {i.symbol.replace(/_/g, '-')}
              </option>
            ))
          ) : (
            <>
              <option value="BTC-USD">BTC-USD</option>
              <option value="ETH-USD">ETH-USD</option>
              <option value="AAPL-USD">AAPL-USD</option>
            </>
          )}
        </select>
        <Button variant="primary">Load</Button>
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
