import { FeeScheduleWithRelationships } from 'src/features/feeSchedule/feeScheduleSchemas';
import { FeeScheduleForm } from 'src/features/feeSchedule/components/FeeScheduleForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function FeeScheduleFormSheet({
  feeSchedule,
  context,
  onCancel,
  onSuccess,
}: {
  feeSchedule?: Partial<FeeScheduleWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (feeSchedule: FeeScheduleWithRelationships) => void;
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
            {feeSchedule?.id
              ? context.dictionary.feeSchedule.edit.title
              : context.dictionary.feeSchedule.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <FeeScheduleForm
            feeSchedule={feeSchedule}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
