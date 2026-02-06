import { MessageWithRelationships } from 'src/features/message/messageSchemas';
import { MessageForm } from 'src/features/message/components/MessageForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function MessageFormSheet({
  message,
  context,
  onCancel,
  onSuccess,
}: {
  message?: Partial<MessageWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (message: MessageWithRelationships) => void;
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
            {message?.id
              ? context.dictionary.message.edit.title
              : context.dictionary.message.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <MessageForm
            message={message}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
