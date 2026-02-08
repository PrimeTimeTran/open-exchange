import { matchingEngineClient as client } from '@/services/MatchingEngineClient';
import { GetOrderBookResponse } from '@/proto/matching/engine';
import { Order } from '@/proto/common/order';

async function getOrderBook(
  instrumentId: string,
): Promise<GetOrderBookResponse> {
  // The client wrapper now provides a promise-based getOrderBook method
  return await client.getOrderBook({ instrumentId });
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const instrumentId = (searchParams.instrument_id as string) || 'BTC-USD';
  let orderBook: GetOrderBookResponse | null = null;
  let error: string | null = null;

  try {
    orderBook = await getOrderBook(instrumentId);
  } catch (e: any) {
    console.error('Failed to fetch order book:', e);
    error = e.message || 'Failed to fetch order book';
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Order Book: {instrumentId}</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form className="mb-8 flex gap-4">
        <input
          type="text"
          name="instrument_id"
          defaultValue={instrumentId}
          className="border p-2 rounded w-64 text-black"
          placeholder="Instrument ID (e.g. BTC-USD)"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Load
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* BIDS */}
        <div className="border rounded shadow-sm">
          <h2 className="bg-green-100 p-4 text-green-800 font-bold border-b">
            Bids (Buy)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Filled</th>
                  <th className="px-4 py-2 text-right">ID</th>
                </tr>
              </thead>
              <tbody>
                {orderBook?.bids?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No bids
                    </td>
                  </tr>
                ) : (
                  orderBook?.bids?.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-green-600">
                        {order.price}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-gray-500">
                        {order.quantity || '0'}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-gray-500">
                        {order.quantityFilled || '0'}
                      </td>
                      <td
                        className="px-4 py-2 text-right text-xs text-gray-400 font-mono truncate max-w-[100px]"
                        title={order.id}
                      >
                        {order.id}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ASKS */}
        <div className="border rounded shadow-sm">
          <h2 className="bg-red-100 p-4 text-red-800 font-bold border-b">
            Asks (Sell)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Filled</th>
                  <th className="px-4 py-2 text-right">ID</th>
                </tr>
              </thead>
              <tbody>
                {orderBook?.asks?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No asks
                    </td>
                  </tr>
                ) : (
                  orderBook?.asks?.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-red-600">
                        {order.price}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        {order.quantity}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-gray-500">
                        {order.quantityFilled || '0'}
                      </td>
                      <td
                        className="px-4 py-2 text-right text-xs text-gray-400 font-mono truncate max-w-[100px]"
                        title={order.id}
                      >
                        {order.id}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
