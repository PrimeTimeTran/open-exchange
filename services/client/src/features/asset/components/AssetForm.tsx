import { zodResolver } from '@hookform/resolvers/zod';
import { Asset } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { AssetWithRelationships } from 'src/features/asset/assetSchemas';
import {
  assetCreateApiCall,
  assetUpdateApiCall,
} from 'src/features/asset/assetApiCalls';
import { AppContext } from 'src/shared/controller/appContext';
import { Button } from 'src/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'src/shared/components/ui/form';
import { toast } from 'src/shared/components/ui/use-toast';
import { getZodErrorMap } from 'src/translation/getZodErrorMap';
import { z } from 'zod';
import { assetCreateInputSchema } from 'src/features/asset/assetSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import { assetEnumerators } from 'src/features/asset/assetEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import { Switch } from 'src/shared/components/ui/switch';
import { Textarea } from 'src/shared/components/ui/textarea';

export function AssetForm({
  asset,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (asset: AssetWithRelationships) => void;
  asset?: Partial<AssetWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(asset?.id);

  const [initialValues] = React.useState({
    symbol: asset?.symbol || '',
    type: asset?.type || null,
    precision: asset?.precision || '',
    isFractional: asset?.isFractional || false,
    decimals: asset?.decimals || '',
    meta: asset?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(assetCreateInputSchema),
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  React.useEffect(() => {
    if (form.formState.isDirty) {
      setUnsavedChanges({
        message: dictionary.shared.unsavedChanges.message,
        dismissButtonLabel: dictionary.shared.unsavedChanges.dismiss,
        proceedLinkLabel: dictionary.shared.unsavedChanges.proceed,
        saveLabel: dictionary.shared.unsavedChanges.saveChanges,
        saveAction: () => form.handleSubmit(onSubmit)(),
      });
    } else {
      clearUnsavedChanges();
    }
  }, [form.formState.isDirty]);

  const mutation = useMutation({
    mutationFn: (data: z.input<typeof assetCreateInputSchema>) => {
      if (asset?.id) {
        return assetUpdateApiCall(asset.id, data);
      } else {
        return assetCreateApiCall(data);
      }
    },
    onSuccess: (asset: Asset) => {
      queryClient.invalidateQueries({
        queryKey: ['asset'],
      });

      onSuccess(asset);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.asset.edit.success
          : dictionary.asset.new.success,
      });
    },
    onError: (error: Error) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutateAsync(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
      >
        <div className="grid w-full gap-8">
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">
                    {dictionary.asset.fields.symbol}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
          {...field}
                  />

                  {dictionary.asset.hints.symbol ? (
                    <FormDescription>
                      {dictionary.asset.hints.symbol}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="symbol-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.asset.fields.type}</FormLabel>

                <SelectInput
                  options={Object.keys(assetEnumerators.type).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.asset.enumerators.type,
                        value,
                      ),
                    }),
                  )}
                  dictionary={dictionary}
                  isClearable={true}
                  disabled={mutation.isPending || mutation.isSuccess}
                  onChange={field.onChange}
                  value={field.value}
                />

                {dictionary.asset.hints.type ? (
                  <FormDescription>
                    {dictionary.asset.hints.type}
                  </FormDescription>
                ) : null}

                <FormMessage data-testid="type-error" />
              </FormItem>
            )}
          />
          </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="precision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.asset.fields.precision}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.asset.hints.precision ? (
                      <FormDescription>
                        {dictionary.asset.hints.precision}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="precision-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="isFractional"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={mutation.isPending || mutation.isSuccess}
                      />
                    </FormControl>
                    <FormLabel>
                      {dictionary.asset.fields.isFractional}
                    </FormLabel>
                  </div>

                  {dictionary.asset.hints.isFractional ? (
                    <FormDescription>
                      {dictionary.asset.hints.isFractional}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="isFractional-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="decimals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.asset.fields.decimals}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.asset.hints.decimals ? (
                      <FormDescription>
                        {dictionary.asset.hints.decimals}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="decimals-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="meta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.asset.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.asset.hints.meta ? (
                    <FormDescription>
                      {dictionary.asset.hints.meta}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="meta-error" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2">
            <Button
              disabled={mutation.isPending || mutation.isSuccess}
              type="submit"
            >
              {(mutation.isPending || mutation.isSuccess) && (
                <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {dictionary.shared.save}
            </Button>

            <Button
              disabled={mutation.isPending || mutation.isSuccess}
              type="button"
              variant={'secondary'}
              onClick={() => {
                clearUnsavedChanges();
                onCancel();
              }}
            >
              {dictionary.shared.cancel}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
