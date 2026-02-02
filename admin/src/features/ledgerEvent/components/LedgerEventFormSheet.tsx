import { LedgerEventWithRelationships } from 'src/features/ledgerEvent/ledgerEventSchemas';
import { LedgerEventForm } from 'src/features/ledgerEvent/components/LedgerEventForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function LedgerEventFormSheet({
  ledgerEvent,
  context,
  onCancel,
  onSuccess,
}: {
  ledgerEvent?: Partial<LedgerEventWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (ledgerEvent: LedgerEventWithRelationships) => void;
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
            {ledgerEvent?.id
              ? context.dictionary.ledgerEvent.edit.title
              : context.dictionary.ledgerEvent.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <LedgerEventForm
            ledgerEvent={ledgerEvent}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
