import { NotificationWithRelationships } from 'src/features/notification/notificationSchemas';
import { NotificationForm } from 'src/features/notification/components/NotificationForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function NotificationFormSheet({
  notification,
  context,
  onCancel,
  onSuccess,
}: {
  notification?: Partial<NotificationWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (notification: NotificationWithRelationships) => void;
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
            {notification?.id
              ? context.dictionary.notification.edit.title
              : context.dictionary.notification.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <NotificationForm
            notification={notification}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
