import { MarketMakerWithRelationships } from 'src/features/marketMaker/marketMakerSchemas';
import { MarketMakerForm } from 'src/features/marketMaker/components/MarketMakerForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function MarketMakerFormSheet({
  marketMaker,
  context,
  onCancel,
  onSuccess,
}: {
  marketMaker?: Partial<MarketMakerWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (marketMaker: MarketMakerWithRelationships) => void;
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
            {marketMaker?.id
              ? context.dictionary.marketMaker.edit.title
              : context.dictionary.marketMaker.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <MarketMakerForm
            marketMaker={marketMaker}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
