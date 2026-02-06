import { CommentWithRelationships } from 'src/features/comment/commentSchemas';
import { CommentForm } from 'src/features/comment/components/CommentForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function CommentFormSheet({
  comment,
  context,
  onCancel,
  onSuccess,
}: {
  comment?: Partial<CommentWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (comment: CommentWithRelationships) => void;
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
            {comment?.id
              ? context.dictionary.comment.edit.title
              : context.dictionary.comment.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <CommentForm
            comment={comment}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
