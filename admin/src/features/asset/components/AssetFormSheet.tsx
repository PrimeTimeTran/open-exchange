import { AssetWithRelationships } from 'src/features/asset/assetSchemas';
import { AssetForm } from 'src/features/asset/components/AssetForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function AssetFormSheet({
  asset,
  context,
  onCancel,
  onSuccess,
}: {
  asset?: Partial<AssetWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (asset: AssetWithRelationships) => void;
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
            {asset?.id
              ? context.dictionary.asset.edit.title
              : context.dictionary.asset.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <AssetForm
            asset={asset}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
