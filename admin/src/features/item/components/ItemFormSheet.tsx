import { ItemWithRelationships } from 'src/features/item/itemSchemas';
import { ItemForm } from 'src/features/item/components/ItemForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function ItemFormSheet({
  item,
  context,
  onCancel,
  onSuccess,
}: {
  item?: Partial<ItemWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (item: ItemWithRelationships) => void;
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
            {item?.id
              ? context.dictionary.item.edit.title
              : context.dictionary.item.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <ItemForm
            item={item}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
