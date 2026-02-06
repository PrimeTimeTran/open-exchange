import { ListingWithRelationships } from 'src/features/listing/listingSchemas';
import { ListingForm } from 'src/features/listing/components/ListingForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function ListingFormSheet({
  listing,
  context,
  onCancel,
  onSuccess,
}: {
  listing?: Partial<ListingWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (listing: ListingWithRelationships) => void;
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
            {listing?.id
              ? context.dictionary.listing.edit.title
              : context.dictionary.listing.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <ListingForm
            listing={listing}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
