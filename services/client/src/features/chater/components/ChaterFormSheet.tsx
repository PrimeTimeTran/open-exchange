import { ChaterWithRelationships } from 'src/features/chater/chaterSchemas';
import { ChaterForm } from 'src/features/chater/components/ChaterForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function ChaterFormSheet({
  chater,
  context,
  onCancel,
  onSuccess,
}: {
  chater?: Partial<ChaterWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (chater: ChaterWithRelationships) => void;
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
            {chater?.id
              ? context.dictionary.chater.edit.title
              : context.dictionary.chater.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <ChaterForm
            chater={chater}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
