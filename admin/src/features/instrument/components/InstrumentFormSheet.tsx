import { InstrumentWithRelationships } from 'src/features/instrument/instrumentSchemas';
import { InstrumentForm } from 'src/features/instrument/components/InstrumentForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function InstrumentFormSheet({
  instrument,
  context,
  onCancel,
  onSuccess,
}: {
  instrument?: Partial<InstrumentWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (instrument: InstrumentWithRelationships) => void;
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
            {instrument?.id
              ? context.dictionary.instrument.edit.title
              : context.dictionary.instrument.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <InstrumentForm
            instrument={instrument}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
