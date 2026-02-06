import { UserNotificationWithRelationships } from 'src/features/userNotification/userNotificationSchemas';
import { UserNotificationForm } from 'src/features/userNotification/components/UserNotificationForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function UserNotificationFormSheet({
  userNotification,
  context,
  onCancel,
  onSuccess,
}: {
  userNotification?: Partial<UserNotificationWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (userNotification: UserNotificationWithRelationships) => void;
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
            {userNotification?.id
              ? context.dictionary.userNotification.edit.title
              : context.dictionary.userNotification.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <UserNotificationForm
            userNotification={userNotification}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
