import {
  Order,
  OrderStatus,
  OrderType,
  TimeInForce,
} from '@/proto/common/order';
import { IdWithCopy } from './IdWithCopy';

// Helpers for enums
const getStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.ORDER_STATUS_OPEN:
      return 'Open';
    case OrderStatus.ORDER_STATUS_PARTIALLY_FILLED:
      return 'Partial';
    case OrderStatus.ORDER_STATUS_FILLED:
      return 'Filled';
    case OrderStatus.ORDER_STATUS_CANCELLED:
      return 'Cancelled';
    case OrderStatus.ORDER_STATUS_REJECTED:
      return 'Rejected';
    default:
      return 'Unknown';
  }
};

const getStatusBadgeClass = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.ORDER_STATUS_OPEN:
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case OrderStatus.ORDER_STATUS_PARTIALLY_FILLED:
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case OrderStatus.ORDER_STATUS_FILLED:
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case OrderStatus.ORDER_STATUS_CANCELLED:
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case OrderStatus.ORDER_STATUS_REJECTED:
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

const getTypeLabel = (type: OrderType) => {
  switch (type) {
    case OrderType.ORDER_TYPE_LIMIT:
      return 'Limit';
    case OrderType.ORDER_TYPE_MARKET:
      return 'Market';
    default:
      return 'Unknown';
  }
};

const getTifLabel = (tif: TimeInForce) => {
  switch (tif) {
    case TimeInForce.TIME_IN_FORCE_GTC:
      return 'GTC';
    case TimeInForce.TIME_IN_FORCE_IOC:
      return 'IOC';
    case TimeInForce.TIME_IN_FORCE_FOK:
      return 'FOK';
    default:
      return '-';
  }
};

interface OrderTableProps {
  orders: Order[];
  title: string;
  baseDecimals: number;
  quoteDecimals: number;
  priceClass?: string;
}

export function OrderTable({
  orders,
  title,
  baseDecimals,
  quoteDecimals,
  priceClass,
}: OrderTableProps) {
  const unscaleQty = (val: string | undefined) => {
    if (!val) return '0';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return (num / Math.pow(10, baseDecimals)).toString();
  };

  const unscalePrice = (val: string | undefined) => {
    if (!val) return '0';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return (num / Math.pow(10, quoteDecimals - baseDecimals)).toString();
  };

  return (
    <div className="border border-border rounded shadow-sm bg-card text-card-foreground overflow-hidden">
      <h2 className="bg-muted/50 p-4 font-bold border-b border-border">
        {title}
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground font-medium">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-right">Price</th>
              <th className="px-4 py-2 text-right">Qty</th>
              <th className="px-4 py-2 text-right">Filled</th>
              <th className="px-4 py-2 text-right">Type</th>
              <th className="px-4 py-2 text-right">TIF</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-muted-foreground"
                >
                  No orders
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-2 align-middle">
                    <IdWithCopy id={order.id || ''} />
                  </td>
                  <td className="px-4 py-2 align-middle">
                    <span
                      className={`px-2 py-0.5 rounded text-xs border font-medium ${getStatusBadgeClass(
                        order.status || 0,
                      )}`}
                    >
                      {getStatusLabel(order.status || 0)}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-2 text-right font-mono align-middle ${priceClass}`}
                  >
                    {unscalePrice(order.price)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-muted-foreground align-middle">
                    {unscaleQty(order.quantity)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-muted-foreground align-middle">
                    {unscaleQty(order.quantityFilled)}
                  </td>

                  <td className="px-4 py-2 text-right text-muted-foreground text-xs align-middle">
                    {getTypeLabel(order.type || 0)}
                  </td>
                  <td className="px-4 py-2 text-right text-muted-foreground text-xs align-middle">
                    {getTifLabel(order.timeInForce || 0)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
