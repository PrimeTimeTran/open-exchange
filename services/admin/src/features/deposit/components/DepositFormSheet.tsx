import { DepositWithRelationships } from 'src/features/deposit/depositSchemas';
import { DepositForm } from 'src/features/deposit/components/DepositForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function DepositFormSheet({
  deposit,
  context,
  onCancel,
  onSuccess,
}: {
  deposit?: Partial<DepositWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (deposit: DepositWithRelationships) => void;
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
            {deposit?.id
              ? context.dictionary.deposit.edit.title
              : context.dictionary.deposit.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <DepositForm
            deposit={deposit}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
