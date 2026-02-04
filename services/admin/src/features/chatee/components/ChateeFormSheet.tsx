import { ChateeWithRelationships } from 'src/features/chatee/chateeSchemas';
import { ChateeForm } from 'src/features/chatee/components/ChateeForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function ChateeFormSheet({
  chatee,
  context,
  onCancel,
  onSuccess,
}: {
  chatee?: Partial<ChateeWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (chatee: ChateeWithRelationships) => void;
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
            {chatee?.id
              ? context.dictionary.chatee.edit.title
              : context.dictionary.chatee.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <ChateeForm
            chatee={chatee}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
