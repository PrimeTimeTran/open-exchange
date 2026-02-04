import { zodResolver } from '@hookform/resolvers/zod';
import { Instrument } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { InstrumentWithRelationships } from 'src/features/instrument/instrumentSchemas';
import {
  instrumentCreateApiCall,
  instrumentUpdateApiCall,
} from 'src/features/instrument/instrumentApiCalls';
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
import { instrumentCreateInputSchema } from 'src/features/instrument/instrumentSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { instrumentEnumerators } from 'src/features/instrument/instrumentEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import { Textarea } from 'src/shared/components/ui/textarea';
import { Input } from 'src/shared/components/ui/input';
import { AssetAutocompleteInput } from 'src/features/asset/components/AssetAutocompleteInput';

export function InstrumentForm({
  instrument,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (instrument: InstrumentWithRelationships) => void;
  instrument?: Partial<InstrumentWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(instrument?.id);

  const [initialValues] = React.useState({
    symbol: instrument?.symbol || '',
    type: instrument?.type || null,
    status: instrument?.status || null,
    underlyingAsset: instrument?.underlyingAsset || null,
    quoteAsset: instrument?.quoteAsset || null,
    meta: instrument?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(instrumentCreateInputSchema),
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
    mutationFn: (data: z.input<typeof instrumentCreateInputSchema>) => {
      if (instrument?.id) {
        return instrumentUpdateApiCall(instrument.id, data);
      } else {
        return instrumentCreateApiCall(data);
      }
    },
    onSuccess: (instrument: Instrument) => {
      queryClient.invalidateQueries({
        queryKey: ['instrument'],
      });

      onSuccess(instrument);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.instrument.edit.success
          : dictionary.instrument.new.success,
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
                  <FormLabel>
                    {dictionary.instrument.fields.symbol}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
          {...field}
                  />

                  {dictionary.instrument.hints.symbol ? (
                    <FormDescription>
                      {dictionary.instrument.hints.symbol}
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
                <FormLabel>{dictionary.instrument.fields.type}</FormLabel>

                <SelectInput
                  options={Object.keys(instrumentEnumerators.type).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.instrument.enumerators.type,
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

                {dictionary.instrument.hints.type ? (
                  <FormDescription>
                    {dictionary.instrument.hints.type}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.instrument.fields.status}</FormLabel>

                <SelectInput
                  options={Object.keys(instrumentEnumerators.status).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.instrument.enumerators.status,
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

                {dictionary.instrument.hints.status ? (
                  <FormDescription>
                    {dictionary.instrument.hints.status}
                  </FormDescription>
                ) : null}

                <FormMessage data-testid="status-error" />
              </FormItem>
            )}
          />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="underlyingAsset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.instrument.fields.underlyingAsset}</FormLabel>

                  <AssetAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.instrument.hints.underlyingAsset ? (
                    <FormDescription>
                      {dictionary.instrument.hints.underlyingAsset}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="underlyingAsset-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="quoteAsset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.instrument.fields.quoteAsset}</FormLabel>

                  <AssetAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.instrument.hints.quoteAsset ? (
                    <FormDescription>
                      {dictionary.instrument.hints.quoteAsset}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="quoteAsset-error" />
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
                    {dictionary.instrument.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.instrument.hints.meta ? (
                    <FormDescription>
                      {dictionary.instrument.hints.meta}
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
