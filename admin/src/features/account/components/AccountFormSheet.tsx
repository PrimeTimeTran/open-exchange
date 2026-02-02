import { AccountWithRelationships } from 'src/features/account/accountSchemas';
import { AccountForm } from 'src/features/account/components/AccountForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function AccountFormSheet({
  account,
  context,
  onCancel,
  onSuccess,
}: {
  account?: Partial<AccountWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (account: AccountWithRelationships) => void;
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
            {account?.id
              ? context.dictionary.account.edit.title
              : context.dictionary.account.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <AccountForm
            account={account}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
