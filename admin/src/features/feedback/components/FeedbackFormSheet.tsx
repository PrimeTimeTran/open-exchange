import { FeedbackWithRelationships } from 'src/features/feedback/feedbackSchemas';
import { FeedbackForm } from 'src/features/feedback/components/FeedbackForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function FeedbackFormSheet({
  feedback,
  context,
  onCancel,
  onSuccess,
}: {
  feedback?: Partial<FeedbackWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (feedback: FeedbackWithRelationships) => void;
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
            {feedback?.id
              ? context.dictionary.feedback.edit.title
              : context.dictionary.feedback.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <FeedbackForm
            feedback={feedback}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
