import { ReferralWithRelationships } from 'src/features/referral/referralSchemas';
import { ReferralForm } from 'src/features/referral/components/ReferralForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function ReferralFormSheet({
  referral,
  context,
  onCancel,
  onSuccess,
}: {
  referral?: Partial<ReferralWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (referral: ReferralWithRelationships) => void;
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
            {referral?.id
              ? context.dictionary.referral.edit.title
              : context.dictionary.referral.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <ReferralForm
            referral={referral}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
