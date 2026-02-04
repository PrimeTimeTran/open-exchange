import { OrderWithRelationships } from 'src/features/order/orderSchemas';
import { OrderForm } from 'src/features/order/components/OrderForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function OrderFormSheet({
  order,
  context,
  onCancel,
  onSuccess,
}: {
  order?: Partial<OrderWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (order: OrderWithRelationships) => void;
}) {
  return (
    <Sheet
      open={true}
      onOpenChange={(open) => (!open ? onCancel() : null)}
      modal={true}
    >
      <SheetContent className="overflow-y-scroll sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {order?.id
              ? context.dictionary.order.edit.title
              : context.dictionary.order.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <OrderForm
            order={order}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
