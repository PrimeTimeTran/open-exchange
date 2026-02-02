import { LedgerEntryWithRelationships } from 'src/features/ledgerEntry/ledgerEntrySchemas';
import { LedgerEntryForm } from 'src/features/ledgerEntry/components/LedgerEntryForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function LedgerEntryFormSheet({
  ledgerEntry,
  context,
  onCancel,
  onSuccess,
}: {
  ledgerEntry?: Partial<LedgerEntryWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (ledgerEntry: LedgerEntryWithRelationships) => void;
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
            {ledgerEntry?.id
              ? context.dictionary.ledgerEntry.edit.title
              : context.dictionary.ledgerEntry.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <LedgerEntryForm
            ledgerEntry={ledgerEntry}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
