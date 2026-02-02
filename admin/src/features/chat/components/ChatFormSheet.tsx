import { ChatWithRelationships } from 'src/features/chat/chatSchemas';
import { ChatForm } from 'src/features/chat/components/ChatForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function ChatFormSheet({
  chat,
  context,
  onCancel,
  onSuccess,
}: {
  chat?: Partial<ChatWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (chat: ChatWithRelationships) => void;
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
            {chat?.id
              ? context.dictionary.chat.edit.title
              : context.dictionary.chat.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <ChatForm
            chat={chat}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
