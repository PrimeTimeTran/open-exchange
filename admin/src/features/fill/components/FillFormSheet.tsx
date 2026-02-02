import { FillWithRelationships } from 'src/features/fill/fillSchemas';
import { FillForm } from 'src/features/fill/components/FillForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function FillFormSheet({
  fill,
  context,
  onCancel,
  onSuccess,
}: {
  fill?: Partial<FillWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (fill: FillWithRelationships) => void;
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
            {fill?.id
              ? context.dictionary.fill.edit.title
              : context.dictionary.fill.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <FillForm
            fill={fill}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
