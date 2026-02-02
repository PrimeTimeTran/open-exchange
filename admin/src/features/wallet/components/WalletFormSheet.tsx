import { WalletWithRelationships } from 'src/features/wallet/walletSchemas';
import { WalletForm } from 'src/features/wallet/components/WalletForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function WalletFormSheet({
  wallet,
  context,
  onCancel,
  onSuccess,
}: {
  wallet?: Partial<WalletWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (wallet: WalletWithRelationships) => void;
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
            {wallet?.id
              ? context.dictionary.wallet.edit.title
              : context.dictionary.wallet.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <WalletForm
            wallet={wallet}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
