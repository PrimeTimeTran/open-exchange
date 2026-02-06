import { WithdrawalWithRelationships } from 'src/features/withdrawal/withdrawalSchemas';
import { WithdrawalForm } from 'src/features/withdrawal/components/WithdrawalForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function WithdrawalFormSheet({
  withdrawal,
  context,
  onCancel,
  onSuccess,
}: {
  withdrawal?: Partial<WithdrawalWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (withdrawal: WithdrawalWithRelationships) => void;
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
            {withdrawal?.id
              ? context.dictionary.withdrawal.edit.title
              : context.dictionary.withdrawal.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <WithdrawalForm
            withdrawal={withdrawal}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
