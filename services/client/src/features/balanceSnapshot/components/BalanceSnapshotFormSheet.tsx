import { BalanceSnapshotWithRelationships } from 'src/features/balanceSnapshot/balanceSnapshotSchemas';
import { BalanceSnapshotForm } from 'src/features/balanceSnapshot/components/BalanceSnapshotForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function BalanceSnapshotFormSheet({
  balanceSnapshot,
  context,
  onCancel,
  onSuccess,
}: {
  balanceSnapshot?: Partial<BalanceSnapshotWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (balanceSnapshot: BalanceSnapshotWithRelationships) => void;
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
            {balanceSnapshot?.id
              ? context.dictionary.balanceSnapshot.edit.title
              : context.dictionary.balanceSnapshot.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <BalanceSnapshotForm
            balanceSnapshot={balanceSnapshot}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
