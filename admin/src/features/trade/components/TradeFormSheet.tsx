import { TradeWithRelationships } from 'src/features/trade/tradeSchemas';
import { TradeForm } from 'src/features/trade/components/TradeForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function TradeFormSheet({
  trade,
  context,
  onCancel,
  onSuccess,
}: {
  trade?: Partial<TradeWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (trade: TradeWithRelationships) => void;
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
            {trade?.id
              ? context.dictionary.trade.edit.title
              : context.dictionary.trade.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <TradeForm
            trade={trade}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
