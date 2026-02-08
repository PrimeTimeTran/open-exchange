import { zodResolver } from '@hookform/resolvers/zod';
import { Fill } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { FillWithRelationships } from 'src/features/fill/fillSchemas';
import {
  fillCreateApiCall,
  fillUpdateApiCall,
} from 'src/features/fill/fillApiCalls';
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
import { fillCreateInputSchema } from 'src/features/fill/fillSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { fillEnumerators } from 'src/features/fill/fillEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import { Input } from 'src/shared/components/ui/input';
import { Textarea } from 'src/shared/components/ui/textarea';
import { TradeAutocompleteInput } from 'src/features/trade/components/TradeAutocompleteInput';

export function FillForm({
  fill,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (fill: FillWithRelationships) => void;
  fill?: Partial<FillWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(fill?.id);

  const [initialValues] = React.useState({
    side: fill?.side || null,
    price: fill?.price ? Number(fill?.price) : '',
    quantity: fill?.quantity ? Number(fill?.quantity) : '',
    fee: fill?.fee ? Number(fill?.fee) : '',
    trade: fill?.trade || null,
    meta: fill?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(fillCreateInputSchema),
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
    mutationFn: (data: z.input<typeof fillCreateInputSchema>) => {
      if (fill?.id) {
        return fillUpdateApiCall(fill.id, data);
      } else {
        return fillCreateApiCall(data);
      }
    },
    onSuccess: (fill: Fill) => {
      queryClient.invalidateQueries({
        queryKey: ['fill'],
      });

      onSuccess(fill);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.fill.edit.success
          : dictionary.fill.new.success,
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
            name="side"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="required">{dictionary.fill.fields.side}</FormLabel>

                <SelectInput
                  options={Object.keys(fillEnumerators.side).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.fill.enumerators.side,
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

                {dictionary.fill.hints.side ? (
                  <FormDescription>
                    {dictionary.fill.hints.side}
                  </FormDescription>
                ) : null}

                <FormMessage data-testid="side-error" />
              </FormItem>
            )}
          />
          </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">
                      {dictionary.fill.fields.price}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.fill.hints.price ? (
                      <FormDescription>
                        {dictionary.fill.hints.price}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="price-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">
                      {dictionary.fill.fields.quantity}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.fill.hints.quantity ? (
                      <FormDescription>
                        {dictionary.fill.hints.quantity}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="quantity-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.fill.fields.fee}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.fill.hints.fee ? (
                      <FormDescription>
                        {dictionary.fill.hints.fee}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="fee-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="trade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.fill.fields.trade}</FormLabel>

                  <TradeAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.fill.hints.trade ? (
                    <FormDescription>
                      {dictionary.fill.hints.trade}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="trade-error" />
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
                    {dictionary.fill.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.fill.hints.meta ? (
                    <FormDescription>
                      {dictionary.fill.hints.meta}
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
