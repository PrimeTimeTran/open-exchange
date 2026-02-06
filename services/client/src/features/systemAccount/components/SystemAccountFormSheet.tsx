import { SystemAccountWithRelationships } from 'src/features/systemAccount/systemAccountSchemas';
import { SystemAccountForm } from 'src/features/systemAccount/components/SystemAccountForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function SystemAccountFormSheet({
  systemAccount,
  context,
  onCancel,
  onSuccess,
}: {
  systemAccount?: Partial<SystemAccountWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (systemAccount: SystemAccountWithRelationships) => void;
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
            {systemAccount?.id
              ? context.dictionary.systemAccount.edit.title
              : context.dictionary.systemAccount.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <SystemAccountForm
            systemAccount={systemAccount}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
