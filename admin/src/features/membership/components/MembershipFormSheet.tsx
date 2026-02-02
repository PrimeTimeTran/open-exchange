import { Membership } from '@prisma/client';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';
import { MembershipEditForm } from 'src/features/membership/components/MembershipEditForm';
import { MembershipNewForm } from 'src/features/membership/components/MembershipNewForm';

export function MembershipFormSheet({
  membership,
  context,
  onCancel,
  onSuccess,
}: {
  membership?: Partial<Membership>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (membership: Membership) => void;
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
            {membership?.id
              ? context.dictionary.membership.edit.title
              : context.dictionary.membership.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          {membership?.id ? (
            <MembershipEditForm
              membership={membership}
              context={context}
              onCancel={onCancel}
              onSuccess={onSuccess}
            />
          ) : (
            <MembershipNewForm
              membership={membership}
              context={context}
              onCancel={onCancel}
              onSuccess={onSuccess}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
