import { TradeFillWithRelationships } from 'src/features/tradeFill/tradeFillSchemas';
import { TradeFillForm } from 'src/features/tradeFill/components/TradeFillForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function TradeFillFormSheet({
  tradeFill,
  context,
  onCancel,
  onSuccess,
}: {
  tradeFill?: Partial<TradeFillWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (tradeFill: TradeFillWithRelationships) => void;
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
            {tradeFill?.id
              ? context.dictionary.tradeFill.edit.title
              : context.dictionary.tradeFill.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <TradeFillForm
            tradeFill={tradeFill}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
